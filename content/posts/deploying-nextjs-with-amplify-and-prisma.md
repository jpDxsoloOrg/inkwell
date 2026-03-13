---
title: "Deploying a Next.js App with AWS Amplify, Prisma, and Neon PostgreSQL"
tags: ["aws", "amplify", "prisma", "neon", "nextjs", "devops", "deployment"]
published: true
excerpt: "A practical guide to deploying a Next.js + Prisma app on AWS Amplify with Neon PostgreSQL , including the migration pitfalls I hit and how I debugged them."
---

## Why Amplify?

When I started building **DxPress** a WordPress clone powered by Next.js, Prisma, and PostgreSQL , I needed a hosting solution that could handle server-side rendering without me managing infrastructure. AWS Amplify Gen 2 fits that bill: push your code, and it builds and deploys a full-stack Next.js app with SSR support out of the box.

But getting there wasn't entirely smooth. This post covers how I set up the deployment pipeline, the specific build failures I ran into when adding a new database field , and the kind of issues that don't show up in tutorials but will absolutely bite you in production.

## The Stack

- **Next.js 14+** with the App Router
- **Prisma ORM** with PostgreSQL
- **Neon** serverless PostgreSQL (connection pooling via PgBouncer)
- **AWS Amplify** for CI/CD and hosting
- **S3** for media uploads

## Setting Up Amplify

### Connecting Your Repo

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **New app** > **Host web app**
3. Connect your GitHub repository and select the branch (e.g., `main`)
4. Amplify auto-detects Next.js and suggests a build config but you'll want to customize it

### The `amplify.yml` Build Spec

Amplify uses an `amplify.yml` file at the root of your project to define build phases. Here's what mine looks like after the fixes I'll describe below:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npx prisma generate
        - npx prisma migrate deploy
    build:
      commands:
        - env | grep -E '^(DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL|S3_)' | sed 's/=.*/=****/' || true
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

Key points:

- **`npx prisma generate`** generates the Prisma Client so your code can talk to the database
- **`npx prisma migrate deploy`** applies any pending migrations to the production database , this was the missing piece that caused my first failure
- The `env | grep ...` line is a debug helper: it logs which env vars are set (values masked) so you can verify your Amplify environment config without leaking secrets
- Artifacts point to `.next/` because Amplify's Next.js SSR support serves from the built output there

### Environment Variables vs. Secrets in Amplify

Amplify gives you two places to store configuration: **Environment variables** and **Secrets**. The difference matters. Environment variables are stored in plaintext and visible to anyone with console access. Secrets are encrypted with AWS Systems Manager (SSM Parameter Store) and masked in the UI and build logs.

**Rule of thumb**: if the value would be dangerous in the wrong hands: database credentials, API keys, signing secrets then it belongs in Secrets, not Environment variables.

Here's how I split my configuration:

#### Environment Variables (App settings > Environment variables)

These are non-sensitive configuration values that are safe to store in plaintext:

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | Your production URL (e.g., `https://dxpress.example.com`) |
| `S3_BUCKET` | S3 bucket name for media uploads |
| `S3_REGION` | AWS region for S3 |

#### Secrets (App settings > Secrets)

These contain credentials, connection strings, and signing keys , anything that could be exploited if exposed:

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Neon pooled connection string (contains password) |
| `DIRECT_DATABASE_URL` | Neon direct connection string (contains password) |
| `NEXTAUTH_SECRET` | Secret key for signing JWT sessions |
| `S3_ACCESS_KEY` | IAM access key for S3 |
| `S3_SECRET_KEY` | IAM secret key for S3 |

The distinction between `DATABASE_URL` and `DIRECT_DATABASE_URL` is critical more on that below.

### Moving Secrets Out of Environment Variables

If you originally put sensitive values in Environment variables (like I did), here's how to move them to Secrets and why you should also rotate them.

#### Step 1: Add the values as Secrets

1. In the Amplify Console, navigate to your app
2. Go to **App settings > Secrets**
3. Click **Manage secrets**
4. For each secret, click **Add secret**, enter the key name (e.g., `DATABASE_URL`) and the value
5. Click **Save**

Amplify stores these in AWS Systems Manager Parameter Store as `SecureString` parameters, encrypted with your account's KMS key.

#### Step 2: Reference secrets in `amplify.yml`

Secrets aren't automatically injected as environment variables the way Environment variables are. You need to explicitly make them available in your build spec. Update your `amplify.yml` to reference them:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npx prisma generate
        - npx prisma migrate deploy
    build:
      commands:
        - env | grep -E '^(DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL|S3_)' | sed 's/=.*/=****/' || true
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

For Amplify Gen 2 (SSR/Next.js), secrets added through the console are automatically available as environment variables during both the build phase and at runtime. You don't need extra configuration just make sure the secret key names match what your code expects.

#### Step 3: Remove the old Environment variables

1. Go to **App settings > Environment variables**
2. Delete the entries for `DATABASE_URL`, `DIRECT_DATABASE_URL`, `NEXTAUTH_SECRET`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY`
3. Leave the non-sensitive variables (`NEXTAUTH_URL`, `S3_BUCKET`, `S3_REGION`) in place

#### Step 4: Rotate your credentials

**This is the step people skip, and it's the most important one.**

If a secret was stored as a plaintext Environment variable even briefly then you should treat it as potentially compromised. Environment variable values are visible in the Amplify Console, may appear in build logs, and are stored without encryption. Anyone with console access could have seen them.

**What to rotate:**

- **Neon database password**: Go to the Neon dashboard, reset the password for your database role, and update both `DATABASE_URL` and `DIRECT_DATABASE_URL` secrets in Amplify with the new connection strings
- **`NEXTAUTH_SECRET`**: Generate a new random value (e.g., `openssl rand -base64 32`) and update the secret in Amplify. Existing user sessions will be invalidated and users will need to log in again
- **S3 IAM credentials**: In the AWS IAM Console, go to the IAM user, create a new access key pair, update `S3_ACCESS_KEY` and `S3_SECRET_KEY` in Amplify Secrets, then deactivate and delete the old key pair

After updating, trigger a new build to verify everything still works with the rotated credentials.

#### Step 5: Verify the migration

Trigger a build and check the logs. The masked `env | grep` line in the build spec should still show your variable names (confirming they're set) without values. If any of them are missing, double-check that the secret key names match exactly.

## Checking Builds and Debugging Failures

### Monitoring Builds

When you push to your connected branch, Amplify kicks off a build automatically. To check on it:

1. **Amplify Console**: Navigate to your app, and click on the branch. You'll see a build pipeline with phases: Provision, Build, Deploy, Verify. Each phase expands to show logs.
2. **Build Logs**: Click into a build and expand the **Build** phase. This is where you'll see your `amplify.yml` commands executing. Errors show up here in red.
3. **Notifications**: Set up email or Slack notifications under **App settings > Notifications** so you don't have to keep checking manually.

### Common Debugging Steps

When a build fails:

1. **Read the build log from the bottom up**: the actual error is usually near the end, buried under npm output
2. **Check if it's a build-time vs. runtime issue**: if `npm run build` fails, Next.js might be trying to execute server code at build time (like database queries in pages that should be dynamic)
3. **Verify environment variables**: the masked `env | grep` line in my build spec helps confirm vars are set. Missing env vars are a silent killer
4. **Test locally with production build**: run `npm run build` locally with your production env vars to reproduce the issue before pushing another commit

## The Migration That Broke Everything

Here's the real story. I added a "years of experience" feature to the homepage. The implementation was simple:

1. Add a `careerStartDate` field to the `SiteConfig` model in Prisma
2. Create a migration: `npx prisma migrate dev --name add_career_start_date`
3. Calculate years dynamically in the homepage component
4. Add a date picker in the admin settings form

The migration SQL was trivial:

```sql
ALTER TABLE "site_configs" ADD COLUMN "careerStartDate" TIMESTAMP(3);
```

Locally, everything worked. I pushed to `main`, Amplify built it, and... the app crashed.

### Failure #1: Migrations Weren't Running

My original `amplify.yml` only had `npx prisma generate` in the preBuild phase. That generates the TypeScript client but **doesn't apply schema changes to the database**. The production Neon database still had the old schema , no `careerStartDate` column , so any query touching that field failed at runtime.

**The fix**: Add `npx prisma migrate deploy` to the preBuild phase. This runs pending migrations against the production database before the build starts.

```yaml
preBuild:
  commands:
    - npm ci
    - npx prisma generate
    - npx prisma migrate deploy    # <-- THIS WAS MISSING
```

### Failure #2: Neon's Connection Pooler Blocks Migrations

After adding `migrate deploy`, the build failed again , but with a different error this time. Prisma's migration engine needs advisory locks to safely coordinate migrations, and **Neon's connection pooler (PgBouncer) doesn't support advisory locks**.

My `DATABASE_URL` pointed to Neon's pooled endpoint (port `5432` with the `-pooler` suffix in the hostname). That's the right connection for runtime queries and it's faster and handles connection scaling. But migrations need a direct connection.

**The fix**: Use Prisma's `directUrl` feature. In `schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")         // pooled  used at runtime
  directUrl = env("DIRECT_DATABASE_URL")  // direct  used for migrations
}
```

Then in Amplify's environment variables, set `DIRECT_DATABASE_URL` to Neon's direct (non-pooled) connection string. You can find this in the Neon dashboard it's the connection string without `-pooler` in the hostname.

### Failure #3: Build-Time Database Queries

One more surprise: the `npm run build` step was also failing. Next.js was trying to statically generate my RSS feed route (`/feed.xml`), which queries the database for posts. At build time, the database connection worked, but the static generation approach meant Next.js was baking the feed content into the build output instead of generating it on each request.

**The fix**: Mark the route as dynamic:

```typescript
// app/feed.xml/route.ts
export const dynamic = "force-dynamic";
```

This tells Next.js to always render this route at request time, not at build time. Problem solved.

## Lessons Learned

1. **Always run migrations in CI/CD.** `prisma generate` is not enough you need `prisma migrate deploy` to apply schema changes to your production database.

2. **Know your connection types.** If you're using a connection pooler (Neon, Supabase, PgBouncer), you need a separate direct connection for migrations. Prisma's `directUrl` makes this painless.

3. **Watch out for build-time data fetching.** Next.js will try to statically generate pages that fetch data at the top level. If those pages query a database, they'll fail at build time (or worse, succeed with stale data). Use `export const dynamic = "force-dynamic"` for routes that need fresh data.

4. **Use Secrets, not Environment variables, for sensitive values.** Amplify's Environment variables are stored in plaintext. Database passwords, API keys, and signing secrets belong in Amplify Secrets (backed by SSM Parameter Store). If you stored secrets as environment variables, even temporarily, rotate those credentials immediately.

5. **Add observability to your build.** Even a simple `env | grep` command that logs which variables are set (without values) saves time when debugging missing configuration.

6. **Test with `npm run build` locally.** Don't rely on Amplify to be your first feedback loop. Build locally with production env vars to catch issues before they hit your pipeline.

## The Three-Commit Fix

In the end, the full fix was three commits:

1. **Add the feature**: new Prisma field, migration, UI components
2. **Fix the build pipeline**: add `prisma migrate deploy` to `amplify.yml` and mark `feed.xml` as dynamic
3. **Fix the connection**: add `directUrl` to the Prisma schema for Neon pooler compatibility

Each commit fixed one layer of the problem. The feature itself was straightforward, it was the deployment pipeline that needed the real engineering.

## Quick Reference: Amplify + Prisma + Neon Checklist

- [ ] `amplify.yml` includes both `prisma generate` AND `prisma migrate deploy`
- [ ] `DATABASE_URL` env var points to the pooled Neon connection
- [ ] `DIRECT_DATABASE_URL` env var points to the direct Neon connection
- [ ] Prisma schema has `directUrl = env("DIRECT_DATABASE_URL")`
- [ ] Sensitive values (DB passwords, API keys, signing secrets) are stored in **Secrets**, not Environment variables
- [ ] Credentials that were previously in plaintext Environment variables have been **rotated**
- [ ] Routes that query the database at the top level are marked `dynamic = "force-dynamic"` if they shouldn't be statically generated
- [ ] Build logs are checked after each deployment for warnings
- [ ] `npm run build` succeeds locally before pushing

# DxPress

A modern WordPress clone built with Next.js, TypeScript, PostgreSQL, and Prisma.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js (Credentials provider, JWT sessions)
- **Editor**: Tiptap rich text editor
- **Storage**: S3-compatible (AWS S3 / MinIO for local dev)
- **DevOps**: Docker (PostgreSQL + MinIO)

## Features (MVP)

- Posts with rich text editing, categories, tags, and featured images
- Static pages with slug-based routing
- Media library with drag-and-drop uploads
- User authentication with role-based access (Admin/Editor/Author)
- Clean, responsive public blog layout
- SEO basics: meta tags, sitemaps, RSS feed
- Admin dashboard with content management

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL + MinIO)

### Local Development

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Start local services (PostgreSQL + MinIO):
   ```bash
   docker compose up -d
   ```
3. Copy `.env.example` to `.env.local` and fill in values:
   ```bash
   cp .env.example .env.local
   ```
4. Run database migrations and seed:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file with:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth.js (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g., `http://localhost:3000`) |
| `S3_ENDPOINT` | S3-compatible endpoint (MinIO: `http://localhost:9000`) |
| `S3_BUCKET` | Bucket name for uploads |
| `S3_ACCESS_KEY` | S3 access key |
| `S3_SECRET_KEY` | S3 secret key |

See `.env.example` for a complete list with defaults.

## Deployment

Production is hosted on **AWS Amplify** with **Neon** (serverless PostgreSQL).

- Pushing to `main` triggers an automatic Amplify build (~4 minutes).
- Database: Neon serverless PostgreSQL (free tier suspends after inactivity; first requests may be slow due to cold starts).

### Required Production Environment Variables

Set these in the Amplify console under Environment Variables:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` — signing secret
- `NEXTAUTH_URL` — production URL
- S3 config: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`

### Check Build Status

```bash
aws amplify list-jobs --app-id <APP_ID> --branch-name main --max-items 3
```

### Known Issues

- **Neon cold starts**: Free-tier Neon suspends after inactivity. First requests after idle periods may time out. The app has error boundaries with auto-retry to handle this.

For an alternative ECS Fargate deployment, see [docs/deployment-aws.md](docs/deployment-aws.md).

## License

MIT

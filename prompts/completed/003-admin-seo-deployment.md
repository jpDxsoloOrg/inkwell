<objective>
Build the admin dashboard for content management, add SEO optimization, and prepare the site for AWS deployment. This is the final prompt that makes the portfolio fully functional and production-ready.

The admin panel is critical — it's what makes this "WordPress-like." The owner should be able to create, edit, and publish blog posts and projects entirely through the browser with a markdown editor, without touching code.
</objective>

<context>
Prompts 001 and 002 have been executed. The project now has:
- Full Next.js 14+ project with TypeScript, Tailwind CSS, PostgreSQL/Prisma
- All public pages: Home, Blog (listing + [slug]), Projects (listing + [slug]), Resume, About
- MDX rendering system with code syntax highlighting
- Data access layer in lib/data/
- NextAuth.js configured with admin route protection via middleware
- Seed data in the database
- Dark/light mode support

Read CLAUDE.md for project conventions.
Examine the existing codebase thoroughly before making changes — build on what exists.
</context>

<requirements>
Consider multiple approaches for each feature and choose the most maintainable solution.

### 1. Admin Dashboard (`app/admin/`)

**Dashboard home** (`app/admin/page.tsx`):
- Overview stats: total posts (published/draft), total projects, recent activity
- Quick links to create new post, new project
- Clean admin layout distinct from public site

**Admin Layout** (`app/admin/layout.tsx`):
- Sidebar navigation: Dashboard, Posts, Projects, Resume, Site Settings
- Top bar with user info and logout button
- Responsive — sidebar collapses to hamburger on mobile

### 2. Blog Post Management

**Post list** (`app/admin/posts/page.tsx`):
- Table of all posts (published and drafts) with title, status, date, actions
- Quick actions: edit, publish/unpublish, delete
- Search and filter by status

**Post editor** (`app/admin/posts/new/page.tsx` and `app/admin/posts/[id]/edit/page.tsx`):
- Form fields: title (auto-generates slug), excerpt, cover image URL, tags (multi-select), published toggle
- **Markdown editor** — use a split-pane layout:
  - Left: textarea with markdown input (monospace font, tab support)
  - Right: live preview rendered through the same MdxContent component used on the public site
  - This way the author sees exactly how code blocks and formatting will look
- Install and use `@uiw/react-md-editor` or build a simpler custom split-pane editor
- Tag management: select existing tags or create new ones inline
- Save as draft or publish immediately
- Auto-save draft to localStorage as backup (recover on page load)

**API routes for posts** (`app/api/posts/`):
- `POST /api/posts` — create new post
- `PUT /api/posts/[id]` — update post
- `DELETE /api/posts/[id]` — delete post
- `PATCH /api/posts/[id]/publish` — toggle publish status
- All routes protected — verify NextAuth session

### 3. Project Management

**Project list** (`app/admin/projects/page.tsx`):
- Table of all projects with title, featured status, sort order, actions

**Project editor** (`app/admin/projects/new/page.tsx` and `app/admin/projects/[id]/edit/page.tsx`):
- Form: title, slug, description, content (markdown editor with preview), cover image URL, GitHub URL, live URL, tech stack (comma-separated or tag-like input), featured toggle, sort order
- Same split-pane markdown editor as blog posts

**API routes for projects** (`app/api/projects/`):
- CRUD routes similar to posts, all auth-protected

### 4. Resume Editor

**Resume editor** (`app/admin/resume/page.tsx`):
- Full-page markdown editor with live preview
- Single "Save" button — updates the singleton Resume row
- Preview shows exactly how the public resume page will look

**API route**: `PUT /api/resume` — update resume content

### 5. Site Settings

**Settings page** (`app/admin/settings/page.tsx`):
- Edit SiteConfig fields: site name, description, owner name, title, bio, social links, avatar URL
- Simple form with save button

**API route**: `PUT /api/site-config` — update site config

### 6. Image Uploads (S3-Compatible)

Create a reusable image upload component and API:
- `components/admin/ImageUpload.tsx` — drag-and-drop or click to upload, shows preview
- `app/api/upload/route.ts` — handles upload to S3-compatible storage
- Use `@aws-sdk/client-s3` with presigned URLs or direct upload
- For local dev: configure MinIO in docker-compose.yml (add MinIO service on port 9000, console on 9001)
- Env vars: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`
- Store the public URL in the database (coverImage fields)

### 7. SEO Optimization

**Metadata** — add proper metadata to all pages:
- `app/layout.tsx`: default site metadata from SiteConfig
- `app/blog/[slug]/page.tsx`: dynamic metadata (title, description, OG image from post)
- `app/projects/[slug]/page.tsx`: dynamic metadata from project
- Use Next.js `generateMetadata` function on each page

**Sitemap** (`app/sitemap.ts`):
- Auto-generated sitemap including all published posts and projects
- Use Next.js built-in sitemap generation

**RSS Feed** (`app/feed.xml/route.ts`):
- RSS 2.0 feed of published blog posts
- Proper XML with title, description, link, pubDate for each item

**robots.txt** (`app/robots.ts`):
- Allow all crawlers, reference sitemap URL

**Structured data**:
- JSON-LD for blog posts (Article schema)
- JSON-LD for the person/developer (Person schema on about page)

### 8. Performance & Polish

- Add `loading.tsx` files for routes that fetch data (skeleton loaders)
- Optimize images: use `next/image` where possible, add proper alt text
- Add `not-found.tsx` custom 404 page
- Add `error.tsx` error boundary pages
- Ensure all interactive components have proper loading/disabled states
- Add page transitions or subtle animations (keep it professional, not flashy)

### 9. AWS Deployment Preparation

Create deployment documentation and configuration:
- `./docs/deployment-aws.md` with step-by-step AWS deployment guide
- Option A: AWS Amplify (simplest — auto-detects Next.js)
- Option B: Docker + ECS/Fargate (create a `Dockerfile` and `docker-compose.prod.yml`)
- Create a production-ready `Dockerfile` (multi-stage build, Node.js 20 Alpine)
- Create `.dockerignore`
- Document required AWS services: RDS PostgreSQL, S3 bucket, (optional) CloudFront
- Document all required environment variables for production

### 10. User Setup / First-Run Experience

Create `prisma/seed-admin.ts`:
- Creates the initial admin user (email: admin@example.com, password: hashed)
- Creates default SiteConfig with placeholder values
- Creates empty Resume row
- Document in README how to change admin credentials
</requirements>

<constraints>
- Maximum 300 lines per file — split into modules
- All API routes must verify NextAuth session — no unprotected write endpoints
- The markdown editor must show a live preview that matches the public site rendering exactly
- Admin pages use "use client" as needed but keep data fetching in server components where possible
- Do NOT over-engineer the admin UI — functional and clean is better than fancy
- Image upload should work with both MinIO (local) and AWS S3 (production) via env vars only
- No hardcoded URLs or secrets — everything via environment variables
</constraints>

<output>
Key files to create/modify:
- `./app/admin/layout.tsx` — admin layout with sidebar
- `./app/admin/page.tsx` — dashboard
- `./app/admin/posts/*` — post list, new, edit pages
- `./app/admin/projects/*` — project list, new, edit pages
- `./app/admin/resume/page.tsx` — resume editor
- `./app/admin/settings/page.tsx` — site settings
- `./app/admin/login/page.tsx` — login page (may already exist)
- `./app/api/posts/` — CRUD API routes
- `./app/api/projects/` — CRUD API routes
- `./app/api/resume/route.ts`
- `./app/api/site-config/route.ts`
- `./app/api/upload/route.ts`
- `./components/admin/` — admin-specific components (MarkdownEditor, ImageUpload, Sidebar, etc.)
- `./app/sitemap.ts`
- `./app/robots.ts`
- `./app/feed.xml/route.ts`
- `./app/not-found.tsx`
- `./app/loading.tsx` and route-specific loading files
- `./Dockerfile`
- `./docker-compose.yml` — update to add MinIO service
- `./.dockerignore`
- `./prisma/seed-admin.ts`
- `./docs/deployment-aws.md`

After creating all files:
1. Run `npm run build` to verify compilation
2. Run `docker compose up -d` (should start PostgreSQL + MinIO)
3. Run `npx prisma migrate dev` if schema changed
4. Test admin login flow
5. Test creating a blog post with code blocks via the admin editor
6. Test image upload to MinIO
7. Verify SEO: check page metadata, test sitemap route, test RSS feed route
8. Fix any errors before completing
</output>

<verification>
Before declaring complete, verify:
1. `npm run build` succeeds with zero errors
2. Admin login works (redirect to dashboard after auth)
3. Can create a new blog post with markdown + code blocks via the admin UI
4. Live preview in editor matches public post rendering
5. Can create/edit/delete projects via admin
6. Can edit resume via admin with live preview
7. Can update site settings via admin
8. Image upload works with MinIO locally
9. `/sitemap.xml` returns valid XML with all published content
10. `/feed.xml` returns valid RSS with blog posts
11. SEO metadata renders correctly (check with View Source)
12. 404 page renders for invalid routes
13. All API routes return 401 for unauthenticated requests
14. Docker build succeeds: `docker build -t dxpress .`
</verification>

<success_criteria>
- Complete admin CMS: create, edit, publish, delete blog posts and projects
- Markdown editor with live preview matching public rendering
- Code blocks in admin preview look identical to the public site
- Image uploads work via S3-compatible storage
- Full SEO: metadata, sitemap, RSS, structured data, robots.txt
- Production-ready Dockerfile builds successfully
- All API routes are auth-protected
- `npm run build` passes cleanly
- The admin experience is intuitive — a developer can manage their portfolio without touching code
</success_criteria>

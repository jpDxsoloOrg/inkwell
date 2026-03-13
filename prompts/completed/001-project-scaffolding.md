<objective>
Scaffold a professional developer portfolio website using Next.js 14+ (App Router), TypeScript, Tailwind CSS, PostgreSQL, and Prisma. This is the foundation — all subsequent work builds on this scaffolding.

The end goal is a production-ready developer portfolio that showcases the owner as an expert developer. It will be deployed to AWS. This prompt sets up the project structure, database schema, styling foundation, and base layout.
</objective>

<context>
This is a greenfield Next.js project in the current directory. Only a README.md and .gitignore exist.

Read CLAUDE.md for project conventions and tech stack details.

Tech stack:
- Next.js 14+ with App Router and TypeScript
- Tailwind CSS for styling
- PostgreSQL with Prisma ORM for content storage (blog posts, projects, resume data)
- NextAuth.js for admin authentication (Credentials provider, JWT sessions)
- Deployment target: AWS (likely via SST, Amplify, or containerized ECS — keep deployment-agnostic for now but ensure env vars are externalized)
</context>

<requirements>
Thoroughly analyze the needs of a developer portfolio with database-backed content management, then implement the following:

1. **Initialize Next.js project** in the current directory (not a subdirectory):
   - Next.js 14+ with App Router, TypeScript, Tailwind CSS, ESLint
   - Configure `next.config.js` for MDX support (we'll use MDX for rendering stored markdown content)
   - Set up path aliases (`@/` for root imports)

2. **Install and configure all dependencies**:
   - `prisma` + `@prisma/client` for database
   - `next-auth` for admin auth
   - `next-mdx-remote` for rendering markdown/MDX content stored in the database
   - `rehype-pretty-code` + `shiki` for VS Code-quality code syntax highlighting
   - `rehype-slug` + `rehype-autolink-headings` for heading anchors in blog posts
   - `remark-gfm` for GitHub Flavored Markdown (tables, strikethrough, task lists)
   - `gray-matter` if needed for frontmatter parsing
   - `date-fns` for date formatting
   - `lucide-react` for icons
   - `tailwindcss-typography` (`@tailwindcss/typography`) for beautiful prose styling

3. **Prisma schema** (`prisma/schema.prisma`):
   Define models for a developer portfolio CMS:

   ```
   User         — id, email, password (hashed), name, role (ADMIN), createdAt
   Post         — id, title, slug (unique), content (markdown text), excerpt, coverImage, published (bool), publishedAt, createdAt, updatedAt, authorId, tags (relation)
   Tag          — id, name, slug (unique), posts (relation)
   Project      — id, title, slug (unique), description, content (markdown), coverImage, githubUrl, liveUrl, techStack (String[]), featured (bool), sortOrder, createdAt, updatedAt
   Resume       — id, content (markdown — full resume as markdown), updatedAt (singleton row pattern)
   SiteConfig   — id, siteName, siteDescription, ownerName, ownerTitle, ownerBio, avatarUrl, githubUrl, linkedinUrl, twitterUrl, email, updatedAt (singleton row)
   ```

   Use many-to-many for Post ↔ Tag. Add appropriate indexes on slug fields.

4. **Database setup**:
   - Create a `docker-compose.yml` with PostgreSQL 16 service (port 5432, db name `dxpress`, user `dxpress`, password `dxpress_dev`)
   - Create `.env.example` with all required env vars (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, AWS S3 placeholders)
   - Add `.env` to .gitignore (should already be there)

5. **Tailwind CSS configuration**:
   - Configure `@tailwindcss/typography` plugin for beautiful markdown/prose rendering
   - Set up a professional color palette: neutral grays + one accent color (blue or indigo)
   - Configure dark mode support (class-based strategy)
   - Set up custom font configuration: use `Inter` for body text and `JetBrains Mono` for code via `next/font`

6. **Base layout** (`app/layout.tsx`):
   - Root layout with metadata, fonts, and theme provider
   - Responsive navigation header: site name/logo on left, nav links on right (Home, Blog, Projects, Resume, About)
   - Mobile hamburger menu
   - Footer with social links and copyright
   - Create reusable layout components in `components/layout/`:
     - `Header.tsx` — responsive nav with mobile menu
     - `Footer.tsx` — social links, copyright
     - `ThemeProvider.tsx` — dark/light mode context (use `next-themes`)
     - `Container.tsx` — max-width content wrapper

7. **NextAuth.js setup**:
   - Configure in `app/api/auth/[...nextauth]/route.ts`
   - Credentials provider (email + password)
   - JWT session strategy
   - Protect admin routes via middleware (`middleware.ts`) — any route under `/admin/*` requires auth

8. **Project structure** — organize files cleanly:
   ```
   app/
     layout.tsx              # Root layout
     page.tsx                # Home page (placeholder)
     blog/
       page.tsx              # Blog listing (placeholder)
       [slug]/page.tsx       # Individual post (placeholder)
     projects/
       page.tsx              # Projects listing (placeholder)
       [slug]/page.tsx       # Individual project (placeholder)
     resume/
       page.tsx              # Resume page (placeholder)
     about/
       page.tsx              # About/contact (placeholder)
     admin/
       layout.tsx            # Admin layout
       page.tsx              # Admin dashboard (placeholder)
       login/page.tsx        # Login page
     api/
       auth/[...nextauth]/route.ts
   components/
     layout/                 # Header, Footer, ThemeProvider, Container
     ui/                     # Reusable UI components (Button, Card, etc.)
     blog/                   # Blog-specific components (placeholder dir)
     projects/               # Project-specific components (placeholder dir)
   lib/
     prisma.ts               # Prisma client singleton
     auth.ts                 # NextAuth config export
     utils.ts                # Utility functions
   prisma/
     schema.prisma
   ```

9. **Prisma client singleton** (`lib/prisma.ts`):
   - Standard Next.js pattern to prevent multiple instances in development

10. **Environment validation**:
    - Validate required env vars at build time or startup — fail fast if DATABASE_URL or NEXTAUTH_SECRET is missing
</requirements>

<constraints>
- Maximum 300 lines per file — split larger files into modules
- Use Server Components by default; only add "use client" where interactivity is required (theme toggle, mobile menu, forms)
- No inline styles — Tailwind classes only
- No `any` in TypeScript — use proper types
- All placeholder pages should have minimal but real content (a heading and brief text), not empty components
- Do NOT install or configure deployment tooling yet — that comes in prompt 003
- Do NOT create seed data yet — that comes in prompt 002
- Keep the Prisma schema clean — do NOT add fields "just in case"
</constraints>

<output>
All files should be created with relative paths from the project root (`./`).

Key files to create:
- `./package.json` (via npx create-next-app or manual setup)
- `./prisma/schema.prisma`
- `./docker-compose.yml`
- `./app/layout.tsx` and all route placeholders
- `./components/layout/*`
- `./lib/prisma.ts`, `./lib/auth.ts`, `./lib/utils.ts`
- `./middleware.ts`
- `./.env.example`
- `./tailwind.config.ts` (with typography plugin and custom theme)

After creating all files, run:
1. `npm install` to install all dependencies
2. `npx prisma generate` to generate the Prisma client
3. `npm run build` to verify everything compiles without errors

Fix any build errors before completing.
</output>

<verification>
Before declaring complete, verify:
1. `npm run build` succeeds with zero errors
2. `npx prisma validate` passes (schema is valid)
3. All TypeScript files compile without errors
4. The layout renders correctly (header, footer, navigation)
5. Dark/light mode toggle works
6. All route placeholders are accessible
7. Middleware redirects unauthenticated users from /admin/* to /admin/login
</verification>

<success_criteria>
- Clean Next.js project with all dependencies installed
- Valid Prisma schema with all content models
- Docker Compose for local PostgreSQL
- Professional base layout with responsive navigation and dark mode
- NextAuth.js configured with admin route protection
- All placeholder pages render without errors
- `npm run build` passes cleanly
</success_criteria>

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DxPress** is a modern WordPress clone built with Next.js, TypeScript, PostgreSQL, and Prisma. The project is in early development — see GitHub Issues for the roadmap.

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (Credentials provider, JWT sessions)
- **Rich Text Editor**: Tiptap
- **File Storage**: S3-compatible (AWS S3 in prod, MinIO for local dev)
- **Local Dev Services**: Docker (PostgreSQL + MinIO)

## Architecture

This is a monolithic Next.js app using the App Router pattern:
- `app/` — routes, layouts, pages (file-based routing)
- `app/api/` — API route handlers (REST endpoints)
- `prisma/schema.prisma` — database schema and migrations
- Public blog pages use slug-based routing; admin pages are auth-protected

### Key Architectural Decisions
- Next.js API Routes for backend (no separate server)
- Prisma for all database access (no raw SQL)
- JWT sessions via NextAuth.js (not database sessions)
- S3-compatible storage abstraction (swap MinIO ↔ AWS S3 via env vars)
- Three user roles: Admin, Editor, Author

## MVP Features

- Posts: rich text editing, categories, tags, featured images
- Pages: static pages with slug-based routing
- Media library: drag-and-drop uploads
- Auth: role-based access control (Admin/Editor/Author)
- Public blog: responsive layout with SEO (meta tags, sitemaps, RSS)
- Admin dashboard: content management

## Common Commands

```bash
# Install dependencies
npm install

# Start local dev services (PostgreSQL + MinIO)
docker compose up -d

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Run a single test file
npm test -- path/to/test.ts
```

## Environment Variables

Local env goes in `.env.local` (git-ignored). Expected variables:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — NextAuth.js signing secret
- `NEXTAUTH_URL` — App URL (e.g., `http://localhost:3000`)
- S3/MinIO config: endpoint, bucket, access key, secret key

## Code Style

- TypeScript for all code — no `any`, use specific types or `unknown`
- Next.js App Router conventions (server components by default, `"use client"` only when needed)
- Tailwind CSS for styling (no inline styles, no CSS modules)
- Async/await over promise chains
- Descriptive variable names

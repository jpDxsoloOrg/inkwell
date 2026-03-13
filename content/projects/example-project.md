---
title: "DxPress Test Project"
description: "A modern WordPress clone built with Next.js, TypeScript, PostgreSQL, and Prisma."
techStack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS", "AWS Amplify"]
githubUrl: "https://github.com/jpdxsoloorg/dxpress"
liveUrl: "https://www.jpdxsolo.com"
featured: true
sortOrder: 1
---

## Overview

DxPress is a modern blogging and portfolio platform built from scratch as a WordPress alternative. It uses the Next.js App Router with server components, Prisma ORM for database access, and is deployed on AWS Amplify with a Neon serverless PostgreSQL database.

## Key Features

- **Rich Markdown Editing** — Write posts in markdown with live preview and syntax highlighting
- **Media Library** — Drag-and-drop image uploads to S3-compatible storage
- **Role-Based Auth** — Admin authentication via NextAuth.js with JWT sessions
- **SEO Optimized** — Meta tags, sitemaps, and RSS feed generation
- **Tag System** — Organize posts with tags, create tags on the fly
- **Project Portfolio** — Showcase projects with tech stack, links, and featured sorting

## Architecture

Built as a monolithic Next.js application using the App Router pattern. API routes handle all backend logic, Prisma manages database access, and S3-compatible storage handles media uploads (MinIO for local dev, AWS S3 in production).

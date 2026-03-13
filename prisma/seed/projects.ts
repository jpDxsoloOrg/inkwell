export const projectsData = [
  {
    title: "DxPress",
    slug: "dxpress",
    description: "A modern developer portfolio and blog platform built with Next.js 14, Prisma, and PostgreSQL. Features MDX rendering with syntax highlighting, dark mode, and a full admin panel.",
    techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS"],
    githubUrl: "https://github.com/username/dxpress",
    liveUrl: "https://dxpress.dev",
    featured: true,
    sortOrder: 1,
    content: `## Overview

DxPress is a full-featured developer portfolio platform that I built to showcase my work and writing. It features server-side rendering, MDX blog posts with syntax highlighting, and a complete admin panel for content management.

## Key Features

- **MDX Blog Engine** with syntax highlighting via Shiki, supporting 100+ languages
- **Project Showcase** with filterable tech stack badges
- **Resume Page** with print-to-PDF support
- **Admin Dashboard** for managing all content
- **Dark Mode** with system preference detection
- **Responsive Design** that works on all devices

## Technical Decisions

I chose Next.js 14 with the App Router for its server component support, which keeps the JavaScript bundle small while enabling direct database access in components. Prisma provides type-safe database queries, and Tailwind CSS makes styling consistent and maintainable.

The MDX rendering pipeline uses \`next-mdx-remote\` with rehype plugins for code highlighting, heading anchors, and GFM support.
`,
  },
  {
    title: "CloudDeploy CLI",
    slug: "clouddeploy-cli",
    description: "A command-line tool for deploying applications to AWS, GCP, and Azure with a unified interface. Supports Docker containers, serverless functions, and static sites.",
    techStack: ["Python", "Click", "Docker", "AWS", "Terraform"],
    githubUrl: "https://github.com/username/clouddeploy",
    featured: true,
    sortOrder: 2,
    content: `## Overview

CloudDeploy is a unified CLI tool that abstracts away the complexity of deploying to different cloud providers. Write one configuration file, deploy anywhere.

## Architecture

The tool uses a plugin-based architecture where each cloud provider implements a common deployment interface. Configuration is defined in a \`deploy.yml\` file:

\`\`\`yaml
name: my-app
provider: aws
type: container

build:
  dockerfile: ./Dockerfile
  context: .

deploy:
  region: us-east-1
  memory: 512
  scaling:
    min: 1
    max: 10
\`\`\`

## Features

- Unified deployment across AWS, GCP, and Azure
- Automatic Dockerfile generation for common frameworks
- Blue-green deployment support
- Rollback to any previous version
- Environment variable management with encryption
`,
  },
  {
    title: "QueryForge",
    slug: "queryforge",
    description: "A visual SQL query builder for PostgreSQL that generates optimized queries with proper indexing suggestions. Built as a web application with a drag-and-drop interface.",
    techStack: ["React", "TypeScript", "PostgreSQL", "Node.js", "D3.js"],
    githubUrl: "https://github.com/username/queryforge",
    liveUrl: "https://queryforge.app",
    featured: true,
    sortOrder: 3,
    content: `## Overview

QueryForge helps developers build complex SQL queries visually and understand their performance characteristics. It connects to your PostgreSQL database, analyzes your schema, and suggests optimal query patterns.

## How It Works

1. Connect to any PostgreSQL database
2. Drag tables onto the canvas
3. Define joins and conditions visually
4. QueryForge generates optimized SQL
5. View EXPLAIN ANALYZE output with visual breakdown

## Technical Stack

The frontend uses React with D3.js for the visual query builder canvas. The backend runs on Node.js and connects directly to user databases through secure tunnels. Query analysis uses PostgreSQL's EXPLAIN output parsed into an interactive visualization.
`,
  },
  {
    title: "Watchdog",
    slug: "watchdog",
    description: "A lightweight uptime monitoring service that checks HTTP endpoints, sends alerts via Slack and email, and provides historical availability dashboards.",
    techStack: ["Go", "Redis", "PostgreSQL", "React", "Docker"],
    githubUrl: "https://github.com/username/watchdog",
    featured: true,
    sortOrder: 4,
    content: `## Overview

Watchdog is a self-hosted uptime monitoring tool designed for small to medium teams. It checks your endpoints at configurable intervals and alerts you when things go down.

## Architecture

The system consists of three components:

- **Checker Service** (Go): Performs HTTP checks from multiple regions concurrently
- **API Server** (Node.js): REST API for configuration and data access
- **Dashboard** (React): Real-time status page and historical charts

## Deployment

Deploy with a single Docker Compose command:

\`\`\`bash
docker compose up -d
\`\`\`

## Features

- Check HTTP, TCP, and DNS endpoints
- Multi-region checking
- Slack, email, and webhook alerts
- 99.9% SLA tracking with monthly reports
- Public status page generation
`,
  },
  {
    title: "TypeSafe Config",
    slug: "typesafe-config",
    description: "A zero-dependency TypeScript library for validated, type-safe configuration management. Supports environment variables, JSON files, and remote config sources.",
    techStack: ["TypeScript", "Node.js", "Zod"],
    githubUrl: "https://github.com/username/typesafe-config",
    featured: false,
    sortOrder: 5,
    content: `## Overview

TypeSafe Config eliminates the \`process.env.SOMETHING as string\` pattern by providing runtime validation and compile-time type safety for all your configuration values.

## Usage

\`\`\`typescript
import { defineConfig } from 'typesafe-config';
import { z } from 'zod';

const config = defineConfig({
  port: z.number().default(3000),
  databaseUrl: z.string().url(),
  redisUrl: z.string().url().optional(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// Fully typed - config.port is number, config.redisUrl is string | undefined
console.log(config.port);
\`\`\`

If a required variable is missing or has the wrong type, the application fails fast at startup with a clear error message.
`,
  },
];

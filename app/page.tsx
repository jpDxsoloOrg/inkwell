export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Container } from "@/components/layout";
import { PostCard } from "@/components/blog/PostCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { getSiteConfig } from "@/lib/data/site-config";
import { getRecentPosts } from "@/lib/data/posts";
import { getFeaturedProjects } from "@/lib/data/projects";

const skillCategories = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "SQL", "Rust", "Go"],
  },
  {
    label: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "Vue.js"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Express", "PostgreSQL", "Redis", "GraphQL"],
  },
  {
    label: "DevOps",
    items: ["AWS", "Docker", "GitHub Actions", "Terraform", "Vercel"],
  },
];

export default async function HomePage() {
  let config: Awaited<ReturnType<typeof getSiteConfig>> = null;
  let recentPosts: Awaited<ReturnType<typeof getRecentPosts>> = [];
  let featuredProjects: Awaited<ReturnType<typeof getFeaturedProjects>> = [];

  try {
    [config, recentPosts, featuredProjects] = await Promise.all([
      getSiteConfig(),
      getRecentPosts(3),
      getFeaturedProjects(4),
    ]);
  } catch {
    // Database may be waking up (cold start) — render with defaults
  }

  const ownerName = config?.ownerName ?? "JP";
  const ownerTitle = config?.ownerTitle ?? "Full-Stack Developer";
  const ownerBio =
    config?.ownerBio ??
    "Full-Stack Developer specializing in serverless AWS architecture, React, and TypeScript. I build scalable web applications from cloud infrastructure to polished UI.";

  const yearsOfExperience = config?.careerStartDate
    ? Math.floor(
        (Date.now() - new Date(config.careerStartDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-neutral-200 dark:border-neutral-800">
        <Container className="py-20 sm:py-28">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-sm text-accent-700 dark:border-accent-800 dark:bg-accent-950 dark:text-accent-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Available for new opportunities
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
              {ownerName}
            </h1>
            <p className="mt-2 text-xl font-medium text-accent-600 dark:text-accent-400">
              {ownerTitle}
              {yearsOfExperience !== null && (
                <span className="text-neutral-400 dark:text-neutral-500">
                  {" "}
                  · {yearsOfExperience}+ years
                </span>
              )}
            </p>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              {ownerBio}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-700"
              >
                View Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
              >
                Read Blog
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="border-b border-neutral-200 dark:border-neutral-800">
          <Container className="py-16 sm:py-20">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                  Featured Projects
                </h2>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  A selection of things I have built.
                </p>
              </div>
              <Link
                href="/projects"
                className="hidden items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 sm:inline-flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} featured />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-600"
              >
                View all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <section className="border-b border-neutral-200 dark:border-neutral-800">
          <Container className="py-16 sm:py-20">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                  Recent Writing
                </h2>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  Thoughts on software, engineering, and building products.
                </p>
              </div>
              <Link
                href="/blog"
                className="hidden items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 sm:inline-flex"
              >
                All posts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Skills */}
      <section className="border-b border-neutral-200 dark:border-neutral-800">
        <Container className="py-16 sm:py-20">
          <h2 className="mb-10 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Tech Stack
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {skillCategories.map((category) => (
              <div key={category.label}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {category.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section>
        <Container className="py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              Let&apos;s work together
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-neutral-600 dark:text-neutral-400">
              I&apos;m always interested in hearing about new projects and
              opportunities. Feel free to reach out.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <SocialIcon
                href={config?.githubUrl ?? "#"}
                label="GitHub"
                icon={Github}
              />
              <SocialIcon
                href={config?.linkedinUrl ?? "#"}
                label="LinkedIn"
                icon={Linkedin}
              />
              <SocialIcon
                href={config?.twitterUrl ?? "#"}
                label="Twitter"
                icon={Twitter}
              />
              <SocialIcon
                href={config?.email ? `mailto:${config.email}` : "#"}
                label="Email"
                icon={Mail}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function SocialIcon({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Github;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-accent-800 dark:hover:bg-accent-950 dark:hover:text-accent-400"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}

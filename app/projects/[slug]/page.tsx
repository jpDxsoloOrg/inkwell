import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { Container } from "@/components/layout";
import { MdxContent } from "@/components/mdx/MdxContent";
import { Badge } from "@/components/ui/Badge";
import { getProjectBySlug } from "@/lib/data/projects";
import { formatDate } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      ...(project.coverImage && { images: [{ url: project.coverImage }] }),
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <Container className="py-12">
      <div className="mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        {/* Main content */}
        <article className="min-w-0">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            {project.title}
          </h1>
          <p className="mb-8 text-lg text-neutral-600 dark:text-neutral-400">
            {project.description}
          </p>
          {project.coverImage && (
            <div className="mb-10 overflow-hidden rounded-xl">
              <Image
                src={project.coverImage}
                alt={project.title}
                width={1200}
                height={630}
                className="w-full object-cover"
                priority
              />
            </div>
          )}
          <MdxContent source={project.content} />
        </article>

        {/* Sidebar */}
        <aside className="mt-10 lg:mt-0">
          <div className="sticky top-24 space-y-6 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Date
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {formatDate(project.createdAt)}
              </p>
            </div>

            <div className="space-y-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Github className="h-4 w-4" />
                  View Source
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}

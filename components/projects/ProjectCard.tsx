import Link from "next/link";
import Image from "next/image";
import { Github, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/data/projects";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 ${
        featured ? "ring-1 ring-accent-200 dark:ring-accent-900" : ""
      }`}
    >
      {project.coverImage && (
        <Link href={`/projects/${project.slug}`} className="overflow-hidden">
          <Image
            src={project.coverImage}
            alt={project.title}
            width={600}
            height={340}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}

      {!project.coverImage && (
        <Link
          href={`/projects/${project.slug}`}
          className="flex aspect-video items-center justify-center bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-950 dark:to-neutral-900"
        >
          <span className="text-3xl font-bold text-accent-300 dark:text-accent-800">
            {project.title.charAt(0)}
          </span>
        </Link>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
          <Link
            href={`/projects/${project.slug}`}
            className="hover:text-accent-600 dark:hover:text-accent-400"
          >
            {project.title}
          </Link>
        </h3>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 line-clamp-3 dark:text-neutral-400">
          {project.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <Github className="h-4 w-4" />
              Source
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

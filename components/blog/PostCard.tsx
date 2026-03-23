import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate, calculateReadingTime, generateExcerpt } from "@/lib/utils";
import type { PostWithTags } from "@/lib/data/posts";

interface PostCardProps {
  post: PostWithTags;
}

export function PostCard({ post }: PostCardProps) {
  const readingTime = calculateReadingTime(post.content);
  const excerpt = post.excerpt ?? generateExcerpt(post.content);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      {post.coverImage && (
        <Link href={`/blog/${post.slug}`} className="overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={600}
            height={340}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag.id} href={`/blog?tag=${tag.slug}`} variant="accent">
              {tag.name}
            </Badge>
          ))}
        </div>

        <h2 className="mb-2 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 hover:text-accent-600 dark:hover:text-accent-400"
          >
            {post.title}
          </Link>
        </h2>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 line-clamp-3 dark:text-neutral-400">
          {excerpt}
        </p>

        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-500">
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingTime} min read
          </span>
        </div>
      </div>
    </article>
  );
}

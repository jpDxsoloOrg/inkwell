import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import { Container } from "@/components/layout";
import { MdxContent } from "@/components/mdx/MdxContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { Badge } from "@/components/ui/Badge";
import { getPostBySlug, getAdjacentPosts } from "@/lib/data/posts";
import { formatDate, calculateReadingTime } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      url: `${baseUrl}/blog/${post.slug}`,
      ...(post.coverImage && { images: [{ url: post.coverImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) notFound();

  const readingTime = calculateReadingTime(post.content);
  const { prev, next } = post.publishedAt
    ? await getAdjacentPosts(post.publishedAt)
    : { prev: null, next: null };

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    url: `${baseUrl}/blog/${post.slug}`,
    ...(post.coverImage && { image: post.coverImage }),
  };

  return (
    <Container className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>

      <article>
        {/* Post header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.id} href={`/blog?tag=${tag.slug}`} variant="accent">
                {tag.name}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author.name}
            </span>
            {post.publishedAt && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readingTime} min read
            </span>
          </div>
        </header>

        {/* Content with TOC */}
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-10">
          <div className="min-w-0">
            <div className="lg:hidden">
              <TableOfContents content={post.content} />
            </div>
            <MdxContent source={post.content} />
          </div>
          <div className="hidden lg:block">
            <TableOfContents content={post.content} />
          </div>
        </div>
      </article>

      <PostNavigation prev={prev} next={next} />
    </Container>
  );
}

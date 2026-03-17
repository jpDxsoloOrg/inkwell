import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

function isExternalUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href ?? "#";
  const isExternal = isExternalUrl(href);

  if (isExternal) {
    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5"
      >
        {props.children}
        <ExternalLink className="ml-0.5 inline h-3.5 w-3.5 flex-shrink-0" />
      </a>
    );
  }

  return <Link href={href} {...(props as Record<string, unknown>)}>{props.children}</Link>;
}

function CustomImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const src = props.src ?? "";
  const alt = props.alt ?? "";

  if (src.startsWith("http") || src.startsWith("/")) {
    return (
      <span className="my-6 block overflow-hidden rounded-lg">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="w-full object-cover"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span className="my-6 block overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full object-cover" loading="lazy" />
    </span>
  );
}

function CustomBlockquote(props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className="my-6 border-l-4 border-accent-500 bg-accent-50/50 py-1 pl-6 pr-4 italic text-neutral-700 dark:border-accent-400 dark:bg-accent-950/20 dark:text-neutral-300"
      {...props}
    />
  );
}

function CustomTable(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full" {...props} />
    </div>
  );
}

function CustomPre(props: React.HTMLAttributes<HTMLPreElement>) {
  return <CodeBlock {...props}>{props.children}</CodeBlock>;
}

function CustomCode(props: React.HTMLAttributes<HTMLElement>) {
  const hasParentPre =
    props.className?.includes("language-") ||
    props["data-language" as keyof typeof props];

  if (hasParentPre) {
    return <code {...props} />;
  }

  return (
    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
      {props.children}
    </code>
  );
}

export function getMdxComponents(): Record<string, React.ComponentType<Record<string, unknown>>> {
  return {
    a: CustomLink as React.ComponentType<Record<string, unknown>>,
    img: CustomImage as React.ComponentType<Record<string, unknown>>,
    blockquote: CustomBlockquote as React.ComponentType<Record<string, unknown>>,
    table: CustomTable as React.ComponentType<Record<string, unknown>>,
    pre: CustomPre as React.ComponentType<Record<string, unknown>>,
    code: CustomCode as React.ComponentType<Record<string, unknown>>,
    h1: ((props: Record<string, unknown>) => (
      <h1 className="hidden" {...props} />
    )) as React.ComponentType<Record<string, unknown>>,
    h2: ((props: Record<string, unknown>) => (
      <h2
        className="mb-3 mt-8 text-2xl font-semibold tracking-tight first:mt-0"
        {...props}
      />
    )) as React.ComponentType<Record<string, unknown>>,
    h3: ((props: Record<string, unknown>) => (
      <h3 className="mb-2 mt-6 text-xl font-semibold" {...props} />
    )) as React.ComponentType<Record<string, unknown>>,
    h4: ((props: Record<string, unknown>) => (
      <h4 className="mb-2 mt-4 text-lg font-semibold" {...props} />
    )) as React.ComponentType<Record<string, unknown>>,
    hr: (() => (
      <hr className="my-8 border-neutral-200 dark:border-neutral-800" />
    )) as React.ComponentType<Record<string, unknown>>,
  };
}

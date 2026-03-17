import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { getMdxComponents } from "./mdx-components";
import { cn } from "@/lib/utils";

interface MdxContentProps {
  source: string;
  className?: string;
}

const prettyCodeOptions = {
  theme: {
    dark: "one-dark-pro",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: { block: "plaintext" },
};

export async function MdxContent({ source, className }: MdxContentProps) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-headings:scroll-mt-20",
        "prose-a:text-accent-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-accent-400",
        "prose-img:rounded-lg",
        "prose-pre:bg-transparent prose-pre:p-0",
        className
      )}
    >
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "wrap",
                  properties: {
                    className: ["anchor-link"],
                  },
                },
              ],
              [rehypePrettyCode, prettyCodeOptions],
            ],
          },
        }}
        components={getMdxComponents()}
      />
    </div>
  );
}

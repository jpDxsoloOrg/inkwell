<objective>
Display the cover image as a large hero banner at the top of blog post and project detail pages. Currently, the cover image is only used as a small thumbnail on listing cards — when you open the post or project, the image is absent. It should appear prominently below the header metadata and above the content body, spanning the full content width.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- Blog post detail (`app/blog/[slug]/page.tsx`): renders title, tags, author, date, reading time, then jumps straight to MDX content. `post.coverImage` is used for OpenGraph/SEO meta but never rendered visually on the page.
- Project detail (`app/projects/[slug]/page.tsx`): renders title, description, then content. `project.coverImage` exists in the data but is not displayed.
- Blog listing cards and project listing cards already show the cover image as a small thumbnail.

Desired behavior (reference: screenshot of a WordPress blog post):
- The cover image appears as a full-width banner between the post header (title/meta) and the post body content.
- The image is large — spanning the full width of the content column (not full viewport bleed).
- It has rounded corners and appropriate aspect ratio (roughly 16:9 or natural aspect preserved).
- If no cover image exists, nothing renders (no placeholder, no empty space).
- The same treatment applies to both blog posts and project pages.

@app/blog/[slug]/page.tsx — blog post detail (lines 89-118 are the header, image goes after header before content grid)
@app/projects/[slug]/page.tsx — project detail (lines 55-62 are the header area, image goes after description before MdxContent)
</context>

<requirements>
1. **Blog post page** (`app/blog/[slug]/page.tsx`):
   - After the `</header>` closing tag (line 118) and before the content grid div (line 121), conditionally render the cover image
   - Use Next.js `<Image>` component with `width={1200}` and `height={630}` (or similar 16:9 ratio) with `className` for full-width, rounded corners
   - Add `priority` prop since it's above the fold
   - Wrap in a container div with bottom margin (`mb-10`) to separate from content

2. **Project page** (`app/projects/[slug]/page.tsx`):
   - After the description paragraph (line 61) and before `<MdxContent>` (line 62), conditionally render the cover image
   - Same styling approach: full content-column width, rounded corners, margin below

3. **Styling**:
   - Image should be `w-full rounded-xl` (or `rounded-lg`) with `object-cover`
   - Use `aspect-video` (16:9) or let natural dimensions dictate with a max-height
   - Add a subtle shadow or border for visual separation: `shadow-sm` or a light border matching the theme

4. **Responsive**:
   - Image scales naturally with the content column on all screen sizes
   - No overflow or cropping issues on mobile

5. **Accessibility**:
   - `alt` attribute: use the post/project title as alt text
</requirements>

<implementation>
- Import `Image` from `next/image` in both files
- The cover image block is simple — approximately:
  ```tsx
  {post.coverImage && (
    <div className="mb-10 overflow-hidden rounded-xl">
      <Image
        src={post.coverImage}
        alt={post.title}
        width={1200}
        height={630}
        className="w-full object-cover"
        priority
      />
    </div>
  )}
  ```
- For projects, the same pattern but using `project.coverImage` and `project.title`
- No new components needed — this is a few lines in each page file
- If S3 images are used, ensure the S3 domain is in `next.config.mjs` `images.remotePatterns` (check if already configured)
</implementation>

<output>
Modify files:
- `app/blog/[slug]/page.tsx` — add hero cover image after header, before content
- `app/projects/[slug]/page.tsx` — add hero cover image after description, before content
- `next.config.mjs` — add S3 domain to `images.remotePatterns` if not already present
</output>

<verification>
- Open a blog post with a cover image → large image renders below title/meta, above content
- Open a blog post without a cover image → no empty space, content flows normally
- Open a project with a cover image → large image renders below description, above content
- Image is responsive and looks correct on mobile and desktop
- Image has rounded corners and appropriate spacing
- Next.js Image component optimizes the image (check network tab for _next/image URL)
</verification>

<success_criteria>
- Cover image displays prominently on both blog post and project detail pages
- Conditional rendering: no image = no empty space
- Responsive and visually consistent with existing design
- Only 2-3 files modified, minimal code added
</success_criteria>

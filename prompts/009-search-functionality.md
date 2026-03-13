<objective>
Add full-text search to DxPress. Search is a fundamental CMS feature — WordPress, Joomla, and Drupal all include built-in search. Without it, readers have no way to find content beyond browsing.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- No search functionality exists (no search bar, no search API, no search results page)
- Blog listing shows all published posts with no filtering beyond tags
- PostgreSQL is the database (Neon serverless) — it has built-in full-text search capabilities

Comparable CMS features:
- **WordPress**: Built-in search with `?s=` query parameter. Searches post title, content, and excerpt. Search widget for sidebar. Many sites enhance with plugins (Relevanssi, ElasticSearch).
- **Joomla**: Smart Search component with indexing, filters by category/type/date, autocomplete suggestions.
- **Drupal**: Core Search module with indexing. Views integration for custom search pages.

For DxPress, we want PostgreSQL full-text search (no external service needed): search bar in header, search results page, searches across posts, pages, and projects.

@prisma/schema.prisma
@app/layout.tsx
@app/blog/page.tsx
</context>

<requirements>
1. **Search API** (`app/api/search/route.ts`):
   - GET /api/search?q=query&type=all|posts|pages|projects&page=1&limit=10
   - Use PostgreSQL full-text search (`to_tsvector` / `to_tsquery`) via Prisma raw queries
   - Search fields: title, content, excerpt (for posts); title, content (for pages); title, description (for projects)
   - Return results ranked by relevance with highlighted matching snippets
   - Only return published content
   - Handle empty/short queries gracefully (min 2 characters)

2. **Search bar component** (`components/SearchBar.tsx`):
   - Appears in the site header (all pages)
   - Expandable: icon that expands to input on click (mobile-friendly)
   - Debounced input (300ms) with loading indicator
   - Quick results dropdown showing top 5 results as user types
   - "View all results" link to full search results page
   - Keyboard shortcut: Cmd/Ctrl+K opens search (like Spotlight/Algolia)

3. **Search results page** (`app/search/page.tsx`):
   - Full search results with query in URL: /search?q=query
   - Filter tabs: All, Posts, Pages, Projects
   - Each result shows: title (linked), snippet with highlighted match, content type badge, date
   - Pagination for results
   - "No results found" state with suggestions
   - Preserves query in search input

4. **SEO considerations**:
   - Search results page should have `noindex` meta tag (search results shouldn't be indexed)
   - Search queries should use URL query params (not hash) for shareability

5. **Performance**:
   - Add PostgreSQL GIN index on tsvector columns for fast full-text search
   - Cache search results briefly (revalidate: 60) for repeated queries
   - Debounce on client, rate-limit on server (10 requests/minute per IP)
</requirements>

<implementation>
- Use Prisma's `$queryRaw` for full-text search since Prisma doesn't natively support tsvector:
  ```sql
  SELECT id, title, ts_headline('english', content, query) as snippet,
         ts_rank(to_tsvector('english', title || ' ' || content), query) as rank
  FROM posts, to_tsquery('english', $1) query
  WHERE to_tsvector('english', title || ' ' || content) @@ query
    AND published = true
  ORDER BY rank DESC
  ```
- Create the GIN index via a Prisma migration using raw SQL
- The search bar should be a client component ("use client") with useState for the dropdown
- Use `useRouter` and `useSearchParams` for the results page to handle URL state
- ts_headline provides snippets with highlighted matches — return these as HTML and render with dangerouslySetInnerHTML (content is from our own database, safe)
</implementation>

<output>
Create/modify files:
- `prisma/migrations/*` — add GIN indexes for full-text search
- `app/api/search/route.ts` — search endpoint with full-text query
- `components/SearchBar.tsx` — expandable search bar with quick results
- `app/search/page.tsx` — full search results page
- `app/layout.tsx` — add SearchBar to header
</output>

<verification>
- Search for a word in a post title → post appears in results
- Search for content within a post body → post appears with snippet
- Quick results dropdown shows top 5 as you type
- Filter tabs correctly filter by content type
- Cmd/Ctrl+K opens search bar
- Empty/short queries handled gracefully
- Search results page is noindex
- GIN indexes exist in the database
</verification>

<success_criteria>
- Full-text search works across posts, pages, and projects
- Search bar accessible from every page via header
- Quick results dropdown provides instant feedback
- Results ranked by relevance with highlighted snippets
- Search is fast (<200ms for typical queries with GIN indexes)
- Keyboard shortcut works
</success_criteria>

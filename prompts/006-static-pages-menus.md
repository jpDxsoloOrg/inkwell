<objective>
Add dynamic static pages and navigation menu management to DxPress. Currently, pages like About are hardcoded React components. WordPress, Joomla, and Drupal all let admins create arbitrary pages and organize them into navigation menus without touching code.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- /about is a hardcoded page component
- No dynamic page creation capability
- Navigation links are hardcoded in the layout
- No menu management system

Comparable CMS features:
- **WordPress**: Pages are a content type (like posts but not in the blog feed). Menus are managed via Appearance > Menus — drag-and-drop ordering, nested items, can link to pages/categories/custom URLs. Multiple menu locations (header, footer, sidebar).
- **Joomla**: Menu Manager creates menus with items pointing to articles, categories, components, or external URLs. Each menu item has a menu type (single article, category blog, etc.).
- **Drupal**: Menu system with blocks. Pages created as "Basic page" content type. Menus support hierarchy and multiple locations.

For DxPress, we want: dynamic pages with rich text content (like posts), and a menu management system for header/footer navigation.

@prisma/schema.prisma
@app/layout.tsx
@app/about/page.tsx
</context>

<requirements>
1. **Prisma schema**: Add a `Page` model:
   - id, title, slug (unique), content (rich text), metaTitle, metaDescription
   - published (boolean, default false), sortOrder
   - createdAt, updatedAt

   Add a `Menu` model:
   - id, name (e.g., "Header", "Footer"), location (enum: HEADER, FOOTER)

   Add a `MenuItem` model:
   - id, label, url (for external links), pageId (nullable FK to Page, for internal links), menuId (FK to Menu)
   - parentId (nullable FK to self for dropdowns), sortOrder
   - openInNewTab (boolean, default false)

2. **Page API routes** (`app/api/pages/`):
   - GET /api/pages — list all pages (public: published only)
   - GET /api/pages/[slug] — get page by slug
   - POST /api/pages — create page (auth required)
   - PUT /api/pages/[id] — update page (auth required)
   - DELETE /api/pages/[id] — delete page (auth required)

3. **Menu API routes** (`app/api/menus/`):
   - GET /api/menus — return all menus with items (nested tree)
   - GET /api/menus/[location] — get menu by location (e.g., /api/menus/header)
   - PUT /api/menus/[id] — update menu items and order (auth required)

4. **Admin UI**:
   - Pages management (`app/admin/pages/page.tsx`): list, create, edit, delete pages
   - Page editor: title, slug, rich text content, meta title/description, publish toggle
   - Menu management (`app/admin/menus/page.tsx`): drag-and-drop reordering of menu items, add page links / custom URLs, nest items for dropdowns

5. **Public rendering**:
   - Dynamic page route at `/[slug]` — catches page slugs, renders content
   - Must not conflict with existing routes (/blog, /about, /projects, /resume, /admin)
   - Header navigation reads from the HEADER menu instead of hardcoded links
   - Footer navigation reads from the FOOTER menu
   - Migrate existing /about content to a database Page record via seed/migration

6. **SEO**: Pages should render metaTitle and metaDescription in head tags
</requirements>

<implementation>
- For the catch-all `/[slug]` page route, use Next.js dynamic routing with a check: if slug matches a known static route, return notFound(). Otherwise query the Page table.
- Menu items should be fetched in the root layout and passed down (or cached with Next.js fetch caching)
- For menu drag-and-drop in admin, a simple sortable list is fine — no need for a complex DnD library. A move-up/move-down button approach works too.
- Seed the default Header menu with: Home, Blog, Projects, About, Resume
- Seed the default Footer menu with: Home, Blog
</implementation>

<output>
Create/modify files:
- `prisma/schema.prisma` — add Page, Menu, MenuItem models
- `prisma/migrations/*` — new migration
- `app/api/pages/route.ts` — GET list, POST create
- `app/api/pages/[slug]/route.ts` — GET by slug, PUT, DELETE
- `app/api/menus/route.ts` — GET all menus
- `app/api/menus/[location]/route.ts` — GET by location, PUT update
- `app/admin/pages/page.tsx` — page management
- `app/admin/pages/new/page.tsx` — create page
- `app/admin/pages/[id]/edit/page.tsx` — edit page
- `app/admin/menus/page.tsx` — menu management
- `app/[slug]/page.tsx` — dynamic public page rendering
- `app/layout.tsx` — update to read nav from menu API
</output>

<verification>
- Admin can create a new page, publish it, and it's accessible at /[slug]
- Dynamic pages don't conflict with /blog, /projects, /admin, etc.
- Header navigation reflects the HEADER menu configuration
- Menu items can be reordered and nested (1 level for dropdowns)
- Existing /about content works as a dynamic page
- Page SEO meta tags render correctly
</verification>

<success_criteria>
- Page CRUD works end-to-end
- Menu management updates header/footer navigation without code changes
- Dynamic slug routing works without conflicts
- SEO meta renders on dynamic pages
</success_criteria>

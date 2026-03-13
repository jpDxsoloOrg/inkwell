<objective>
Add hierarchical categories to DxPress's content system — the most fundamental taxonomy feature that WordPress, Joomla, and Drupal all provide. Posts currently only have flat tags. Categories provide hierarchical organization (e.g., Technology > Frontend > React) that helps both content creators organize and readers navigate.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- Posts have flat tags via a many-to-many relation (Post ↔ Tag)
- No category model exists in the Prisma schema
- No category UI in admin or public pages
- Blog listing at /blog has no category filtering

Comparable CMS features:
- **WordPress**: Categories are hierarchical (parent/child), every post must have at least one (defaults to "Uncategorized"). Tags are flat. Both are taxonomies.
- **Joomla**: Uses hierarchical categories as the primary organizer. Articles must belong to exactly one category.
- **Drupal**: Taxonomy system with vocabularies (category groups) and terms (individual categories), fully hierarchical.

For DxPress, we want WordPress-style categories: hierarchical, optional (not required), multiple per post.

@prisma/schema.prisma
@app/api/posts/route.ts
@app/blog/page.tsx
@app/admin/posts/new/page.tsx
</context>

<requirements>
1. **Prisma schema**: Add a `Category` model with self-referencing parent/child relationship:
   - id, name, slug (unique), description (optional), parentId (nullable FK to self), sortOrder
   - Many-to-many relation with Post (like tags)
   - Index on slug and parentId

2. **API routes** (`app/api/categories/`):
   - GET /api/categories — return all categories as a nested tree structure
   - POST /api/categories — create category (auth required)
   - PUT /api/categories/[id] — update category (auth required)
   - DELETE /api/categories/[id] — delete category, fail if has children or posts assigned (auth required)

3. **Admin UI** (`app/admin/categories/page.tsx`):
   - List categories in tree view showing hierarchy
   - Create/edit form with name, slug (auto-generated from name), description, parent category dropdown
   - Delete with confirmation (blocked if has children)

4. **Post editor integration**:
   - Add category selector to post create/edit forms (multi-select with hierarchy shown)
   - Update post API to accept categoryIds

5. **Public blog integration**:
   - Add category filter sidebar/nav to /blog
   - Category archive page at /blog/category/[slug] showing posts in that category (and child categories)
   - Show categories on post cards and post detail pages

6. **Migration**: Create Prisma migration for the new models and relations
</requirements>

<implementation>
- Use Prisma's self-relation pattern for parent/child: `parent Category? @relation("CategoryChildren", fields: [parentId], references: [id])` and `children Category[] @relation("CategoryChildren")`
- Build the tree structure server-side in the GET endpoint, not client-side
- Reuse the existing tag styling patterns for category display on public pages
- Category slugs should be unique globally (not scoped to parent) for simple URL routing
</implementation>

<output>
Create/modify files:
- `prisma/schema.prisma` — add Category model and Post relation
- `prisma/migrations/*` — new migration
- `app/api/categories/route.ts` — GET all, POST create
- `app/api/categories/[id]/route.ts` — PUT update, DELETE
- `app/api/posts/route.ts` — update to handle categoryIds
- `app/admin/categories/page.tsx` — admin category management
- `app/admin/posts/new/page.tsx` — add category selector
- `app/admin/posts/[id]/edit/page.tsx` — add category selector
- `app/blog/page.tsx` — add category filter
- `app/blog/category/[slug]/page.tsx` — category archive page
</output>

<verification>
- Categories can be created with parent/child hierarchy (3 levels deep)
- Posts can be assigned to multiple categories
- Blog filters by category and shows posts from child categories
- Deleting a category with children is blocked
- Category slugs are unique and URL-safe
- Admin UI shows tree structure clearly
</verification>

<success_criteria>
- Category CRUD works end-to-end (admin create → public display)
- Hierarchical tree renders correctly in admin and public views
- Post editor allows category assignment
- /blog/category/[slug] returns correct filtered posts
- Prisma migration applies cleanly
</success_criteria>

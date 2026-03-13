<objective>
Add a comments system to DxPress blog posts. Comments are a core CMS feature present in WordPress, Joomla, and Drupal. They enable reader engagement and discussion on published content.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- Posts have no comments model or UI
- No public-facing interactivity beyond reading
- Auth exists only for admin (NextAuth with single ADMIN role)

Comparable CMS features:
- **WordPress**: Built-in comments with threading (nested replies), moderation queue (pending/approved/spam/trash), guest commenting (name + email), and Gravatar integration. Admin can enable/disable per post.
- **Joomla**: Comments not built-in (relies on extensions like JComments), but the data model supports it.
- **Drupal**: Comments as a field type — can be added to any content type, supports threading, moderation, and anonymous commenting.

For DxPress, we want WordPress-style comments: threaded, moderated, guest commenting with name/email (no account required), admin approval workflow.

@prisma/schema.prisma
@app/blog/[slug]/page.tsx
@app/api/posts/route.ts
</context>

<requirements>
1. **Prisma schema**: Add a `Comment` model:
   - id, content (text), authorName, authorEmail, postId (FK to Post), parentId (nullable FK to self for threading)
   - status enum: PENDING, APPROVED, SPAM, TRASH (default PENDING)
   - createdAt, updatedAt
   - Relation to Post (many comments per post)
   - Self-relation for threaded replies

2. **Post schema update**: Add `commentsEnabled` boolean field to Post (default true)

3. **Public API routes**:
   - GET /api/posts/[id]/comments — return approved comments as threaded tree
   - POST /api/posts/[id]/comments — submit comment (no auth, but requires name + email + content; honeypot field for basic spam prevention)

4. **Admin API routes**:
   - GET /api/admin/comments — list all comments with filters (status, post) with pagination
   - PUT /api/admin/comments/[id] — update status (approve, spam, trash) (auth required)
   - DELETE /api/admin/comments/[id] — permanently delete (auth required)

5. **Public UI** (blog post page):
   - Comment section below post content (only if commentsEnabled)
   - Display approved comments with threading (max 3 levels deep)
   - Comment submission form: name, email (not displayed publicly), comment text
   - Show comment count on post cards in blog listing
   - Success message after submission: "Comment submitted for moderation"

6. **Admin UI**:
   - Comments management page (`app/admin/comments/page.tsx`)
   - Filter by status (pending/approved/spam/trash)
   - Bulk actions: approve, spam, trash selected comments
   - Show which post each comment belongs to
   - Toggle commentsEnabled per post in post editor
   - Dashboard: pending comment count indicator

7. **Spam prevention**:
   - Honeypot hidden field (if filled, reject silently)
   - Rate limiting: max 3 comments per email per hour
   - Basic content validation (not empty, reasonable length 1-5000 chars)
</requirements>

<implementation>
- Thread comments server-side: fetch flat, build tree in the GET endpoint
- Use optimistic UI for comment submission (show "pending moderation" immediately)
- Email is collected for admin reference and gravatar-style avatar potential, but never shown publicly
- Honeypot field should be visually hidden via CSS (not display:none, which bots detect)
- Rate limiting can use a simple in-memory check or a DynamoDB/Prisma count query
</implementation>

<output>
Create/modify files:
- `prisma/schema.prisma` — add Comment model, CommentStatus enum, Post.commentsEnabled field
- `prisma/migrations/*` — new migration
- `app/api/posts/[id]/comments/route.ts` — public GET/POST
- `app/api/admin/comments/route.ts` — admin list with filters
- `app/api/admin/comments/[id]/route.ts` — admin PUT/DELETE
- `app/blog/[slug]/page.tsx` — add comment section
- `app/blog/[slug]/CommentSection.tsx` — client component for comments UI
- `app/blog/[slug]/CommentForm.tsx` — client component for submission form
- `app/admin/comments/page.tsx` — admin comment moderation
- `app/admin/posts/new/page.tsx` — add commentsEnabled toggle
- `app/admin/posts/[id]/edit/page.tsx` — add commentsEnabled toggle
</output>

<verification>
- Guest can submit a comment (name + email + text) without logging in
- Comment appears as "pending" in admin, not on public page
- Admin can approve → comment appears publicly
- Threaded replies render with visual indentation (max 3 levels)
- Honeypot field rejects bot submissions
- commentsEnabled toggle hides/shows comment section per post
- Comment count shows on blog listing cards
</verification>

<success_criteria>
- Full comment lifecycle works: submit → moderate → display (or reject)
- Threading renders correctly up to 3 levels
- Spam prevention catches basic bot submissions
- Admin can efficiently moderate with bulk actions
- No authenticated account needed for commenting
</success_criteria>

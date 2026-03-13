<objective>
Add post revision history and scheduled publishing to DxPress. These are editorial workflow features that WordPress and Drupal include by default — they protect against accidental content loss and enable planned content calendars.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- Posts can be saved as draft or published immediately
- No version history — edits overwrite the previous version permanently
- No scheduling — published means "now", no future date publishing
- publishedAt field exists on Post but is set at publish time, not user-configurable

Comparable CMS features:
- **WordPress**: Auto-saves every 60 seconds. Full revision history with diff view (compare any two revisions). Scheduled publishing: set a future date/time and WordPress publishes automatically. "Pending review" status for multi-author workflows.
- **Joomla**: Article versioning with ability to restore previous versions. Scheduled start/end publishing dates.
- **Drupal**: Content moderation module with draft → review → published workflow. Revisions stored per node with diff comparison. Scheduler module for timed publishing.

For DxPress, we want: revision history with restore capability, and scheduled publishing with automatic activation.

@prisma/schema.prisma
@app/api/posts/route.ts
@app/api/posts/[id]/route.ts
@app/admin/posts/[id]/edit/page.tsx
</context>

<requirements>
1. **Revision History**:

   a. **Prisma schema**: Add a `PostRevision` model:
      - id, postId (FK to Post), title, content, excerpt, coverImage
      - revisionNumber (auto-incrementing per post)
      - createdAt, createdById (FK to User)
      - changeNote (optional — "Updated introduction", "Fixed typo")

   b. **API**:
      - GET /api/posts/[id]/revisions — list all revisions for a post (auth required)
      - GET /api/posts/[id]/revisions/[revisionId] — get specific revision content
      - POST /api/posts/[id]/revisions/[revisionId]/restore — restore post to this revision (creates a new revision with the old content)

   c. **Auto-save**: When a post is updated via PUT, automatically create a revision with the previous content before applying the update

   d. **Admin UI**:
      - "Revision history" panel in post editor sidebar
      - List of revisions with date, author, and change note
      - Click to preview a revision
      - "Restore this version" button
      - Simple diff view: show what changed between current and selected revision (line-by-line comparison)

2. **Scheduled Publishing**:

   a. **Schema update**: Add `scheduledAt` (nullable DateTime) to Post. Post status becomes: draft, scheduled, published.

   b. **Post editor UI**:
      - When publishing, show option to "Publish now" or "Schedule for later"
      - Date/time picker for scheduled date (must be in the future)
      - Scheduled posts show "Scheduled for [date]" badge in post list

   c. **Publishing mechanism**:
      - Option A (simple): API endpoint that checks and publishes due posts, called by a cron job or Amplify scheduled function
      - Option B (serverless): Use a Next.js API route with revalidation — on each public page load, check if any scheduled posts are due and publish them
      - Implement Option B for simplicity (no additional infrastructure)

   d. **API updates**:
      - PUT /api/posts/[id] — accept scheduledAt field
      - GET /api/posts — include status filter (draft/scheduled/published)
      - Internal: on public blog page load, run a check for due scheduled posts

3. **Revision limits**: Keep last 25 revisions per post. Auto-delete oldest when limit exceeded.
</requirements>

<implementation>
- For revision creation, use a Prisma transaction: read current post → create revision with old data → update post with new data
- Revision numbers should be per-post (not global), use a count query + 1
- For the diff view, a simple line-by-line comparison is sufficient. Split content by newlines, mark added/removed/unchanged lines. No need for a diff library.
- Scheduled post check: in the blog page's server component, run a query before fetching posts:
  ```typescript
  await prisma.post.updateMany({
    where: { scheduledAt: { lte: new Date() }, published: false },
    data: { published: true, publishedAt: new Date() }
  });
  ```
  This is "lazy" scheduling — posts get published when someone visits the blog. For most sites this is fine.
- The scheduledAt field should be cleared when a post is manually published or unpublished
</implementation>

<output>
Create/modify files:
- `prisma/schema.prisma` — add PostRevision model, add scheduledAt to Post
- `prisma/migrations/*` — new migration
- `app/api/posts/[id]/route.ts` — create revision on update, handle scheduledAt
- `app/api/posts/[id]/revisions/route.ts` — GET list revisions
- `app/api/posts/[id]/revisions/[revisionId]/route.ts` — GET specific, POST restore
- `app/admin/posts/[id]/edit/page.tsx` — add revision sidebar and schedule UI
- `components/RevisionHistory.tsx` — revision list and diff viewer
- `components/SchedulePublish.tsx` — date/time picker for scheduling
- `app/blog/page.tsx` — add scheduled post check on load
</output>

<verification>
- Edit a post → previous version saved as revision automatically
- Revision list shows all versions with dates and authors
- Restoring a revision updates the post content and creates a new revision
- Only last 25 revisions kept per post
- Schedule a post for 1 minute in the future → after 1 minute, blog page shows it as published
- Scheduled posts show correct badge in admin post list
- Cannot schedule for a past date
</verification>

<success_criteria>
- Every post edit creates a revision automatically
- Revisions can be viewed and restored
- Simple diff shows changes between versions
- Scheduled publishing works via lazy check
- Admin UI clearly shows draft/scheduled/published status
- Revision limit of 25 enforced
</success_criteria>

<objective>
Add a contact form and a basic analytics dashboard to DxPress. Contact forms are standard CMS functionality (WordPress has Contact Form 7/WPForms, Joomla has built-in contact, Drupal has Webform). Analytics give site owners insight into their content performance without relying on third-party tools.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- No contact form or way for visitors to reach the site owner
- No analytics or content metrics (no view counts, no dashboard stats)
- Admin dashboard (`app/admin/page.tsx`) exists but likely shows minimal information

Comparable CMS features:
- **WordPress**: Contact Form 7 / WPForms plugins (most sites have one). Jetpack Stats or Google Analytics integration. Dashboard shows at-a-glance: posts, pages, comments, recent activity.
- **Joomla**: Built-in Contact component with contact forms, categories, and email routing. No built-in analytics but admin dashboard shows popular articles.
- **Drupal**: Webform module for custom forms. Statistics module tracks content views. Dashboard shows content overview.

For DxPress: a simple contact form with email-less submission (store in database), and a content analytics dashboard tracking page views and popular content.

@app/admin/page.tsx
@app/api/posts/route.ts
@prisma/schema.prisma
</context>

<requirements>
1. **Contact Form**:

   a. **Prisma schema**: Add `ContactSubmission` model:
      - id, name, email, subject, message (text), status (NEW, READ, REPLIED, ARCHIVED)
      - createdAt, readAt

   b. **Public page** (`app/contact/page.tsx`):
      - Clean form: name, email, subject, message
      - Client-side validation (all required, valid email format)
      - Honeypot field for spam prevention
      - Rate limiting: max 3 submissions per IP per hour
      - Success state: "Message sent! We'll get back to you soon."
      - reCAPTCHA is overkill for now — honeypot + rate limit is sufficient

   c. **API**:
      - POST /api/contact — submit form (public, no auth)
      - GET /api/admin/contact — list submissions with filters (auth required)
      - PUT /api/admin/contact/[id] — update status (auth required)
      - DELETE /api/admin/contact/[id] — delete submission (auth required)

   d. **Admin UI** (`app/admin/contact/page.tsx`):
      - List submissions sorted by date (newest first)
      - Filter by status (New, Read, Replied, Archived)
      - Click to view full message, mark as read automatically
      - Unread count badge in admin nav
      - Bulk actions: mark read, archive, delete

2. **Analytics Dashboard**:

   a. **Prisma schema**: Add `PageView` model:
      - id, path (URL path), referrer (optional), userAgent (optional)
      - createdAt
      - No personal data — just aggregate page views

   b. **View tracking**:
      - Middleware or API route that records page views for public pages
      - Exclude admin pages, API routes, and bot traffic (basic user-agent check)
      - Lightweight: fire-and-forget, don't block page rendering
      - Endpoint: POST /api/analytics/track (called from client-side script)

   c. **Analytics API** (`app/api/admin/analytics/route.ts`):
      - GET /api/admin/analytics?period=7d|30d|90d|all
      - Returns: total views, views per day (for chart), top pages, top referrers, top posts by views

   d. **Admin dashboard** (`app/admin/page.tsx`) — enhanced with:
      - Content overview cards: total posts (published/draft), total pages, total comments (pending), total contact submissions (unread)
      - Views chart: line chart showing page views over selected period (7d/30d/90d)
      - Top 5 most viewed posts
      - Top 5 referrers
      - Recent activity: last 10 actions (post published, comment received, contact submission)
      - Use a simple SVG line chart or CSS-based chart (no chart library dependency)

3. **View count display**:
   - Show view count on post detail pages (small text like "123 views")
   - Show view count column in admin post list
</requirements>

<implementation>
- Contact form: use a server action or API route. Honeypot field is hidden via CSS positioning (off-screen), not display:none.
- For rate limiting without Redis, use a simple Prisma query: count submissions from the same email in the last hour. Not bulletproof but sufficient.
- Analytics tracking: use a small client-side script that sends a POST on page load. Use `navigator.sendBeacon` for reliability (fires even on page close).
- For the dashboard chart, use SVG polyline — calculate x/y points from daily counts, render as an SVG element. No need for Chart.js or Recharts.
- PageView table will grow — add a cleanup mechanism: delete views older than 90 days (run during analytics API call, or as a scheduled task).
- Aggregate popular posts by joining PageView with Post on path matching (`/blog/[slug]`).
</implementation>

<output>
Create/modify files:
- `prisma/schema.prisma` — add ContactSubmission, PageView models
- `prisma/migrations/*` — new migration
- `app/contact/page.tsx` — public contact form
- `app/api/contact/route.ts` — POST submit
- `app/api/admin/contact/route.ts` — GET list
- `app/api/admin/contact/[id]/route.ts` — PUT status, DELETE
- `app/admin/contact/page.tsx` — contact submission management
- `app/api/analytics/track/route.ts` — POST track page view
- `app/api/admin/analytics/route.ts` — GET analytics data
- `app/admin/page.tsx` — enhanced dashboard with charts and stats
- `components/ViewTracker.tsx` — client component that fires beacon on mount
- `components/SimpleChart.tsx` — SVG line chart component
- `app/layout.tsx` — add ViewTracker to public pages
</output>

<verification>
- Submit contact form → appears in admin with "New" status
- Honeypot catches bot submissions (hidden field filled = rejected)
- Admin can view, mark as read, archive, delete submissions
- Page views tracked on public pages but not admin/API routes
- Dashboard shows correct counts for posts, pages, comments, submissions
- Line chart renders daily views for selected period
- Top posts list shows most viewed content
- View count displays on individual blog posts
</verification>

<success_criteria>
- Contact form works end-to-end with spam prevention
- Admin can manage submissions with status workflow
- Page views tracked without impacting page load performance
- Dashboard provides actionable content insights
- Charts render without external dependencies
- View counts accurate and displayed on posts
</success_criteria>

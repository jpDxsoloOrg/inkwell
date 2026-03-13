<objective>
Build a browsable media library for DxPress. Currently, image uploads go to S3 but there's no way to browse, search, or reuse previously uploaded media. Every major CMS has a media library — it's essential for content management at scale.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- Images upload to S3 via presigned URLs (`app/api/upload/route.ts`)
- No record of uploaded files in the database
- No way to browse or reuse previously uploaded images
- Cover images are set per-post but the URL is just a string field

Comparable CMS features:
- **WordPress**: Media Library with grid/list views, search, filter by type/date, image editing (crop/resize), bulk upload, drag-and-drop. Every upload tracked in `wp_posts` as an "attachment" post type. Insert from Media Library when editing posts.
- **Joomla**: Media Manager with folder-based organization, upload, preview, and insert into articles.
- **Drupal**: Media module with reusable media entities, media browser for inserting into content, image styles (auto-resize).

For DxPress, we want: tracked uploads with metadata, browsable library with grid view, search, and an "insert from library" picker in the post editor.

@prisma/schema.prisma
@app/api/upload/route.ts
@app/admin/posts/new/page.tsx
</context>

<requirements>
1. **Prisma schema**: Add a `Media` model:
   - id, filename (original name), key (S3 key), url (public URL), mimeType, size (bytes)
   - width, height (for images — extracted during upload)
   - altText (user-editable), caption (optional)
   - uploadedById (FK to User)
   - createdAt

2. **API routes** (`app/api/media/`):
   - GET /api/media — list media with pagination, search (by filename/altText), filter by type (image/document/video)
   - POST /api/media — upload file (handles presigned URL generation + creates Media record)
   - PUT /api/media/[id] — update altText, caption (auth required)
   - DELETE /api/media/[id] — delete from S3 and database (auth required)
   - POST /api/media/bulk — bulk upload multiple files

3. **Admin UI** (`app/admin/media/page.tsx`):
   - Grid view showing image thumbnails (with fallback icons for non-image types)
   - List view toggle (table with filename, type, size, date, uploader)
   - Search bar (searches filename and altText)
   - Filter by file type (Images, Documents, Videos, All)
   - Upload zone: drag-and-drop area + file picker button, supports multiple files
   - Click on media item to view details: preview, edit altText/caption, copy URL, delete
   - Bulk select and delete

4. **Media picker component** (reusable):
   - Modal that opens the media library for selection
   - Shows existing uploads in grid with search/filter
   - "Upload new" tab within the picker
   - Returns selected media URL(s) to the calling component
   - Use this picker for: post cover image, page cover image, any future image fields

5. **Post editor integration**:
   - Replace direct URL input for cover image with the media picker
   - Add "Insert image" button in the content editor that opens the media picker and inserts markdown image syntax

6. **Upload improvements**:
   - Show upload progress bar for each file
   - Validate file type and size before upload (max 10MB images, 50MB documents)
   - Generate unique S3 keys to avoid collisions (prefix with date + random)
</requirements>

<implementation>
- Store the S3 key separately from the full URL so the URL can be reconstructed if the bucket/CDN changes
- For image dimensions, use the browser's Image API on the client side before upload, then send width/height to the API
- The media picker should be a client component with its own state management (not coupled to any specific page)
- Pagination: cursor-based using createdAt for efficient DynamoDB-style queries
- For the grid view, use CSS grid with consistent thumbnail sizing (cover/contain based on aspect ratio)
</implementation>

<output>
Create/modify files:
- `prisma/schema.prisma` — add Media model
- `prisma/migrations/*` — new migration
- `app/api/media/route.ts` — GET list, POST upload
- `app/api/media/[id]/route.ts` — PUT update, DELETE
- `app/api/media/bulk/route.ts` — bulk upload
- `app/admin/media/page.tsx` — media library page
- `components/MediaPicker.tsx` — reusable media picker modal
- `components/MediaGrid.tsx` — grid display component
- `components/UploadZone.tsx` — drag-and-drop upload component
- `app/admin/posts/new/page.tsx` — integrate media picker for cover image
- `app/admin/posts/[id]/edit/page.tsx` — integrate media picker for cover image
</output>

<verification>
- Upload an image → appears in media library with correct metadata
- Search by filename finds the uploaded image
- Media picker modal opens, shows library, allows selection
- Selected image URL populates the cover image field
- Delete removes from both S3 and database
- Bulk upload handles multiple files with progress indicators
- Non-image files show appropriate icons in grid view
</verification>

<success_criteria>
- All uploads tracked in database with metadata
- Browsable grid/list view with search and type filters
- Media picker works as a reusable component
- Post editor uses picker instead of raw URL input
- Upload progress shown for each file
- Delete cleans up both database and S3
</success_criteria>

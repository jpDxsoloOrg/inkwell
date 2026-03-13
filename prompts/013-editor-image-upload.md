<objective>
Add inline image uploading to the markdown editor so authors can embed images directly into blog post and project content. Currently, the editor is plain text with no way to insert images. Authors should be able to drag-and-drop, paste, or click to upload images that get stored in S3 (same as cover images) and inserted as markdown image syntax.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- The markdown editor (`components/admin/MarkdownEditor.tsx`) is a plain textarea with Write/Preview toggle and fullscreen mode. No image support.
- Image uploads already work via presigned S3 URLs (`app/api/upload/route.ts`): POST with filename + contentType → get presigned URL + public URL → PUT file to presigned URL.
- Cover images for posts/projects use this same upload flow from the admin forms.
- The editor uses markdown syntax — images would be inserted as `![alt](url)`.

Upload flow already in place:
1. POST `/api/upload` with `{ filename, contentType }` → returns `{ presignedUrl, publicUrl, key }`
2. PUT the file binary to `presignedUrl`
3. Use `publicUrl` in the content

@components/admin/MarkdownEditor.tsx — the editor component to modify
@app/api/upload/route.ts — existing upload endpoint (no changes needed)
</context>

<requirements>
1. **Toolbar upload button**:
   - Add an image icon button (use `ImagePlus` from lucide-react) to the editor toolbar, next to Write/Preview
   - Clicking opens a hidden file input restricted to image types (image/png, image/jpeg, image/gif, image/webp)
   - On file selection, upload the image and insert markdown at the cursor position

2. **Drag-and-drop upload**:
   - The textarea should accept dropped image files
   - On drop, prevent default, upload the image, and insert markdown at the drop position
   - Show a visual drop indicator (e.g., border highlight) when dragging over the textarea

3. **Paste upload**:
   - Intercept paste events in the textarea
   - If the clipboard contains an image file (e.g., screenshot paste), upload it and insert markdown at the cursor
   - If the clipboard contains text, paste normally (don't interfere)

4. **Upload flow** (reuse existing `/api/upload` endpoint):
   - Get presigned URL: `POST /api/upload` with filename and contentType
   - Upload file: `PUT` to presigned URL with the file binary
   - Insert `![filename](publicUrl)` at the cursor position in the markdown content

5. **Upload UX**:
   - While uploading, insert a placeholder at the cursor: `![Uploading filename...]()`
   - On success, replace the placeholder with the actual markdown: `![filename](publicUrl)`
   - On failure, replace the placeholder with an error indicator: `![Upload failed: filename]()`
   - Show a small progress indicator or spinner near the toolbar during upload

6. **Validation**:
   - Max file size: 10MB (check client-side before uploading)
   - Allowed types: image/png, image/jpeg, image/gif, image/webp
   - Show user-friendly error for invalid files

7. **Multiple images**:
   - If multiple files are dropped or selected, upload them sequentially (or in parallel) and insert each one
</requirements>

<implementation>
- All changes are in `components/admin/MarkdownEditor.tsx` — no new files or API changes needed
- Use a helper function for the upload flow:
  ```typescript
  async function uploadImage(file: File): Promise<{ publicUrl: string } | { error: string }> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    const { presignedUrl, publicUrl } = await res.json();
    await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    return { publicUrl };
  }
  ```
- For cursor position insertion, use `textareaRef.current.selectionStart` to know where to insert
- For placeholder replacement, use string replace on the current value
- The drag-and-drop handler needs `onDragOver` (preventDefault + visual feedback) and `onDrop` (handle files)
- The paste handler checks `e.clipboardData.files` — if it has image files, handle them; otherwise let the default paste behavior through
</implementation>

<output>
Modify files:
- `components/admin/MarkdownEditor.tsx` — add toolbar button, drag-and-drop, paste handling, upload logic
</output>

<verification>
- Click the image button in toolbar → file picker opens → select image → markdown inserted at cursor
- Drag an image file onto the textarea → image uploads → markdown inserted
- Paste a screenshot (Cmd+V / Ctrl+V) → image uploads → markdown inserted
- Paste normal text → works as before (no interference)
- Upload a file > 10MB → error message shown, no upload attempted
- While uploading → placeholder text visible in editor
- After upload → placeholder replaced with actual image markdown
- Switch to Preview → uploaded image renders in the preview
</verification>

<success_criteria>
- Three upload methods work: toolbar button, drag-and-drop, paste
- Images stored in S3 via existing presigned URL flow
- Markdown syntax inserted at correct cursor position
- Upload progress indicated with placeholder text
- File size and type validation enforced client-side
- Only MarkdownEditor.tsx modified — no API changes needed
</success_criteria>

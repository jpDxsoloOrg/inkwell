---
title: "Getting Started with DxPress"
tags: ["tutorial", "getting-started"]
published: false
excerpt: "Learn how to set up and use DxPress, a modern blogging platform built with Next.js."
---

## Welcome to DxPress

DxPress is a modern WordPress alternative built with Next.js, TypeScript, and PostgreSQL. This guide will walk you through the basics.

### Features

- Rich markdown editing with live preview
- Tag-based organization
- Media library with drag-and-drop uploads
- Role-based access control
- SEO-friendly with meta tags and sitemaps

### Writing Your First Post

Create a markdown file with front matter:

```markdown
---
title: "My First Post"
tags: ["blog"]
published: true
---

Your content here...
```

Then publish it using the Claude Code skill:

```
/publish-post content/posts/my-first-post.md
```

That's it! Your post is live.

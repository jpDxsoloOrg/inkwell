<objective>
Expand DxPress's user system from a single admin to a multi-user platform with role-based access control. Every major CMS supports multiple user roles — this is foundational for any team-managed content site.
</objective>

<context>
Read CLAUDE.md for project conventions and tech stack.

Current state:
- Single `User` model with only `ADMIN` role
- One admin account, no user registration or invitation system
- All admin routes are all-or-nothing: you're admin or you're not
- NextAuth configured with Credentials provider, JWT sessions

Comparable CMS features:
- **WordPress**: 5 default roles — Administrator, Editor, Author, Contributor, Subscriber. Each has specific capabilities (publish_posts, edit_others_posts, manage_categories, etc.). Admins can create users and assign roles.
- **Joomla**: Flexible ACL with groups (Super Users, Administrators, Managers, Publishers, Editors, Authors, Registered). Permission inheritance through group hierarchy.
- **Drupal**: Role-based permissions. Default roles: Anonymous, Authenticated, Administrator. Custom roles can be created with granular permissions.

For DxPress, implement WordPress-style roles: Admin, Editor, Author with clear capability boundaries.

@prisma/schema.prisma
@app/api/auth/[...nextauth]/route.ts
@app/admin/layout.tsx
</context>

<requirements>
1. **Role definitions**:
   - **ADMIN**: Full access — manage all content, users, settings, categories, menus, comments
   - **EDITOR**: Manage all content (own + others' posts/pages), manage categories, moderate comments. Cannot manage users or site settings.
   - **AUTHOR**: Create and manage own posts only. Cannot edit others' content, manage categories, or access settings.

2. **Prisma schema updates**:
   - Expand Role enum: ADMIN, EDITOR, AUTHOR
   - Add to User: avatarUrl, bio, lastLoginAt

3. **User management API** (`app/api/admin/users/`):
   - GET /api/admin/users — list all users (admin only)
   - POST /api/admin/users — create/invite user with role (admin only)
   - PUT /api/admin/users/[id] — update user role, name, email (admin only; cannot demote self)
   - DELETE /api/admin/users/[id] — delete user (admin only; cannot delete self; reassign content to admin)

4. **Auth updates**:
   - Include role in JWT session token
   - Update NextAuth callbacks to include role in session
   - Create a `usePermissions` hook or utility for capability checks

5. **Permission middleware**:
   - Create a reusable `requireRole(roles: Role[])` wrapper for API routes
   - Posts API: Authors can only GET/PUT/DELETE their own posts; Editors can manage all posts
   - Categories/Menus/Settings/Users: Admin only (Settings, Users), Admin + Editor (Categories, Menus, Comments)

6. **Admin UI updates**:
   - User management page (`app/admin/users/page.tsx`): list users, create, edit role, delete (admin only)
   - Conditionally show/hide admin nav items based on role (Authors don't see Settings, Users, etc.)
   - Post list: Authors see only their posts; Editors/Admins see all
   - Show current user info in admin header/sidebar

7. **Author profile**: Public author page at `/author/[slug]` showing author name, bio, and their published posts
</requirements>

<implementation>
- Use NextAuth's JWT callback to embed role in the token, and session callback to expose it
- Permission utility should be a simple function, not a complex RBAC library:
  ```typescript
  function canEditPost(session: Session, post: Post): boolean {
    return session.user.role === 'ADMIN' || session.user.role === 'EDITOR' || post.authorId === session.user.id;
  }
  ```
- For the API middleware, a higher-order function pattern works well:
  ```typescript
  export const withRole = (roles: Role[], handler: Handler) => async (req, ctx) => { ... }
  ```
- User creation should use bcrypt for password hashing (already in dependencies)
- When deleting a user, reassign their posts to the admin performing the deletion
</implementation>

<output>
Create/modify files:
- `prisma/schema.prisma` — expand Role enum, update User model
- `prisma/migrations/*` — new migration
- `lib/permissions.ts` — role checking utilities
- `lib/auth.ts` — requireRole middleware
- `app/api/auth/[...nextauth]/route.ts` — update JWT/session callbacks
- `app/api/admin/users/route.ts` — GET list, POST create
- `app/api/admin/users/[id]/route.ts` — PUT update, DELETE
- `app/api/posts/route.ts` — add role-based filtering
- `app/api/posts/[id]/route.ts` — add ownership checks
- `app/admin/users/page.tsx` — user management UI
- `app/admin/layout.tsx` — conditional nav based on role
- `app/author/[slug]/page.tsx` — public author profile
</output>

<verification>
- Admin can create users with Editor and Author roles
- Editor can edit any post but cannot access Settings or Users
- Author can only see and edit their own posts
- Admin nav shows/hides items based on role
- Cannot demote or delete yourself as admin
- Deleting a user reassigns their content
- Author profile page shows correct posts
</verification>

<success_criteria>
- Three distinct roles with correct capability boundaries
- API routes enforce permissions (not just UI hiding)
- User CRUD works for admin
- Post ownership enforced for Authors
- JWT sessions include role information
</success_criteria>

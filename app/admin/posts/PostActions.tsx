"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";

interface PostActionsProps {
  postId: string;
  published: boolean;
}

export function PostActions({ postId, published }: PostActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Failed to toggle publish: ${data.error || res.statusText}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
    setLoading(false);
    router.refresh();
  }

  async function deletePost() {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Failed to delete: ${data.error || res.statusText}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/posts/${postId}/edit`}
        className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </Link>
      <button
        onClick={togglePublish}
        disabled={loading}
        className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        title={published ? "Unpublish" : "Publish"}
      >
        {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <button
        onClick={deletePost}
        disabled={loading}
        className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/50 dark:hover:text-red-400"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

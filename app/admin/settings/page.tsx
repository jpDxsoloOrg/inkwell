"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

interface SiteConfigForm {
  siteName: string;
  siteDescription: string;
  ownerName: string;
  ownerTitle: string;
  ownerBio: string;
  avatarUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  email: string;
  careerStartDate: string;
}

const emptyForm: SiteConfigForm = {
  siteName: "",
  siteDescription: "",
  ownerName: "",
  ownerTitle: "",
  ownerBio: "",
  avatarUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  email: "",
  careerStartDate: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SiteConfigForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            siteName: data.siteName ?? "",
            siteDescription: data.siteDescription ?? "",
            ownerName: data.ownerName ?? "",
            ownerTitle: data.ownerTitle ?? "",
            ownerBio: data.ownerBio ?? "",
            avatarUrl: data.avatarUrl ?? "",
            githubUrl: data.githubUrl ?? "",
            linkedinUrl: data.linkedinUrl ?? "",
            twitterUrl: data.twitterUrl ?? "",
            email: data.email ?? "",
            careerStartDate: data.careerStartDate
              ? new Date(data.careerStartDate).toISOString().split("T")[0]
              : "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save");
      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Site Settings
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Configure your site metadata and social links.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span
              className={`text-sm ${
                message.includes("success")
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <fieldset className="space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          <legend className="px-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Site Information
          </legend>
          <FormField
            label="Site Name"
            value={form.siteName}
            onChange={(v) => setForm({ ...form, siteName: v })}
          />
          <FormTextarea
            label="Site Description"
            value={form.siteDescription}
            onChange={(v) => setForm({ ...form, siteDescription: v })}
          />
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          <legend className="px-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Owner Information
          </legend>
          <FormField
            label="Name"
            value={form.ownerName}
            onChange={(v) => setForm({ ...form, ownerName: v })}
          />
          <FormField
            label="Title"
            value={form.ownerTitle}
            onChange={(v) => setForm({ ...form, ownerTitle: v })}
            placeholder="e.g., Senior Full-Stack Developer"
          />
          <FormTextarea
            label="Bio"
            value={form.ownerBio}
            onChange={(v) => setForm({ ...form, ownerBio: v })}
            rows={4}
          />
          <FormField
            label="Avatar URL"
            value={form.avatarUrl}
            onChange={(v) => setForm({ ...form, avatarUrl: v })}
            placeholder="https://..."
          />
          <FormField
            label="Career Start Date"
            value={form.careerStartDate}
            onChange={(v) => setForm({ ...form, careerStartDate: v })}
            type="date"
          />
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          <legend className="px-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Social Links
          </legend>
          <FormField
            label="GitHub URL"
            value={form.githubUrl}
            onChange={(v) => setForm({ ...form, githubUrl: v })}
            placeholder="https://github.com/..."
          />
          <FormField
            label="LinkedIn URL"
            value={form.linkedinUrl}
            onChange={(v) => setForm({ ...form, linkedinUrl: v })}
            placeholder="https://linkedin.com/in/..."
          />
          <FormField
            label="Twitter URL"
            value={form.twitterUrl}
            onChange={(v) => setForm({ ...form, twitterUrl: v })}
            placeholder="https://twitter.com/..."
          />
          <FormField
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="you@example.com"
            type="email"
          />
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
      />
    </div>
  );
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownPreview } from "./MarkdownPreview";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in markdown...",
  minHeight = "400px",
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        // Restore cursor position after React re-renders
        requestAnimationFrame(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange]
  );

  // Auto-save to localStorage
  useEffect(() => {
    if (value) {
      localStorage.setItem("dxpress-editor-draft", value);
    }
  }, [value]);

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-950"
    : "flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800";

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition-colors",
              !showPreview
                ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
              showPreview
                ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {showPreview ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Preview
          </button>
        </div>
        <button
          type="button"
          onClick={() => setFullscreen(!fullscreen)}
          className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          {fullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <div
            className="overflow-y-auto p-6"
            style={{ minHeight, maxHeight: fullscreen ? "calc(100vh - 50px)" : "600px" }}
          >
            <MarkdownPreview content={value} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent p-4 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-white dark:placeholder-neutral-500"
            style={{
              minHeight,
              maxHeight: fullscreen ? "calc(100vh - 50px)" : "600px",
            }}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

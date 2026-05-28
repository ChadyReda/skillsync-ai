"use client";

import { useRef, useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import { ImageIcon, Loader2, Send, X } from "lucide-react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface FeedComposeProps {
  createPost: (formData: FormData) => Promise<void>;
}

export default function FeedCompose({ createPost }: FeedComposeProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { startUpload } = useUploadThing("feedImageUploader", {
    onUploadBegin: () => setImageUploading(true),
    onClientUploadComplete: (res) => {
      setImageUrl(res[0]?.url ?? null);
      setImageUploading(false);
    },
    onUploadError: () => {
      setImageUploading(false);
      setImagePreview(null);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setImageUrl(null);
    await startUpload([file]);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl(null);
    setImageUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading || imageUploading) return;
    setLoading(true);

    const formData = new FormData();
    formData.set("content", content);
    if (imageUrl) formData.set("imageUrl", imageUrl);

    await createPost(formData);
    setContent("");
    removeImage();
    setLoading(false);
  };

  const charLimit = 500;
  const remaining = charLimit - content.length;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm transition-all duration-200 focus-within:border-zinc-700/80"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
    >
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Compose
        </span>
        <span
          className={[
            "font-mono text-[10px] tabular-nums uppercase tracking-[0.2em]",
            remaining < 50 ? "text-amber-400" : "text-zinc-600",
          ].join(" ")}
        >
          {remaining} left
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
        placeholder="What's on your mind? Share an update, idea, or question..."
        rows={3}
        className="w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-white placeholder-zinc-600 focus:outline-none"
      />

      {/* Image preview */}
      {imagePreview && (
        <div className="relative mx-4 mb-3 overflow-hidden rounded-xl border border-zinc-800/60">
          <img
            src={imagePreview}
            alt="Attachment preview"
            className="max-h-64 w-full object-cover"
          />
          {imageUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={removeImage}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-900/80 text-zinc-400 backdrop-blur-sm transition-colors hover:border-zinc-600 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-zinc-800/50 px-3 py-2.5">
        {/* Attach image */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || imageUploading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/60 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-40"
          title="Attach image"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="submit"
          disabled={!content.trim() || loading || imageUploading}
          className="inline-flex h-8 items-center gap-2 rounded-xl border border-white/20 bg-white px-4 text-xs font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            boxShadow:
              loading || !content.trim() || imageUploading
                ? "none"
                : "0 0 16px rgba(255,255,255,0.1)",
          }}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          Post
        </button>
      </div>
    </form>
  );
}

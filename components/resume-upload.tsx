"use client";

import { useRef, useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { Upload, Loader2 } from "lucide-react";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ResumeUploadProps {
  onUploadStart?: () => void;
  onComplete: (url: string) => void;
}

export default function ResumeUpload({
  onUploadStart,
  onComplete,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { startUpload, isUploading } = useUploadThing("resumeUploader", {
    onUploadBegin: () => {
      onUploadStart?.();
    },
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        onComplete(res[0].ufsUrl);
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error.message);
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files?.length || isUploading) return;
    startUpload(Array.from(files));
  };

  const openPicker = () => {
    if (isUploading || !inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.click();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => e.key === "Enter" && openPicker()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={[
        "flex select-none flex-col items-center gap-3 border border-dashed px-6 py-10 transition-colors",
        isUploading
          ? "cursor-not-allowed border-zinc-700 bg-zinc-950"
          : isDragging
            ? "cursor-copy border-white bg-zinc-900"
            : "cursor-pointer border-zinc-700 bg-zinc-950 hover:border-zinc-500 hover:bg-zinc-900",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        disabled={isUploading}
      />

      <div className="flex h-12 w-12 items-center justify-center border border-zinc-800 bg-black">
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : (
          <Upload className="h-5 w-5 text-zinc-400" />
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-zinc-200">
          {isUploading ? "Uploading..." : "Drop your CV here or click to browse"}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          PDF · max 8 MB
        </p>
      </div>
    </div>
  );
}

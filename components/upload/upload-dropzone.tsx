"use client";

import React, { useRef, useState } from "react";
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

export function UploadDropzone({
  onFileSelected,
  accept = ".csv,.xlsx",
  disabled = false,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (file && !disabled) {
      onFileSelected(file);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
    // reset so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors cursor-pointer select-none",
        dragging
          ? "border-[var(--institution-primary,#E60000)] bg-red-50"
          : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <CloudUpload className="size-10 text-zinc-400" aria-hidden />
      <div>
        <p className="text-sm font-medium text-zinc-700">
          Drop CSV or XLSX here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supported formats: .csv, .xlsx
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onInputChange}
        aria-hidden
      />
    </div>
  );
}

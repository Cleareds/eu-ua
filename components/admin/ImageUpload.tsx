"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
}

export default function ImageUpload({ value, onChange, folder = "objects", adminFetch }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await adminFetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors text-center"
      >
        {value ? (
          <div className="relative w-full h-40">
            <Image src={value} alt="Preview" fill className="object-contain rounded" />
          </div>
        ) : (
          <div className="py-4 text-sm text-gray-400">
            {uploading ? "Uploading…" : "Click or drag & drop image (JPEG, PNG, WebP, max 8 MB)"}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {value && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 font-mono text-gray-500"
            placeholder="Or paste an image URL"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-500 hover:underline shrink-0"
          >
            Remove
          </button>
        </div>
      )}
      {!value && (
        <input
          type="text"
          onChange={e => onChange(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 font-mono text-gray-500"
          placeholder="Or paste an image URL directly"
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { useToast } from "@/context/ToastProvider";
import { cn, errorMessage } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  onAltChange?: (alt: string) => void;
  altValue?: string;
  folder: string;
  label?: string;
  altLabel?: string;
  required?: boolean;
  aspect?: string;
  disabled?: boolean;
}

/** Uploads through the signed server route (/api/upload) so the Cloudinary
 *  secret never touches the browser, with a required alt-text field. */
export function ImageUpload({
  value,
  onChange,
  onAltChange,
  altValue,
  folder,
  label = "Image",
  altLabel = "Alt text (for screen readers)",
  required,
  aspect = "aspect-[4/3]",
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Upload failed");
      onChange(payload.secure_url, payload.public_id);
      toast("Image uploaded successfully.");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
      </span>
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-line bg-surface-subtle",
          aspect,
          value && "border-solid",
        )}
      >
        {value ? (
          <>
            <Image src={value} alt={altValue || label} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-ink/70 to-transparent p-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
              >
                Replace
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onChange("")}
                disabled={disabled}
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex flex-col items-center gap-2 p-6 text-ink-muted hover:text-primary disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
            ) : (
              <ImagePlus className="h-7 w-7" aria-hidden />
            )}
            <span className="text-sm font-medium">{uploading ? "Uploading…" : "Click to upload"}</span>
            <span className="text-xs">PNG, JPG or WEBP · hosted on Cloudinary</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {onAltChange && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-muted" htmlFor={`${folder}-alt`}>
            {altLabel}
          </label>
          <input
            id={`${folder}-alt`}
            type="text"
            value={altValue ?? ""}
            onChange={(event) => onAltChange(event.target.value)}
            placeholder="Describe the image for visually impaired visitors"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </div>
      )}
    </div>
  );
}

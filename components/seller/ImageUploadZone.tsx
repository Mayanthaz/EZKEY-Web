"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

type ImageUploadZoneProps = {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
};

export function ImageUploadZone({
  images,
  onChange,
  maxImages = 5,
}: ImageUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file format. Please upload PNG, JPG, or WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image exceeds 5MB size limit.");
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum of ${maxImages} images allowed.`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/seller/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const updated = [...images, data.url];
      onChange(updated);
      toast.success("Image uploaded to internal server!");
    } catch (err: any) {
      toast.error(err.message || "Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList[0]) {
      handleUploadFile(fileList[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    toast.info("Image removed");
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-neon-purple bg-neon-purple/10"
            : "border-cyber-border hover:border-neon-purple/40 hover:bg-white/[0.02]"
        } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || images.length >= maxImages}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isUploading
                ? "Processing image on internal server..."
                : "Click or drag & drop product image"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PNG, JPG, WEBP up to 5MB (Max {maxImages} images)
            </p>
          </div>
        </div>
      </div>

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative aspect-video sm:aspect-square rounded-xl border border-cyber-border bg-cyber-card overflow-hidden"
            >
              <img
                src={url}
                alt={`Product image ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/assets/placeholder-game.png";
                }}
              />
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-neon-purple text-[10px] font-bold text-white uppercase tracking-wider shadow">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 text-white/80 hover:text-red-400 hover:bg-black transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

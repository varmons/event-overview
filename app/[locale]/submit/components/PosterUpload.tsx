"use client";

import { ChangeEvent, DragEvent } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface PosterUploadProps {
  t: (key: string) => string;
  posterPreview: string | null;
  error?: string;
  onFileSelect: (file: File) => boolean;
  onClear: () => void;
}

export function PosterUpload({
  t,
  posterPreview,
  error,
  onFileSelect,
  onClear,
}: PosterUploadProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="flex items-start gap-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("fields.poster.label")}
        </label>
        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <div className="space-y-2 text-center pointer-events-none">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm">
              <span className="font-medium text-blue-600">
                {t("fields.poster.button")}
              </span>
              <span className="text-gray-500"> {t("fields.poster.dragDrop")}</span>
            </div>
            <p className="text-xs text-gray-500">{t("fields.poster.requirements")}</p>
          </div>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {posterPreview && (
        <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
          <Image
            src={posterPreview}
            alt={t("fields.poster.label")}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

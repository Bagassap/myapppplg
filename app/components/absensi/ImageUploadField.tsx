"use client";

import { useRef } from "react";
import { Camera, Pen, FileImage, X, Loader2, CheckCircle } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

type ImageType = "foto" | "ttd" | "bukti";

type Props = {
  type: ImageType;
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  required?: boolean;
  disabled?: boolean;
};

const TYPE_CONFIG = {
  foto: {
    icon: Camera,
    accept: "image/jpeg,image/jpg,image/png,image/webp",
    hint: "JPG, PNG, WebP • Maks 10MB • Otomatis dikompres",
    color: "indigo",
  },
  ttd: {
    icon: Pen,
    accept: "image/jpeg,image/jpg,image/png,image/webp",
    hint: "Foto tanda tangan jelas • Otomatis dikompres",
    color: "emerald",
  },
  bukti: {
    icon: FileImage,
    accept: "image/jpeg,image/jpg,image/png,image/webp",
    hint: "Foto bukti kegiatan • Otomatis dikompres",
    color: "amber",
  },
};

export default function ImageUploadField({
  type,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { url, sizeKB, uploading, error, preview, upload, reset } =
    useImageUpload();

  const cfg = TYPE_CONFIG[type];
  const IconComp = cfg.icon;
  const displayUrl = url ?? value ?? null;
  const displayPreview = preview ?? displayUrl;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file, type, value ?? undefined);
    if (result) onChange(result);
    e.target.value = "";
  }

  function handleRemove() {
    reset();
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {displayPreview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={displayPreview}
            alt={label}
            className="w-full max-h-48 object-contain"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="text-white text-sm font-medium">
                Mengkompresi & upload...
              </p>
            </div>
          )}

          {sizeKB && !uploading && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3 text-green-400" />
              {sizeKB} KB
            </div>
          )}

          {!uploading && !disabled && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow text-gray-600 text-xs font-medium transition-colors"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className={`w-full border-2 border-dashed rounded-xl py-8 px-4 flex flex-col items-center gap-2 transition-colors
            ${
              disabled
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer"
            }`}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          ) : (
            <IconComp className="w-8 h-8 text-gray-400" />
          )}
          <p className="text-sm text-gray-600 font-medium">
            {uploading
              ? "Mengkompresi & mengupload..."
              : `Klik untuk pilih ${label}`}
          </p>
          <p className="text-xs text-gray-400">{cfg.hint}</p>
        </button>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={cfg.accept}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />
    </div>
  );
}

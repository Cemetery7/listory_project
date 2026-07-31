"use client";

import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";

export function StoryCoverField({ value, onChange, onPendingChange, onToast }: {
  value: string | null;
  onChange: (url: string | null) => void;
  onPendingChange?: (pending: boolean) => void;
  onToast: (message: string) => void;
}) {
  const [preview, setPreview] = useState(value ?? "");
  const [pending, setPending] = useState(false);

  const selectCover = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      onToast("Выберите изображение JPEG, PNG или WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onToast("Размер обложки не должен превышать 5 МБ.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setPending(true);
    onPendingChange?.(true);

    try {
      const blob = await upload(`covers/${sanitizeFilename(file.name)}`, file, {
        access: "public",
        handleUploadUrl: "/api/uploads/cover"
      });
      setPreview(blob.url);
      onChange(blob.url);
    } catch {
      setPreview(value ?? "");
      onToast("Не удалось загрузить обложку. Проверьте настройку Vercel Blob.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setPending(false);
      onPendingChange?.(false);
    }
  };

  return (
    <div className="relative aspect-[4/5] self-start overflow-hidden rounded-lg border border-dashed border-border bg-elevated">
      {preview ? (
        <>
          <Image alt="Предпросмотр обложки" className="object-cover" fill sizes="220px" src={preview} unoptimized={preview.startsWith("blob:")} />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-background/80 p-3 backdrop-blur-[16px]">
            <label className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white">
              <ImagePlus size={16} />
              {pending ? "Загрузка..." : "Заменить"}
              <input accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={pending} onChange={(event) => { void selectCover(event.target.files?.[0]); event.target.value = ""; }} type="file" />
            </label>
            <button aria-label="Удалить обложку" className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-text-secondary transition hover:text-primary" disabled={pending} title="Удалить обложку" type="button" onClick={() => { setPreview(""); onChange(null); }}>
              <X size={17} />
            </button>
          </div>
        </>
      ) : (
        <label className="group flex h-full cursor-pointer flex-col items-center justify-center px-5 text-center transition duration-200 hover:bg-surface">
          <span className="grid h-14 w-14 place-items-center rounded-md bg-primary/15 text-primary"><ImagePlus size={24} /></span>
          <span className="mt-4 text-sm font-semibold text-text-primary">Обложка</span>
          <span className="mt-2 text-xs leading-5 text-text-muted">JPEG, PNG или WebP, до 5 МБ.</span>
          <input accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={pending} onChange={(event) => { void selectCover(event.target.files?.[0]); event.target.value = ""; }} type="file" />
        </label>
      )}
    </div>
  );
}

function sanitizeFilename(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `cover-${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

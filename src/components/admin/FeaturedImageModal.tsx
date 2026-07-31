'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { ImageDropzone } from '@/components/admin/categories/ImageDropzone';

/**
 * Se pide la imagen en el mismo gesto de destacar.
 *
 * Marcar la estrella de una categoría sin imagen no falla con un error: la
 * portada solo muestra destacadas con imagen, así que el modal pide la que
 * falta y guarda las dos cosas juntas.
 */

interface FeaturedImageModalProps {
  isOpen: boolean;
  /** Para nombrar la categoría en el texto; opcional en la edición. */
  categoryName?: string | null;
  onUpload: (file: File) => Promise<void>;
  onCancel: () => void;
  isUploading: boolean;
}

export function FeaturedImageModal({
  isOpen,
  categoryName,
  onUpload,
  onCancel,
  isUploading,
}: FeaturedImageModalProps) {
  const t = useTranslations('categories');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSelect = (file: File) => {
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch {
      // El error ya se avisó por toast; el modal se queda abierto con el
      // archivo elegido para poder reintentar.
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 transition-opacity"
        onClick={isUploading ? undefined : handleCancel}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="featured-image-title"
          className="relative w-full max-w-md rounded-2xl border border-sand-300 bg-white p-6 shadow-xl animate-[modalSlide_0.3s_ease-out]"
        >
          <h3
            id="featured-image-title"
            className="font-display text-lg font-bold text-ink"
          >
            {t('featuredImageModalTitle')}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-sand-700">
            {categoryName
              ? t('featuredImageModalDescriptionNamed', { name: categoryName })
              : t('featuredImageModalDescription')}
          </p>

          <div className="mt-5">
            {previewUrl ? (
              <div className="relative h-44 w-full overflow-hidden rounded-lg border border-sand-300">
                <Image src={previewUrl} alt={t('imageSelected')} fill className="object-cover" />
              </div>
            ) : (
              <ImageDropzone onSelect={handleSelect} disabled={isUploading} />
            )}
            {selectedFile && (
              <p className="mt-2 text-[12.5px] text-sand-700">
                {t('fileSelected', { filename: selectedFile.name })}
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUploading}
              className="flex-1 rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-sand-700 transition-colors hover:bg-sand-50 disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? t('uploadingImage') : t('uploadAndSetFeatured')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

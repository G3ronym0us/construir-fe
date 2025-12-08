'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface FeaturedImageModalProps {
  isOpen: boolean;
  onUpload: (file: File) => Promise<void>;
  onCancel: () => void;
  isUploading: boolean;
}

export function FeaturedImageModal({
  isOpen,
  onUpload,
  onCancel,
  isUploading,
}: FeaturedImageModalProps) {
  const t = useTranslations('categories');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }
    await onUpload(selectedFile);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay - no clickeable durante upload */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={isUploading ? undefined : handleCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-[modalSlide_0.3s_ease-out]">

          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            {t('featuredImageModalTitle')}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {t('featuredImageModalDescription')}
          </p>

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('selectImageForFeatured')}
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp"
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('imageSelected')}
              </p>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('cancelFeatured')}
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? t('uploadingImage') : t('uploadAndSetFeatured')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

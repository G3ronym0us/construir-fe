'use client';

import { useState } from 'react';
import { Upload, CheckCircle, Info, Monitor, Tablet, Smartphone } from 'lucide-react';
import type { BannerImageVariants } from '@/types';

interface BannerImageInputsProps {
  currentImages?: BannerImageVariants;
  required?: boolean;
  onImageChange: (file: File | null) => void;
  onDesktopChange: (file: File | null) => void;
  onTabletChange: (file: File | null) => void;
  onMobileChange: (file: File | null) => void;
}

function UploadZone({ id, onChange, fileName, required }: {
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
  required?: boolean;
}) {
  return (
    <div>
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={onChange}
        required={required}
        className="sr-only peer"
      />
      <label
        htmlFor={id}
        className={`
          flex flex-col items-center gap-2 cursor-pointer rounded-lg
          border-2 border-dashed p-4 text-center transition-colors duration-150
          peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2
          ${fileName
            ? 'border-green-400 bg-green-50 hover:bg-green-100'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'}
        `}
      >
        {fileName ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700 truncate max-w-full">{fileName}</span>
            <span className="text-xs text-gray-400">Haz clic para cambiar</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Haz clic para seleccionar</span>
            <span className="text-xs text-gray-400">PNG, JPG, WebP</span>
          </>
        )}
      </label>
    </div>
  );
}

export default function BannerImageInputs({
  currentImages,
  required = false,
  onImageChange,
  onDesktopChange,
  onTabletChange,
  onMobileChange,
}: BannerImageInputsProps) {
  const [generalPreview, setGeneralPreview] = useState<string | null>(null);
  const [generalFile, setGeneralFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [tabletPreview, setTabletPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [tabletFile, setTabletFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);

  const createPreview = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => { callback(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGeneralFile(file);
    createPreview(file, (url) => {
      setGeneralPreview(url);
      if (!desktopFile) setDesktopPreview(url);
      if (!tabletFile) setTabletPreview(url);
      if (!mobileFile) setMobilePreview(url);
    });
    onImageChange(file);
  };

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDesktopFile(file);
    createPreview(file, setDesktopPreview);
    onDesktopChange(file);
  };

  const handleTabletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTabletFile(file);
    createPreview(file, setTabletPreview);
    onTabletChange(file);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMobileFile(file);
    createPreview(file, setMobilePreview);
    onMobileChange(file);
  };

  const VARIANTS = [
    {
      key: 'desktop',
      label: 'Desktop',
      icon: Monitor,
      inputId: 'desktopImage',
      dimensions: '1920 × 600 px',
      aspectRatio: '16/5',
      file: desktopFile,
      preview: desktopPreview,
      currentSrc: currentImages?.desktop.jpeg,
      onChange: handleDesktopChange,
    },
    {
      key: 'tablet',
      label: 'Tablet',
      icon: Tablet,
      inputId: 'tabletImage',
      dimensions: '1024 × 320 px',
      aspectRatio: '16/5',
      file: tabletFile,
      preview: tabletPreview,
      currentSrc: currentImages?.tablet.jpeg,
      onChange: handleTabletChange,
    },
    {
      key: 'mobile',
      label: 'Mobile',
      icon: Smartphone,
      inputId: 'mobileImage',
      dimensions: '640 × 360 px',
      aspectRatio: '16/9',
      file: mobileFile,
      preview: mobilePreview,
      currentSrc: currentImages?.mobile.jpeg,
      onChange: handleMobileChange,
    },
  ];

  return (
    <>
      {/* Imagen General */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Imagen General{required ? ' *' : ''}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Base para todas las variantes</p>
          </div>
          <div className="relative group">
            <button type="button" className="text-blue-400 hover:text-blue-600 mt-0.5 rounded focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:outline-none">
              <Info className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block w-72 bg-gray-800 text-white text-xs rounded py-2 px-3 z-10">
              {required
                ? 'Esta imagen se usará como base para generar las variantes de desktop, tablet y mobile (a menos que subas imágenes personalizadas abajo).'
                : 'Si subes una imagen aquí, se generarán nuevas variantes para todos los dispositivos.'}
            </div>
          </div>
        </div>
        <UploadZone
          id="image"
          onChange={handleGeneralChange}
          fileName={generalFile?.name ?? null}
          required={required}
        />
        {(generalPreview || currentImages) && (
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <p className="text-xs font-medium text-gray-500 px-3 py-1.5 border-b bg-white">Vista previa</p>
            <div className="w-full" style={{ aspectRatio: '16/5' }}>
              <img
                src={generalPreview ?? currentImages!.desktop.jpeg}
                alt="Vista previa general"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Variantes por dispositivo */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
            Variantes personalizadas (Opcional)
          </h3>
          <div className="flex-1 border-t border-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VARIANTS.map((variant) => {
            const Icon = variant.icon;
            return (
              <div key={variant.key} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800">{variant.label}</span>
                  </div>
                  {!variant.file && generalPreview && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Usando imagen general
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{variant.dimensions}</p>
                <UploadZone
                  id={variant.inputId}
                  onChange={variant.onChange}
                  fileName={variant.file?.name ?? null}
                />
                {(variant.preview || variant.currentSrc) && (
                  <div
                    className="rounded-md overflow-hidden border border-gray-200 w-full"
                    style={{ aspectRatio: variant.aspectRatio }}
                  >
                    <img
                      src={variant.preview ?? variant.currentSrc!}
                      alt={`${variant.label} preview`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

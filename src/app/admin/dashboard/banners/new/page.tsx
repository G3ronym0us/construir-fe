'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBanner } from '@/services/banners';

export default function NewBannerPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [priority, setPriority] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Imagen general (siempre requerida)
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Imágenes personalizadas (opcionales)
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [tabletImage, setTabletImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [tabletPreview, setTabletPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      setError('La imagen general es requerida');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createBanner({
        title,
        description: description || undefined,
        link: link || undefined,
        priority,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
        image, // Siempre enviamos la imagen general
        desktopImage: desktopImage || undefined,
        tabletImage: tabletImage || undefined,
        mobileImage: mobileImage || undefined,
      });
      router.push('/admin/dashboard/banners');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear banner');
    } finally {
      setLoading(false);
    }
  };

  const createPreview = (file: File, setPreview: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      createPreview(file, setImagePreview);
    }
  };

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDesktopImage(file);
      createPreview(file, setDesktopPreview);
    }
  };

  const handleTabletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTabletImage(file);
      createPreview(file, setTabletPreview);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMobileImage(file);
      createPreview(file, setMobilePreview);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/dashboard/banners"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Volver a banners
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nuevo Banner</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Imagen General - SIEMPRE REQUERIDA */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Imagen General * (base para todas las variantes)
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            <p className="mt-1 text-sm text-gray-500">
              Esta imagen se usará como base para generar las variantes de desktop, tablet y mobile (a menos que subas imágenes personalizadas abajo).
            </p>

            {imagePreview && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Vista previa:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded border border-gray-200 max-w-md"
                />
              </div>
            )}
          </div>

          {/* Imágenes Personalizadas - OPCIONALES */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Imágenes Personalizadas (Opcional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Si deseas usar imágenes diferentes para cada dispositivo, súbelas aquí. Si no las subes, se usará la imagen general.
            </p>

            <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
              {/* Desktop personalizado */}
              <div>
                <label htmlFor="desktopImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Desktop personalizada (recomendado: 1920x600)
                </label>
                <input
                  id="desktopImage"
                  type="file"
                  accept="image/*"
                  onChange={handleDesktopChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                {desktopPreview && (
                  <div className="mt-2">
                    <img
                      src={desktopPreview}
                      alt="Desktop Preview"
                      className="rounded border border-gray-200"
                      style={{ width: '480px', height: '150px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              {/* Tablet personalizado */}
              <div>
                <label htmlFor="tabletImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Tablet personalizada (recomendado: 1024x400)
                </label>
                <input
                  id="tabletImage"
                  type="file"
                  accept="image/*"
                  onChange={handleTabletChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                {tabletPreview && (
                  <div className="mt-2">
                    <img
                      src={tabletPreview}
                      alt="Tablet Preview"
                      className="rounded border border-gray-200"
                      style={{ width: '256px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              {/* Mobile personalizado */}
              <div>
                <label htmlFor="mobileImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Mobile personalizada (recomendado: 640x400)
                </label>
                <input
                  id="mobileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleMobileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                {mobilePreview && (
                  <div className="mt-2">
                    <img
                      src={mobilePreview}
                      alt="Mobile Preview"
                      className="rounded border border-gray-200"
                      style={{ width: '160px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
              URL de Enlace
            </label>
            <input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://ejemplo.com/destino"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad (mayor número = mayor prioridad)
            </label>
            <input
              id="priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Banner activo
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Banner'}
            </button>
            <Link
              href="/admin/dashboard/banners"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { createBanner } from '@/services/banners';
import BannerImageInputs from '@/components/admin/BannerImageInputs';
import BannerLinkInput from '@/components/admin/BannerLinkInput';
import { Toggle } from '@/components/ui/Toggle';

export default function NewBannerPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [image, setImage] = useState<File | null>(null);
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [tabletImage, setTabletImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);

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
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
        image,
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

  return (
    <div>
      <Link
        href="/admin/dashboard/banners"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a banners
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nuevo Banner</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-5xl">
        <div className="flex flex-col gap-6">

          {/* Información del Banner */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base font-semibold text-gray-900">Información del Banner</h2>
              <p className="text-sm text-gray-500 mt-0.5">Contenido y configuración</p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Enlace
                </label>
                <BannerLinkInput value={link} onChange={setLink} />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <Toggle
                  id="isActive"
                  label="Banner activo"
                  description="El banner aparecerá en el carrusel principal"
                  checked={isActive}
                  onChange={setIsActive}
                  color="green"
                />
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="border-b border-gray-100 pb-4 mb-5">
              <h2 className="text-base font-semibold text-gray-900">Imágenes</h2>
              <p className="text-sm text-gray-500 mt-0.5">Imagen general y variantes por dispositivo</p>
            </div>
            <div className="space-y-6">
              <BannerImageInputs
                required
                onImageChange={setImage}
                onDesktopChange={setDesktopImage}
                onTabletChange={setTabletImage}
                onMobileChange={setMobileImage}
              />
            </div>
          </div>

        </div>

        {/* Barra de acciones */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <Link
            href="/admin/dashboard/banners"
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creando...' : 'Crear Banner'}
          </button>
        </div>
      </form>
    </div>
  );
}

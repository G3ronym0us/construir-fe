'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { getBannerByUuid, updateBanner } from '@/services/banners';
import type { Banner } from '@/types';
import BannerImageInputs from '@/components/admin/BannerImageInputs';
import BannerLinkInput from '@/components/admin/BannerLinkInput';
import { Toggle } from '@/components/ui/Toggle';

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerUuid = params.id as string;

  const [banner, setBanner] = useState<Banner | null>(null);
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const data = await getBannerByUuid(bannerUuid);
        setBanner(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setLink(data.link || '');
        setStartDate(data.startDate ? data.startDate.slice(0, 16) : '');
        setEndDate(data.endDate ? data.endDate.slice(0, 16) : '');
        setIsActive(data.isActive);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar banner');
      } finally {
        setLoading(false);
      }
    };

    loadBanner();
  }, [bannerUuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await updateBanner(bannerUuid, {
        title,
        description: description || undefined,
        link: link || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
        image: image || undefined,
        desktopImage: desktopImage || undefined,
        tabletImage: tabletImage || undefined,
        mobileImage: mobileImage || undefined,
      });
      router.push('/admin/dashboard/banners');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar banner');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-9 w-56 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-5 w-44 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="md:col-span-2 h-10 bg-gray-100 rounded-lg animate-pulse" />
              <div className="md:col-span-2 h-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="md:col-span-2 h-10 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              <div className="md:col-span-2 h-14 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-36 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/dashboard/banners"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a banners
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Banner</h1>

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
              <p className="text-sm text-gray-500 mt-0.5">Sube nuevas imágenes para reemplazar las actuales (opcional)</p>
            </div>
            <div className="space-y-6">
              <BannerImageInputs
                currentImages={banner?.images}
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
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

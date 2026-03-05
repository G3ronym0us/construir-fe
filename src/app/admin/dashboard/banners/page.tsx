'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getBanners, deleteBanner, updateBanner } from '@/services/banners';
import type { Banner } from '@/types';

function computePriorities(ordered: Banner[]): Map<string, number> {
  const total = ordered.length;
  return new Map(ordered.map((b, i) => [b.uuid, total - i]));
}

function SortableBannerRow({
  banner,
  onDelete,
  isSaving,
}: {
  banner: Banner;
  onDelete: (uuid: string) => void;
  isSaving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: banner.uuid,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="px-3 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          disabled={isSaving}
          aria-label={`Reordenar: ${banner.title}`}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="px-6 py-4">
        <picture>
          <source media="(max-width: 640px)" srcSet={banner.images.mobile.jpeg} />
          <source media="(max-width: 1024px)" srcSet={banner.images.tablet.jpeg} />
          <Image
            src={banner.images.desktop.jpeg}
            alt={banner.title}
            width={150}
            height={47}
            className="rounded border border-gray-200"
          />
        </picture>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{banner.title}</div>
        {banner.description && (
          <div className="text-sm text-gray-500 max-w-xs truncate">{banner.description}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {banner.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          href={`/admin/dashboard/banners/${banner.uuid}`}
          className="text-blue-600 hover:text-blue-900 mr-4 rounded focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          Editar
        </Link>
        <button
          onClick={() => onDelete(banner.uuid)}
          className="text-red-600 hover:text-red-900 rounded focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await getBanners();
      setBanners([...data].sort((a, b) => b.priority - a.priority));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleDelete = async (uuid: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;

    try {
      await deleteBanner(uuid);
      setBanners((prev) => prev.filter((b) => b.uuid !== uuid));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar banner');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex((b) => b.uuid === active.id);
    const newIndex = banners.findIndex((b) => b.uuid === over.id);
    const newBanners = arrayMove(banners, oldIndex, newIndex);
    const previousBanners = banners;

    setBanners(newBanners);
    setSaveError('');
    setIsSaving(true);

    const priorityMap = computePriorities(newBanners);
    const updates = newBanners.filter((b) => b.priority !== priorityMap.get(b.uuid));

    const results = await Promise.allSettled(
      updates.map((b) => updateBanner(b.uuid, { priority: priorityMap.get(b.uuid)! }))
    );

    const hasFailure = results.some((r) => r.status === 'rejected');
    if (hasFailure) {
      setBanners(previousBanners);
      setSaveError('Error al guardar el orden. Los cambios han sido revertidos.');
    } else {
      const updated = new Map(
        (results as PromiseFulfilledResult<Banner>[]).map((r) => [r.value.uuid, r.value])
      );
      setBanners((prev) => prev.map((b) => updated.get(b.uuid) ?? b));
    }
    setIsSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
        <Link
          href="/admin/dashboard/banners/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          + Nuevo Banner
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {banners.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No hay banners creados</p>
          <Link
            href="/admin/dashboard/banners/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Crear primer banner
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isSaving && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-blue-700 text-sm">
              Guardando orden…
            </div>
          )}
          {saveError && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-red-700 text-sm">
              {saveError}
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 w-10" />
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <SortableContext
                  items={banners.map((b) => b.uuid)}
                  strategy={verticalListSortingStrategy}
                >
                  {banners.map((banner) => (
                    <SortableBannerRow
                      key={banner.uuid}
                      banner={banner}
                      onDelete={handleDelete}
                      isSaving={isSaving}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      )}
    </div>
  );
}

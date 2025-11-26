'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Category } from '@/types';
import { Star, Edit, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

interface CategoriesTableProps {
  categories: Category[];
  onDelete: (uuid: string) => Promise<void>;
  onToggleFeatured: (uuid: string, currentValue: boolean) => Promise<void>;
}

export function CategoriesTable({ categories, onDelete, onToggleFeatured }: CategoriesTableProps) {
  const t = useTranslations('categories');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; uuid: string | null }>({
    isOpen: false,
    uuid: null,
  });
  const [featuredModal, setFeaturedModal] = useState<{
    isOpen: boolean;
    uuid: string | null;
    currentValue: boolean;
  }>({
    isOpen: false,
    uuid: null,
    currentValue: false,
  });

  const handleDeleteClick = (uuid: string) => {
    setDeleteModal({ isOpen: true, uuid });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.uuid) {
      await onDelete(deleteModal.uuid);
      setDeleteModal({ isOpen: false, uuid: null });
    }
  };

  const handleToggleFeaturedClick = (uuid: string, currentValue: boolean) => {
    setFeaturedModal({ isOpen: true, uuid, currentValue });
  };

  const handleToggleFeaturedConfirm = async () => {
    if (featuredModal.uuid !== null) {
      await onToggleFeatured(featuredModal.uuid, featuredModal.currentValue);
      setFeaturedModal({ isOpen: false, uuid: null, currentValue: false });
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500">{t('noCategories')}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('name')}</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('type')}</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('slug')}</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('featured')}</th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => {
                const isChild = !!category.parent;
                const hasChildren = category.childrens && category.childrens.length > 0;

                return (
                  <tr
                    key={category.uuid}
                    className={`hover:bg-gray-50 transition-colors ${isChild ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {isChild && (
                          <span className="text-gray-400 ml-4">└─</span>
                        )}
                        <span className={isChild ? 'text-gray-700' : 'text-gray-900 font-semibold'}>
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isChild ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {t('subcategory')}
                        </span>
                      ) : hasChildren ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {t('parent')} ({category.childrens?.length})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {t('standalone')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.visible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.visible ? t('visibleStatus') : t('hiddenStatus')}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleFeaturedClick(category.uuid, category.isFeatured)}
                        className="inline-flex items-center justify-center transition-colors"
                        title={category.isFeatured ? t('unmarkFeatured') : t('markFeatured')}
                      >
                        <Star
                          className={`w-5 h-5 transition-all ${
                            category.isFeatured
                              ? 'fill-yellow-400 text-yellow-400 hover:fill-yellow-500 hover:text-yellow-500'
                              : 'text-gray-400 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <Link
                        href={`/admin/dashboard/categories/${category.uuid}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {t('edit')}
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(category.uuid)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {categories.map((category) => {
          const isChild = !!category.parent;
          const hasChildren = category.childrens && category.childrens.length > 0;

          return (
            <div
              key={category.uuid}
              className={`bg-white rounded-lg shadow p-4 ${isChild ? 'ml-4 border-l-4 border-purple-200' : ''}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`font-semibold ${isChild ? 'text-gray-700' : 'text-gray-900'}`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{category.slug}</p>
                </div>
                <button
                  onClick={() => handleToggleFeaturedClick(category.uuid, category.isFeatured)}
                  className="p-2"
                  title={category.isFeatured ? t('unmarkFeatured') : t('markFeatured')}
                >
                  <Star
                    className={`w-5 h-5 transition-all ${
                      category.isFeatured
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Type Badge */}
                {isChild ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {t('subcategory')}
                  </span>
                ) : hasChildren ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {t('parent')} ({category.childrens?.length})
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {t('standalone')}
                  </span>
                )}

                {/* Visibility Badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    category.visible
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {category.visible ? t('visibleStatus') : t('hiddenStatus')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/dashboard/categories/${category.uuid}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('edit')}</span>
                </Link>
                <button
                  onClick={() => handleDeleteClick(category.uuid)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('delete')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={t('delete')}
        message={t('deleteConfirm')}
        confirmText={t('delete')}
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, uuid: null })}
      />

      {/* Featured Confirmation Modal */}
      <ConfirmModal
        isOpen={featuredModal.isOpen}
        title={featuredModal.currentValue ? t('unmarkFeatured') : t('markFeatured')}
        message={
          featuredModal.currentValue
            ? t('unmarkFeaturedConfirm')
            : t('markFeaturedConfirm')
        }
        confirmText={featuredModal.currentValue ? t('unmarkFeatured') : t('markFeatured')}
        cancelText="Cancelar"
        onConfirm={handleToggleFeaturedConfirm}
        onCancel={() => setFeaturedModal({ isOpen: false, uuid: null, currentValue: false })}
      />
    </div>
  );
}

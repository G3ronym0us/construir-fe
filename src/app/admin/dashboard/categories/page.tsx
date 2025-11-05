'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { categoriesService } from '@/services/categories';
import type { Category, CategoryStats } from '@/types';
import { PlusCircle, Edit, Trash2, ListTree, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function CategoriesPage() {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; uuid: string | null }>({
    isOpen: false,
    uuid: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, statsData] = await Promise.all([
        categoriesService.getAll(),
        categoriesService.getStats(),
      ]);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (uuid: string) => {
    setDeleteModal({ isOpen: true, uuid });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.uuid) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await categoriesService.delete(deleteModal.uuid, token);
      toast.success(t('deleteSuccess'));
      setDeleteModal({ isOpen: false, uuid: null });
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(t('deleteError'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, uuid: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <Link
          href="/admin/dashboard/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          {t('newCategory')}
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('total')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ListTree className="w-10 h-10 text-blue-600" />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('active')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inactive')}</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">{t('loading')}</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t('noCategories')}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('slug')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.uuid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.isActive ? t('activeStatus') : t('inactiveStatus')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <Link
                      href={`/admin/dashboard/categories/${category.uuid}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(category.uuid)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={t('delete')}
        message={t('deleteConfirm')}
        confirmText={t('delete')}
        cancelText={tCommon('cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </div>
  );
}
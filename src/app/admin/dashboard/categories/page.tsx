'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { categoriesService } from '@/services/categories';
import type { Category, CategoryStats } from '@/types';
import { PlusCircle, ListTree, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { CategoriesTable } from '@/components/admin/CategoriesTable';

export default function CategoriesPage() {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      // Flatten categories to show hierarchy: parents followed by their children
      const flattenedCategories = flattenCategories(categoriesData);
      setCategories(flattenedCategories);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to flatten categories for hierarchical display
  const flattenCategories = (categories: Category[]): Category[] => {
    const flattened: Category[] = [];
    // First, get only parent categories (those without a parent)
    const parents = categories.filter(cat => !cat.parent);

    parents.forEach(parent => {
      // Add the parent
      flattened.push(parent);
      // Add its children if any
      if (parent.childrens && parent.childrens.length > 0) {
        flattened.push(...parent.childrens);
      }
    });

    return flattened;
  };

  const handleDelete = async (uuid: string) => {
    try {
      await categoriesService.delete(uuid);
      toast.success(t('deleteSuccess'));
      await loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(t('deleteError'));
    }
  };

  const handleToggleFeatured = async (uuid: string, currentValue: boolean) => {
    try {
      await categoriesService.update(uuid, { isFeatured: !currentValue });
      toast.success(t('updateSuccess'));
      await loadData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(t('updateError'));
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <Link
          href="/admin/dashboard/categories/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{t('newCategory')}</span>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="bg-white rounded-lg shadow p-4 md:p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('total')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ListTree className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('visible')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.visible}</p>
            </div>
            <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('hidden')}</p>
              <p className="text-2xl font-bold text-red-600">{stats.hidden}</p>
            </div>
            <XCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
          </div>
        </div>
      )}

      {/* Categories Table/Cards */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 md:p-12 text-center w-full">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      ) : (
        <CategoriesTable
          categories={categories}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
        />
      )}
    </div>
  );
}

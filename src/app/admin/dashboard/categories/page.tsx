'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { categoriesService } from '@/services/categories';
import type { Category, CategoryListFilter, CategoryStats, CategoryUsage } from '@/types';
import { PlusCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
import { FeaturedImageModal } from '@/components/admin/FeaturedImageModal';
import { CategoriesKpis } from '@/components/admin/categories/CategoriesKpis';
import { CategoriesFilters } from '@/components/admin/categories/CategoriesFilters';
import { DeleteCategoryModal } from '@/components/admin/categories/DeleteCategoryModal';
import { FeaturedWithoutImageNotice } from '@/components/admin/categories/FeaturedWithoutImageNotice';
import {
  CategoriesEmpty,
  CategoriesLoading,
  CategoriesNoResults,
} from '@/components/admin/categories/CategoriesStates';
import { suggestCategory } from '@/components/admin/categories/suggest';

const LIMIT = 15;
const SEARCH_DEBOUNCE_MS = 300;

export default function CategoriesPage() {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<CategoryListFilter | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [featuredImageTarget, setFeaturedImageTarget] = useState<Category | null>(null);
  const [isUploadingFeaturedImage, setIsUploadingFeaturedImage] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteUsage, setDeleteUsage] = useState<CategoryUsage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [suggestion, setSuggestion] = useState<string | null>(null);

  const lastPage = Math.max(1, Math.ceil(total / LIMIT));

  // El buscador escribe letra a letra pero solo consulta cuando el admin para
  // de teclear; los chips son de un clic y van directos.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCategories = useCallback(
    async (q: string, f: CategoryListFilter | null, p: number) => {
      try {
        setLoading(true);
        const res = await categoriesService.searchPaginated({
          search: q || undefined,
          filter: f ?? undefined,
          page: p,
          limit: LIMIT,
        });
        setCategories(res.data);
        setTotal(res.total);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error(tCommon('error'));
      } finally {
        setLoading(false);
      }
    },
    [toast, tCommon]
  );

  const loadStats = useCallback(async () => {
    try {
      setStats(await categoriesService.getStats());
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  useEffect(() => {
    loadCategories(debouncedSearch, filter, page);
  }, [debouncedSearch, filter, page, loadCategories]);

  const reload = useCallback(async () => {
    await Promise.all([loadCategories(debouncedSearch, filter, page), loadStats()]);
  }, [loadCategories, loadStats, debouncedSearch, filter, page]);

  /*
   * La corrección de "¿quisiste decir…?" necesita todo el catálogo, que es
   * justo lo que la búsqueda vacía no trajo. Se pide una sola vez y solo
   * cuando hace falta.
   */
  const allCategoriesRef = useRef<Category[] | null>(null);

  useEffect(() => {
    if (loading || categories.length > 0 || !debouncedSearch) {
      setSuggestion(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        if (!allCategoriesRef.current) {
          allCategoriesRef.current = await categoriesService.getAll();
        }
        if (!cancelled) {
          setSuggestion(suggestCategory(debouncedSearch, allCategoriesRef.current));
        }
      } catch (error) {
        console.error('Error loading categories for suggestion:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, categories.length, debouncedSearch]);

  const handleToggleFeatured = async (uuid: string, currentValue: boolean) => {
    const category = categories.find((cat) => cat.uuid === uuid);

    // Destacar sin imagen no se puede: la portada solo muestra las que la
    // tienen, así que se pide la imagen en el mismo gesto.
    if (!currentValue && !category?.image) {
      setFeaturedImageTarget(category ?? null);
      return;
    }

    try {
      await categoriesService.update(uuid, { isFeatured: !currentValue });
      toast.success(t('updateSuccess'));
      await reload();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error instanceof Error ? error.message : t('updateError'));
    }
  };

  const handleFeaturedImageUpload = async (file: File) => {
    if (!featuredImageTarget) return;

    try {
      setIsUploadingFeaturedImage(true);
      // update() manda imagen y isFeatured juntos: el backend exige que la
      // categoría ya tenga imagen en el momento de destacarla.
      await categoriesService.update(featuredImageTarget.uuid, { isFeatured: true }, file);
      setFeaturedImageTarget(null);
      toast.success(t('imageUploadedAndFeatured'));
      await reload();
    } catch (error) {
      console.error('Error uploading image for featured category:', error);
      toast.error(error instanceof Error ? error.message : t('imageUploadError'));
      throw error;
    } finally {
      setIsUploadingFeaturedImage(false);
    }
  };

  const handleDeleteClick = async (category: Category) => {
    setDeleteTarget(category);
    setDeleteUsage(null);

    try {
      setDeleteUsage(await categoriesService.getUsage(category.uuid));
    } catch (error) {
      // Sin el detalle el modal sigue siendo útil: cae a los conteos de la fila.
      console.error('Error loading category usage:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await categoriesService.delete(deleteTarget.uuid);
      setDeleteTarget(null);
      toast.success(t('deleteSuccess'));
      await reload();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error instanceof Error ? error.message : t('deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHideInstead = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await categoriesService.update(deleteTarget.uuid, { visible: false });
      setDeleteTarget(null);
      toast.success(t('hiddenInsteadSuccess'));
      await reload();
    } catch (error) {
      console.error('Error hiding category:', error);
      toast.error(error instanceof Error ? error.message : t('updateError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const featuredWithoutImage = categories.filter((cat) => cat.isFeatured && !cat.image);
  const hasFilters = !!debouncedSearch || filter !== null;

  return (
    <div className="w-full max-w-full space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            {t('title')}
          </h1>
          {stats && (
            <p className="text-sm text-sand-700">
              {t('subtitle', {
                total: stats.total,
                parents: stats.parents,
                children: stats.children,
                featured: stats.featured,
              })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/categorias"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-sand-300 bg-white px-3.5 py-2.5 text-sm font-medium text-sand-800 transition-colors hover:bg-sand-50"
          >
            <Eye className="h-4 w-4" />
            {t('viewStoreMenu')}
          </Link>
          <Link
            href="/admin/dashboard/categories/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <PlusCircle className="h-4 w-4" />
            {t('newCategory')}
          </Link>
        </div>
      </div>

      {stats && <CategoriesKpis stats={stats} />}

      {stats && (
        <FeaturedWithoutImageNotice
          categories={featuredWithoutImage}
          total={stats.featuredWithoutImage}
          onFixImage={setFeaturedImageTarget}
          onShowThem={() => setFilter('no-image')}
        />
      )}

      <CategoriesFilters
        search={search}
        filter={filter}
        stats={stats}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />

      {loading ? (
        <CategoriesLoading />
      ) : categories.length > 0 ? (
        <CategoriesTable
          categories={categories}
          onDelete={handleDeleteClick}
          onToggleFeatured={handleToggleFeatured}
        />
      ) : hasFilters ? (
        <CategoriesNoResults
          search={debouncedSearch}
          suggestion={suggestion}
          onUseSuggestion={setSearch}
          onClearFilters={() => {
            setSearch('');
            setFilter(null);
          }}
        />
      ) : (
        <CategoriesEmpty />
      )}

      {/* Paginación */}
      {!loading && total > LIMIT && (
        <div className="flex items-center justify-between rounded-xl border border-sand-300 bg-white px-4 py-3">
          <p className="text-sm text-sand-700">
            {t('pagination', { total, page, lastPage })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label={t('previousPage')}
              className="rounded-lg border border-sand-300 p-1.5 text-sand-700 transition-colors hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: lastPage }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-sm text-sand-500">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    aria-current={page === item ? 'page' : undefined}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                      page === item
                        ? 'bg-brand-600 text-white'
                        : 'border border-sand-300 text-sand-800 hover:bg-sand-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              aria-label={t('nextPage')}
              className="rounded-lg border border-sand-300 p-1.5 text-sand-700 transition-colors hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <FeaturedImageModal
        isOpen={featuredImageTarget !== null}
        categoryName={featuredImageTarget?.customName ?? featuredImageTarget?.name}
        onUpload={handleFeaturedImageUpload}
        onCancel={() => setFeaturedImageTarget(null)}
        isUploading={isUploadingFeaturedImage}
      />

      <DeleteCategoryModal
        category={deleteTarget}
        usage={deleteUsage}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onHideInstead={handleHideInstead}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

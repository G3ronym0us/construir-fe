'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Category } from '@/types';
import { Star, Edit, Trash2, FolderTree, CornerDownRight, Tag } from 'lucide-react';

/**
 * El listado como árbol y no como lista plana.
 *
 * Cada fila dice quién es padre de quién (ícono + sangría), cuántos productos
 * cuelgan y, cuando la categoría está destacada sin imagen, avisa que la
 * portada no la está mostrando: la estrella sola mentiría.
 */

interface CategoriesTableProps {
  categories: Category[];
  onDelete: (category: Category) => void;
  onToggleFeatured: (uuid: string, currentValue: boolean) => Promise<void>;
}

function TypeIcon({ isChild, hasChildren }: { isChild: boolean; hasChildren: boolean }) {
  if (isChild) {
    return (
      <span title="Subcategoría" className="flex-shrink-0">
        <CornerDownRight className="h-4 w-4 text-brand-300" />
      </span>
    );
  }
  if (hasChildren) {
    return (
      <span title="Categoría padre" className="flex-shrink-0">
        <FolderTree className="h-4 w-4 text-brand-500" />
      </span>
    );
  }
  return (
    <span title="Independiente" className="flex-shrink-0">
      <Tag className="h-4 w-4 text-sand-500" />
    </span>
  );
}

/** "142 · 4 subcategorías" — el segundo dato solo si las tiene. */
function useProductsLabel() {
  const t = useTranslations('categories');

  return (category: Category) => {
    const count = category.productCount ?? 0;
    const children = category.childrens?.length ?? 0;

    return children > 0
      ? `${count} · ${t('childrenCount', { count: children })}`
      : String(count);
  };
}

function StatusBadge({ visible }: { visible: boolean }) {
  const t = useTranslations('categories');

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${
        visible
          ? 'bg-success-100 text-success-700'
          : 'bg-danger-100 text-danger-700'
      }`}
    >
      {visible ? t('visibleStatus') : t('hiddenStatus')}
    </span>
  );
}

function FeaturedStar({
  category,
  onToggleFeatured,
}: {
  category: Category;
  onToggleFeatured: CategoriesTableProps['onToggleFeatured'];
}) {
  const t = useTranslations('categories');
  const missingImage = category.isFeatured && !category.image;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={() => onToggleFeatured(category.uuid, category.isFeatured)}
        className="inline-flex items-center justify-center"
        title={category.isFeatured ? t('unmarkFeatured') : t('markFeatured')}
        aria-pressed={category.isFeatured}
      >
        <Star
          className={`h-5 w-5 transition-all ${
            category.isFeatured
              ? 'fill-accent-400 text-accent-400 hover:fill-accent-500 hover:text-accent-500'
              : 'text-sand-500 hover:text-accent-400'
          }`}
        />
      </button>
      {missingImage && (
        <span className="text-[10.5px] font-medium text-accent-600">
          {t('noImageShort')}
        </span>
      )}
    </div>
  );
}

export function CategoriesTable({
  categories,
  onDelete,
  onToggleFeatured,
}: CategoriesTableProps) {
  const t = useTranslations('categories');
  const productsLabel = useProductsLabel();

  return (
    <div className="w-full">
      {/* Vista de tabla — escritorio */}
      <div className="hidden overflow-hidden rounded-xl border border-sand-300 bg-white md:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-sand-300 bg-sand-50">
              <th className="px-[18px] py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
                {t('name')}
              </th>
              <th className="w-32 px-[18px] py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
                {t('products')}
              </th>
              <th className="w-32 px-[18px] py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
                {t('status')}
              </th>
              <th className="w-28 px-[18px] py-3 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
                {t('featured')}
              </th>
              <th className="w-52 px-[18px] py-3 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const isChild = !!category.parent;
              const hasChildren = !!(category.childrens && category.childrens.length > 0);

              return (
                <tr
                  key={category.uuid}
                  className={`border-b border-sand-200 transition-colors last:border-b-0 hover:bg-sand-50 ${
                    isChild ? 'bg-sand-50/60' : ''
                  }`}
                >
                  <td className="px-[18px] py-3.5 align-middle">
                    <div className={`flex items-start gap-2.5 ${isChild ? 'pl-6' : ''}`}>
                      <TypeIcon isChild={isChild} hasChildren={hasChildren} />
                      <div className="min-w-0">
                        <p
                          className={`text-[13.5px] font-semibold ${
                            isChild ? 'text-sand-800' : 'text-ink'
                          }`}
                        >
                          {category.customName ?? category.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[11.5px] text-sand-600">
                          /{category.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-[18px] py-3.5 align-middle text-[13px] font-medium text-sand-800">
                    {productsLabel(category)}
                  </td>

                  <td className="px-[18px] py-3.5 align-middle">
                    <StatusBadge visible={category.visible} />
                  </td>

                  <td className="px-[18px] py-3.5 text-center align-middle">
                    <FeaturedStar category={category} onToggleFeatured={onToggleFeatured} />
                  </td>

                  <td className="px-[18px] py-3.5 align-middle">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/dashboard/categories/${category.uuid}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>{t('edit')}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-danger-600 transition-colors hover:bg-danger-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{t('delete')}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas — móvil */}
      <div className="space-y-3 md:hidden">
        {categories.map((category) => {
          const isChild = !!category.parent;
          const hasChildren = !!(category.childrens && category.childrens.length > 0);

          return (
            <div
              key={category.uuid}
              className={`rounded-xl border border-sand-300 bg-white p-4 ${
                isChild ? 'ml-4 border-l-4 border-l-brand-200' : ''
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <TypeIcon isChild={isChild} hasChildren={hasChildren} />
                  <div className="min-w-0">
                    <h3
                      className={`text-[14px] font-semibold ${
                        isChild ? 'text-sand-800' : 'text-ink'
                      }`}
                    >
                      {category.customName ?? category.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-[11.5px] text-sand-600">
                      /{category.slug}
                    </p>
                  </div>
                </div>
                <FeaturedStar category={category} onToggleFeatured={onToggleFeatured} />
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge visible={category.visible} />
                <span className="text-[12.5px] font-medium text-sand-700">
                  {t('productsCount', { count: category.productCount ?? 0 })}
                </span>
                {hasChildren && (
                  <span className="text-[12.5px] text-sand-600">
                    · {t('childrenCount', { count: category.childrens?.length ?? 0 })}
                  </span>
                )}
              </div>

              <div className="flex gap-2 border-t border-sand-200 pt-3">
                <Link
                  href={`/admin/dashboard/categories/${category.uuid}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100"
                >
                  <Edit className="h-4 w-4" />
                  <span>{t('edit')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(category)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-danger-50 px-4 py-2 text-sm font-medium text-danger-700 transition-colors hover:bg-danger-100"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{t('delete')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

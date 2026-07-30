'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { categoriesService } from '@/services/categories';
import type { Category } from '@/types';

interface CategoryChipsProps {
  className?: string;
}

/**
 * Fila de categorías desplazable en horizontal. El chip activo va en tinta sólida
 * y el resto en blanco con borde cálido, como en el diseño móvil.
 */
export default function CategoryChips({ className = '' }: CategoryChipsProps) {
  const t = useTranslations('products');
  const searchParams = useSearchParams();
  const activeUuid = searchParams.get('categoria');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesService
      .getFeatured()
      .then(setCategories)
      .catch((error) => console.error('Error loading category chips:', error));
  }, []);

  if (categories.length === 0) return null;

  const chipCls = (active: boolean) =>
    `flex min-h-11 flex-none items-center whitespace-nowrap rounded-full px-4 text-[12.5px] transition-colors ${
      active
        ? 'bg-ink font-bold text-white'
        : 'border border-sand-300 bg-white font-semibold text-sand-700 hover:border-sand-400'
    }`;

  return (
    <div className={`chip-row ${className}`}>
      <Link href="/productos" className={chipCls(!activeUuid)}>
        {t('allProducts')}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.uuid}
          href={`/productos?categoria=${category.uuid}`}
          className={chipCls(activeUuid === category.uuid)}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

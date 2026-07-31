'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { categoriesService } from '@/services/categories';
import type { Category } from '@/types';
import CategoryCard from './category/CategoryCard';
import CategoryCardSkeleton from './category/CategoryCardSkeleton';
import SectionHeader from './SectionHeader';

export default function FeaturedCategories() {
  const t = useTranslations('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCategories();
  }, []);

  const loadFeaturedCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getFeatured();
      setCategories(data);
    } catch (error) {
      console.error('Error loading featured categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t('featuredCategories')}
          actionLabel={t('viewAll')}
          actionHref="/categorias"
          className="mb-3 sm:mb-5"
        />

        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => <CategoryCardSkeleton key={i} />)
            : categories.map((category, index) => (
                <CategoryCard key={category.uuid} category={category} index={index} />
              ))}
        </div>
      </div>
    </section>
  );
}

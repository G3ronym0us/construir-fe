'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { productsService } from '@/services/products';
import type { Product } from '@/types';
import ProductCard from './product/ProductCard';
import ProductCardSkeleton from './product/ProductCardSkeleton';
import SectionHeader from './SectionHeader';

export default function FeaturedProducts() {
  const t = useTranslations('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Obtener productos destacados y publicados
      const response = await productsService.getPublicPaginated({
        featured: true,
        limit: 8,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) {
    return null;
  }

  const skeletons = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <section className="py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t('featuredProducts')}
          actionLabel={t('viewMore')}
          actionHref="/productos"
          className="mb-3 sm:mb-5"
        />

        {/* Móvil: carrusel horizontal */}
        <div className="-mx-4 overflow-x-auto scroll-pl-4 snap-x snap-mandatory pb-2 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 px-4">
            {(loading ? skeletons : products).map((item, index) => (
              <div
                key={loading ? `skeleton-${item as number}` : (item as Product).uuid}
                className="w-[152px] flex-shrink-0 snap-start"
              >
                {loading ? (
                  <ProductCardSkeleton variant="compact" />
                ) : (
                  <ProductCard
                    product={item as Product}
                    variant="compact"
                    showAddToCart={true}
                    showBadges={true}
                    showSku={false}
                    showDescription={false}
                    showStock={false}
                    priority={index < 4}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Escritorio: rejilla */}
        <div className="hidden gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-4">
          {(loading ? skeletons : products).map((item, index) =>
            loading ? (
              <ProductCardSkeleton key={`skeleton-${item as number}`} variant="compact" />
            ) : (
              <ProductCard
                key={(item as Product).uuid}
                product={item as Product}
                variant="compact"
                showAddToCart={true}
                showBadges={true}
                showSku={false}
                showDescription={false}
                showStock={false}
                priority={index < 4}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { productsService } from '@/services/products';
import type { Product } from '@/types';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Obtener productos destacados y publicados
      const response = await productsService.getPaginated({
        featured: true,
        published: true,
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

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-gray-600">Cargando productos...</div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const getPrimaryImage = (product: Product) => {
    if (!product.images || product.images.length === 0) return null;
    const primary = product.images.find(img => img.isPrimary);
    return primary || product.images[0];
  };

  return (
    <section className="relative -mt-20 py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const primaryImage = getPrimaryImage(product);

            return (
              <Link
                key={product.uuid}
                href={`/productos/${product.uuid}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Imagen del producto */}
                <div className="relative bg-gray-50 h-64 flex items-center justify-center p-6">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <svg
                        className="w-20 h-20 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  {/* Categoría */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {product.categories?.[0]?.name}
                  </div>

                  {/* Nombre del producto */}
                  <h3 className="text-sm text-gray-800 font-medium mb-3 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h3>

                  {/* Descripción corta (si existe) */}
                  {product.shortDescription && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}

                  {/* Precio */}
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      US$ {parseFloat(product.price).toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {(parseFloat(product.price) % 1).toFixed(2).slice(1)}
                    </span>
                  </div>

                  {/* Stock disponible */}
                  {product.inventory > 0 ? (
                    <div className="text-sm font-semibold text-green-600">
                      {product.inventory < 10
                        ? `Solo ${product.inventory} disponibles`
                        : 'Disponible'}
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-red-600">
                      Sin stock
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Ver más productos */}
        <div className="mt-12 text-center">
          <Link
            href="/productos"
            className="inline-block px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    </section>
  );
}

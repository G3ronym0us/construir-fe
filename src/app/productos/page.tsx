"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { productsService } from "@/services/products";
import type { Product } from "@/types";
import { CategoryMenu } from "@/components/CategoryMenu";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('categoria');

  useEffect(() => {
    loadProducts();
  }, [page, categoryParam, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getPaginated({
        page,
        limit: 12,
        published: true,
        category: categoryParam || undefined,
        search: search || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setProducts(response.data);
      setLastPage(response.lastPage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (product: Product) => {
    if (!product.images || product.images.length === 0) return null;
    const primary = product.images.find(img => img.isPrimary);
    return primary || product.images[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Category Menu */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <CategoryMenu />
          </aside>

          {/* Products Section */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {categoryParam ? `Productos - ${categoryParam}` : 'Todos los Productos'}
              </h2>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Cargando productos...</p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-600 text-lg">No hay productos disponibles</p>
                {(categoryParam || search) && (
                  <p className="text-gray-500 text-sm mt-2">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                )}
              </div>
            )}

            {!loading && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {products.map((product) => {
                    const primaryImage = getPrimaryImage(product);

                    return (
                      <Link
                        key={product.id}
                        href={`/productos/${product.uuid}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
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
                          {product.featured && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                              Destacado
                            </div>
                          )}
                        </div>

                        {/* Información del producto */}
                        <div className="p-4">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            {product.categories?.[0]?.name}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                            {product.name}
                          </h3>
                          {product.shortDescription && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                              {product.shortDescription}
                            </p>
                          )}
                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-2xl font-bold text-blue-600">
                              US$ {parseFloat(product.price).toFixed(0)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {(parseFloat(product.price) % 1).toFixed(2).slice(1)}
                            </span>
                          </div>
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

                {/* Paginación */}
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-700">
                    Página {page} de {lastPage}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === lastPage}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

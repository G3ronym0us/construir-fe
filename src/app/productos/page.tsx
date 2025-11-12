"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { productsService } from "@/services/products";
import { categoriesService } from "@/services/categories";
import type { Product, Category } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, search]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getPaginated({
        page,
        limit: 12,
        published: true,
        category: selectedCategory || undefined,
        search: search || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setProducts(response.data);
      setTotal(response.total);
      setLastPage(response.lastPage);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await categoriesService.getActive();
      setCategories(cats);
    } catch (err) {
      console.error('Error loading categories:', err);
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Productos</h2>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.uuid} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay productos disponibles</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
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
                        {product.category}
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-gray-700">
                Página {page} de {lastPage}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === lastPage}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

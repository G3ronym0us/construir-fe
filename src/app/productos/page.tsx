"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { productsService } from "@/services/products";
import type { Product } from "@/types";
import { CategoryMenu } from "@/components/CategoryMenu";
import CategoryChips from "@/components/CategoryChips";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import CartSummaryBar from "@/components/cart/CartSummaryBar";

const SORT_OPTIONS = [
  { key: "relevance", label: "Relevancia", sortBy: "createdAt", sortOrder: "DESC" as const },
  { key: "price-asc", label: "Menor precio", sortBy: "price", sortOrder: "ASC" as const },
  { key: "price-desc", label: "Mayor precio", sortBy: "price", sortOrder: "DESC" as const },
  { key: "name", label: "Nombre A–Z", sortBy: "name", sortOrder: "ASC" as const },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('categoria');
  const searchParam = searchParams.get('search');

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState(searchParam || "");
  const [sortKey, setSortKey] = useState(SORT_OPTIONS[0].key);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = page < lastPage;
  const sort = SORT_OPTIONS.find((option) => option.key === sortKey) ?? SORT_OPTIONS[0];

  // Sincronizar con el parámetro de URL (navegación desde navbar)
  const prevSearchParam = useRef(searchParam);
  useEffect(() => {
    if (searchParam !== prevSearchParam.current) {
      prevSearchParam.current = searchParam;
      setSearch(searchParam || '');
      setPage(1);
      setProducts([]);
    }
  }, [searchParam]);

  // Reset al cambiar categoría
  const prevCategoryParam = useRef(categoryParam);
  useEffect(() => {
    if (categoryParam !== prevCategoryParam.current) {
      prevCategoryParam.current = categoryParam;
      setPage(1);
      setProducts([]);
    }
  }, [categoryParam]);

  // Reset al cambiar el orden
  const prevSortKey = useRef(sortKey);
  useEffect(() => {
    if (sortKey !== prevSortKey.current) {
      prevSortKey.current = sortKey;
      setPage(1);
      setProducts([]);
    }
  }, [sortKey]);

  const loadProducts = useCallback(async (currentPage: number) => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const response = await productsService.getPublicPaginated({
        page: currentPage,
        limit: 12,
        categoryUuid: categoryParam || undefined,
        search: search || undefined,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      });
      setProducts(prev => currentPage === 1 ? response.data : [...prev, ...response.data]);
      setLastPage(response.lastPage);
      setTotal(response.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoryParam, search, sort.sortBy, sort.sortOrder]);

  useEffect(() => {
    loadProducts(page);
  }, [page, loadProducts]);

  // IntersectionObserver para infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  return (
    <div className="min-h-screen bg-sand-50 pb-24 md:pb-0">
      {/* Filtros pegados bajo el header */}
      <div className="sticky top-16 z-20 border-b border-sand-200 bg-white md:hidden">
        <div className="px-4 py-3">
          <CategoryChips className="-mx-4 px-4" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Menú lateral de categorías */}
          <aside className="hidden w-full flex-shrink-0 md:block lg:w-64">
            <CategoryMenu />
          </aside>

          <div className="flex-1">
            {/* Recuento y orden */}
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-bold text-sand-700">
                {loading ? 'Buscando…' : `${total} ${total === 1 ? 'producto' : 'productos'}`}
              </span>
              <label className="flex items-center gap-1 text-[12.5px] font-bold text-brand-600">
                <span className="sr-only">Ordenar por</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="cursor-pointer appearance-none bg-transparent pr-1 text-right font-bold text-brand-600 focus:outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true">▾</span>
              </label>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-danger-50 p-4">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="rounded-2xl border border-sand-300 bg-white py-14 text-center">
                <PackageSearch className="mx-auto mb-4 h-11 w-11 text-sand-500" strokeWidth={1.6} />
                <p className="font-display text-lg font-bold text-ink">
                  No hay productos disponibles
                </p>
                {(categoryParam || search) && (
                  <p className="mt-2 text-sm text-sand-600">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                )}
              </div>
            )}

            {products.length > 0 && (
              <>
                <div className="mb-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.uuid}
                      product={product}
                      variant="default"
                      showAddToCart={true}
                      showBadges={true}
                      showDescription={false}
                      showStock={true}
                      priority={index < 6}
                    />
                  ))}
                </div>

                {/* Sentinel para infinite scroll */}
                <div ref={sentinelRef} className="h-4" />

                {loadingMore && (
                  <div className="flex justify-center py-6">
                    <span className="h-7 w-7 animate-spin rounded-full border-[2.5px] border-sand-300 border-t-brand-600" />
                  </div>
                )}

                {!hasMore && !loadingMore && (
                  <p className="py-6 text-center text-sm text-sand-600">
                    No hay más productos
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <CartSummaryBar />
    </div>
  );
}

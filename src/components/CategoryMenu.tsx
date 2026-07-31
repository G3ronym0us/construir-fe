'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { categoriesService } from '@/services/categories';
import type { Category } from '@/types';
import { ChevronDown, ChevronRight, Grid } from 'lucide-react';

export function CategoryMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('categoria');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    const allCats = categories.flatMap(c => [c, ...(c.childrens ?? [])]);
    setSelectedCategory(allCats.find(c => c.uuid === currentCategory) ?? null);
  }, [currentCategory, categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getVisible();

      const parentCategories = data.filter(cat => !cat.parent);
      setCategories(parentCategories);

      if (currentCategory) {
        const allCats = data.flatMap(c => [c, ...(c.childrens ?? [])]);
        const currentCat = allCats.find(c => c.uuid === currentCategory);
        setSelectedCategory(currentCat ?? null);
        if (currentCat?.parent) {
          setExpandedCategories(new Set([currentCat.parent.uuid]));
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (uuid: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uuid)) {
        newSet.delete(uuid);
      } else {
        newSet.add(uuid);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-sand-300 bg-white p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 bg-sand-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sand-300 bg-white">
      {/* Header — toggle en mobile, estático en desktop */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(prev => !prev)}
        className="flex min-h-11 w-full items-center justify-between border-b border-sand-200 p-4 lg:cursor-default"
      >
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
          <Grid className="w-5 h-5" />
          Categorías
          {selectedCategory && (
            <span className="ml-1 text-sm font-normal text-brand-600 truncate max-w-[120px]">
              · {selectedCategory.name}
            </span>
          )}
        </h2>
        <ChevronDown
          className={`w-5 h-5 text-sand-600 transition-transform lg:hidden ${isMenuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Contenido — visible siempre en desktop, toggle en mobile */}
      <nav className={`p-2 ${isMenuOpen ? 'block' : 'hidden'} lg:block`}>
        {/* All Products Link */}
        <Link
          href="/productos"
          onClick={() => setIsMenuOpen(false)}
          className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm transition-colors ${
            !currentCategory
              ? 'bg-brand-50 font-bold text-brand-700'
              : 'text-sand-700 hover:bg-sand-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          Todos los productos
        </Link>

        {/* Category Tree */}
        <div className="mt-2 space-y-1">
          {categories.map((category) => {
            const hasChildren = category.childrens && category.childrens.length > 0;
            const isExpanded = expandedCategories.has(category.uuid);
            const isActive = currentCategory === category.uuid;

            return (
              <div key={category.uuid}>
                {/* Parent Category */}
                <div className="flex items-center">
                  {hasChildren && (
                    <button
                      onClick={() => toggleCategory(category.uuid)}
                      className="p-1 hover:bg-sand-100 rounded transition-colors"
                      aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-sand-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-sand-600" />
                      )}
                    </button>
                  )}
                  <Link
                    href={`/productos?categoria=${category.uuid}`}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex min-h-11 flex-1 items-center rounded-xl px-3 text-sm transition-colors ${
                      !hasChildren ? 'ml-5' : ''
                    } ${
                      isActive
                        ? 'bg-brand-50 font-bold text-brand-700'
                        : 'text-sand-700 hover:bg-sand-100'
                    }`}
                  >
                    {category.name}
                    {hasChildren && (
                      <span className="ml-2 text-xs text-sand-600">
                        ({category.childrens?.length || 0})
                      </span>
                    )}
                  </Link>
                </div>

                {/* Subcategories */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {category.childrens?.map((child) => {
                      const isChildActive = currentCategory === child.uuid;
                      return (
                        <Link
                          key={child.uuid}
                          href={`/productos?categoria=${child.uuid}`}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex min-h-11 items-center rounded-xl px-3 text-sm transition-colors ${
                            isChildActive
                              ? 'bg-brand-50 font-bold text-brand-700'
                              : 'text-sand-700 hover:bg-sand-100'
                          }`}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

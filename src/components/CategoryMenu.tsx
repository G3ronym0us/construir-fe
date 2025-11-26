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
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('categoria');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getVisible();

      // Organize categories by parent-child structure
      const parentCategories = data.filter(cat => !cat.parent);
      setCategories(parentCategories);

      // Auto-expand categories that have the current selection
      if (currentCategory) {
        const currentCat = data.find(c => c.slug === currentCategory);
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
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Grid className="w-5 h-5" />
          Categorías
        </h2>
      </div>

      <nav className="p-2">
        {/* All Products Link */}
        <Link
          href="/productos"
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            !currentCategory
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
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
            const isActive = currentCategory === category.slug;

            return (
              <div key={category.uuid}>
                {/* Parent Category */}
                <div className="flex items-center">
                  {hasChildren && (
                    <button
                      onClick={() => toggleCategory(category.uuid)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  )}
                  <Link
                    href={`/productos?categoria=${category.slug}`}
                    className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                      !hasChildren ? 'ml-5' : ''
                    } ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                    {hasChildren && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({category.childrens?.length || 0})
                      </span>
                    )}
                  </Link>
                </div>

                {/* Subcategories */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {category.childrens?.map((child) => {
                      const isChildActive = currentCategory === child.slug;

                      return (
                        <Link
                          key={child.uuid}
                          href={`/productos?categoria=${child.slug}`}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                            isChildActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
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

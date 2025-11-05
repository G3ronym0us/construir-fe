'use client';

import { useEffect, useState } from 'react';
import { productsService } from '@/services/products';
import type { ProductStats, Product } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, lowStock] = await Promise.all([
        productsService.getStats(),
        productsService.getLowStock(10),
      ]);
      setStats(statsData);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Estadísticas de Productos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Productos</h2>
        {loading ? (
          <div className="text-gray-500">Cargando estadísticas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Productos</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.total || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Publicados</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.published || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">No Publicados</h3>
              <p className="text-3xl font-bold text-gray-600">{stats?.unpublished || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Destacados</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats?.featured || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Bajo Stock</h3>
              <p className="text-3xl font-bold text-red-600">{stats?.lowStock || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Productos con bajo inventario */}
      {lowStockProducts.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Productos con Bajo Inventario
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Inventario
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-red-600">
                        {product.inventory} unidades
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/dashboard/productos/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver producto
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lowStockProducts.length > 5 && (
            <div className="mt-4 text-center">
              <Link
                href="/admin/dashboard/productos"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todos los productos con bajo stock ({lowStockProducts.length})
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/dashboard/productos"
            className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Gestionar Productos
          </Link>
          <Link
            href="/admin/dashboard/productos/nuevo"
            className="block px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            Crear Nuevo Producto
          </Link>
          <Link
            href="/admin/dashboard/banners"
            className="block px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Gestionar Banners
          </Link>
        </div>
      </div>
    </div>
  );
}

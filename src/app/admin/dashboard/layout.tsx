'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { User } from '@/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const t = useTranslations('nav');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove cookie
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/admin/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/construir-logo.png"
              alt="Construir Logo"
              width={150}
              height={40}
              priority
            />
            <span className="text-sm text-gray-500">{t('adminPanel')}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/admin/dashboard"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === '/admin/dashboard'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('dashboard')}
            </Link>
            <Link
              href="/admin/dashboard/productos"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith('/admin/dashboard/productos')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('products')}
            </Link>
            <Link
              href="/admin/dashboard/banners"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith('/admin/dashboard/banners')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('banners')}
            </Link>
            <Link
              href="/admin/dashboard/ordenes"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith('/admin/dashboard/ordenes')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('orders')}
            </Link>
            <Link
              href="/admin/dashboard/categories"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith('/admin/dashboard/categories')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('categories')}
            </Link>
            <Link
              href="/admin/dashboard/cupones"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith('/admin/dashboard/cupones')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('coupons')}
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
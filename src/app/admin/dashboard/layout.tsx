'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { User } from '@/types';
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  ShoppingCart,
  FolderTree,
  Tag,
  Users,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/admin/login');
  };

  if (!user) {
    return null;
  }

  const navLinks = [
    { href: '/admin/dashboard', label: t('dashboard'), icon: LayoutDashboard, exact: true },
    { href: '/admin/dashboard/productos', label: t('products'), icon: Package },
    { href: '/admin/dashboard/banners', label: t('banners'), icon: ImageIcon },
    { href: '/admin/dashboard/ordenes', label: t('orders'), icon: ShoppingCart },
    { href: '/admin/dashboard/clientes', label: 'Clientes', icon: Users },
    { href: '/admin/dashboard/categories', label: t('categories'), icon: FolderTree },
    { href: '/admin/dashboard/cupones', label: t('coupons'), icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <Image
              src="/construir-logo.png"
              alt="Construir Logo"
              width={120}
              height={32}
              className="sm:w-[150px] sm:h-[40px]"
              priority
            />
            <span className="hidden sm:block text-sm text-gray-500">{t('adminPanel')}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:block text-sm text-gray-700">
              {user.firstName} {user.lastName}
            </span>
            <span className="sm:hidden text-xs text-gray-600">
              {user.firstName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex relative">
        {/* Overlay - Mobile Only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-[57px] sm:top-[65px] h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)]
            bg-white shadow-lg md:shadow-sm
            w-64 z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Close Button - Mobile Only */}
          <div className="md:hidden flex justify-end p-4 border-b">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto h-full">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-h-[calc(100vh-57px)] sm:min-h-[calc(100vh-65px)] w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

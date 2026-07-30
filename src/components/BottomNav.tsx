'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid2X2, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const { user } = useAuth();

  const totalItems = getTotalItems();
  const accountHref = '/mi-cuenta';


  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname?.startsWith(path) ?? false;

  const tabCls = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-11 transition-colors ${
      active ? 'text-brand-600' : 'text-sand-600 hover:text-sand-700'
    }`;

  const labelCls = (active: boolean) =>
    `text-[10px] leading-none ${active ? 'font-bold' : 'font-semibold'}`;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-sand-300 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch">
          {/* Inicio */}
          <Link href="/" className={tabCls(isActive('/'))}>
            <Home className="w-[19px] h-[19px]" strokeWidth={1.9} />
            <span className={labelCls(isActive('/'))}>Inicio</span>
          </Link>

          {/* Productos */}
          <Link href="/productos" className={tabCls(isActive('/productos'))}>
            <Grid2X2 className="w-[19px] h-[19px]" strokeWidth={1.9} />
            <span className={labelCls(isActive('/productos'))}>Productos</span>
          </Link>

          {/* Categorías */}
          <Link href="/categorias" className={tabCls(isActive('/categorias'))}>
            <LayoutGrid className="w-[19px] h-[19px]" strokeWidth={1.9} />
            <span className={labelCls(isActive('/categorias'))}>Categorías</span>
          </Link>

          {/* Carrito */}
          <Link href="/carrito" className={tabCls(isActive('/carrito'))}>
            <div className="relative">
              <ShoppingCart className="w-[19px] h-[19px]" strokeWidth={1.9} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] bg-accent-500 text-ink text-[10px] font-extrabold rounded-full flex items-center justify-center px-1">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </div>
            <span className={labelCls(isActive('/carrito'))}>Carrito</span>
          </Link>

          {/* Cuenta */}
          <Link
            href={accountHref}
            className={tabCls(isActive('/mi-cuenta'))}
          >
            {user ? (
              <span className="w-[19px] h-[19px] rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-extrabold select-none">
                {user.firstName?.[0]?.toUpperCase() ?? '?'}
              </span>
            ) : (
              <User className="w-[19px] h-[19px]" strokeWidth={1.9} />
            )}
            <span className={labelCls(isActive('/mi-cuenta'))}>Cuenta</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

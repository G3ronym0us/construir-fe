"use client";

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChevronDown, Package, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import CartButton from "./cart/CartButton";
import LanguageSwitcher from "./LanguageSwitcher";
import RateChip from "./RateChip";
import SearchBar from "./SearchBar";

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { openCart, getTotalItems } = useCart();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const totalItems = getTotalItems();

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setIsUserMenuOpen(false);
    router.refresh();
  };

  const userInitial = user?.firstName?.[0]?.toUpperCase() ?? '?';

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-sand-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main nav row */}
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 mr-auto md:mr-0">
            <Image
              src="/construir-logo.png"
              alt="Construir Logo"
              width={120}
              height={32}
              className="h-7 md:h-8 w-auto"
              priority
            />
          </Link>

          {/* ── Móvil: tasa BCV, idioma y carrito ── */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            <RateChip />
            <LanguageSwitcher />
            <Link
              href="/carrito"
              aria-label={`Carrito, ${totalItems} artículos`}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-sand-300 bg-sand-100 text-ink transition-colors hover:bg-sand-200"
            >
              <ShoppingCart className="h-[19px] w-[19px]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-extrabold leading-none text-ink">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* ── Desktop Navigation ── */}
          <div className="hidden md:flex items-center gap-5 ml-auto">
            <Link
              href="/productos"
              className="text-sand-700 hover:text-brand-600 font-medium transition-colors text-sm"
            >
              {t('products')}
            </Link>
            <Link
              href="/about"
              className="text-sand-700 hover:text-brand-600 font-medium transition-colors text-sm"
            >
              {t('about')}
            </Link>

            <div className="w-44">
              <SearchBar inputClassName="" />
            </div>

            <CartButton onClick={openCart} />

            {/* ── Logged in: user dropdown ── */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-sand-100 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold select-none">
                    {userInitial}
                  </span>
                  <span className="text-sm font-medium text-sand-700 max-w-[96px] truncate">
                    {user.firstName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-sand-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-56 bg-white rounded-xl shadow-lg border border-sand-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-sand-200 bg-sand-50">
                      <p className="text-sm font-semibold text-ink truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-sand-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {!isAdmin && (
                      <Link
                        href="/mi-cuenta/ordenes"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-sand-700 hover:bg-sand-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-sand-500" />
                        {t('myOrders')}
                      </Link>
                    )}

                    <div className="px-4 py-3 border-t border-sand-200">
                      <p className="text-xs font-medium text-sand-500 mb-2 uppercase tracking-wide">
                        Idioma
                      </p>
                      <div className="flex gap-1.5">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${
                              locale === lang.code
                                ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200'
                                : 'bg-sand-100 text-sand-700 hover:bg-sand-200'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.code.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-sand-200">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <LanguageSwitcher />
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sand-700 hover:text-brand-600 font-medium transition-colors text-sm"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 font-medium transition-colors text-sm"
                  >
                    {t('register')}
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>

        {/* ── Móvil: buscador a ancho completo ── */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}

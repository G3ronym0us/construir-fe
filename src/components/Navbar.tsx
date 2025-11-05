"use client";

import { useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import CartButton from "./cart/CartButton";
import CartDrawer from "./cart/CartDrawer";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations('nav');
  const { user, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/construir-logo.png"
                alt="Construir Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/productos"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {t('products')}
              </Link>

              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {t('about')}
              </Link>

              {/* Botón del carrito */}
              <CartButton onClick={() => setIsCartOpen(true)} />

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Mostrar login/registro o usuario */}
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 text-sm">
                    {t('welcome', { name: user.firstName })}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Cart Button and Menu Toggle */}
            <div className="flex md:hidden items-center gap-3">
              <CartButton onClick={() => setIsCartOpen(true)} />

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
                aria-label={t('menu', { defaultValue: 'Menú' })}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/productos"
                  className="text-gray-700 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('products')}
                </Link>

                <Link
                  href="/about"
                  className="text-gray-700 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('about')}
                </Link>

                {/* Language Switcher */}
                <div className="py-2">
                  <LanguageSwitcher />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {user ? (
                    <div className="flex flex-col space-y-3">
                      <span className="text-gray-700 text-sm font-medium">
                        {t('welcome', { name: user.firstName })}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="text-left text-gray-700 hover:text-blue-600 font-medium py-2"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Link
                        href="/login"
                        className="text-gray-700 hover:text-blue-600 font-medium py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('login')}
                      </Link>
                      <Link
                        href="/registro"
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('register')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

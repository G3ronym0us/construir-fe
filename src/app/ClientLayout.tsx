"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/context/ToastContext";
import { initGA, trackPageView } from "@/lib/analytics";
import { analyticsService } from "@/services/analytics";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Initialize GA4 on mount
  useEffect(() => {
    initGA();
  }, []);

  // Track route changes
  useEffect(() => {
    if (!pathname) return;

    // Track in Google Analytics 4
    trackPageView(pathname);

    // Track in custom backend analytics
    analyticsService.trackPageView({
      path: pathname,
      title: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  }, [pathname]);

  return (
    <ToastProvider>
      {!isAdminRoute && <Navbar />}
      <main className="min-h-screen">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </ToastProvider>
  );
}

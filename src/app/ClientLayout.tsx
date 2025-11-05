"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/context/ToastContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <ToastProvider>
      {!isAdminRoute && <Navbar />}
      {children}
    </ToastProvider>
  );
}

import type { Metadata } from "next";
import { Archivo, Manrope } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ClientLayout from "./ClientLayout";
import "./globals.css";

// Archivo para titulares, Manrope para texto e interfaz
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Construir - Ferretería Online",
  description: "Tu ferretería de confianza",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${archivo.variable} ${manrope.variable} font-sans text-ink antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <ClientLayout>{children}</ClientLayout>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

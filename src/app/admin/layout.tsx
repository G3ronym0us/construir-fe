import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Construir",
  description: "Panel de administración",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

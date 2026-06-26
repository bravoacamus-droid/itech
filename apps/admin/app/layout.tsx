import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iTech ERP — Back-office",
  description: "Panel administrativo de iTech: catálogo, inventario, reparaciones, CRM y más.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PE">
      <body>{children}</body>
    </html>
  );
}

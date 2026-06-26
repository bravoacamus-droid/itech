import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iTech Import Perú — Tecnología, repuestos y soporte",
  description:
    "Laptops, componentes, repuestos y servicio técnico especializado. Soporte gestionado para empresas. iTech Import Perú.",
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

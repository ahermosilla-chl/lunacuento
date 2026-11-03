import type { Metadata, Viewport } from "next";
import "../globals.css";

/**
 * Layout raíz solo para "/". Las páginas de idioma tienen su propio layout raíz en app/[lang]
 * para poder declarar <html lang="es|en"> en el HTML estático.
 */
export const metadata: Metadata = {
  title: "Lunacuento",
  description: "Cuentos ilustrados con su nombre · Illustrated stories with their name",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#27317A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ background: "#27317A" }}>{children}</body>
    </html>
  );
}

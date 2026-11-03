import type { NextConfig } from "next";

/**
 * Sitio 100 % estático (`next build` genera `out/`) para poder empaquetarlo como app con Capacitor.
 * Sin middleware, sin rutas de servidor, sin cookies ni SSR: todo se resuelve en build o en el cliente.
 * `trailingSlash` genera /es/index.html, /es/cuento/<id>/index.html, que Capacitor sirve sin configuración extra.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;

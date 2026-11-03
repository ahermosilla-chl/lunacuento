import type { CapacitorConfig } from "@capacitor/cli";

/**
 * App nativa (iOS y Android) = el sitio estático de `out/` dentro de un WebView.
 * Flujo: `npm run build:app` (next build + cap sync) y luego `npm run cap:ios` / `npm run cap:android`.
 */
const config: CapacitorConfig = {
  appId: "com.lunacuento.app",
  appName: "Lunacuento",
  webDir: "out",
  backgroundColor: "#27317A",
  ios: { contentInset: "never" },
};

export default config;

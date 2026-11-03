/**
 * Enlaces a las tiendas. Reemplazar los marcadores por las URLs reales al publicar la app.
 * Mientras sean marcadores ("[...]"), los botones muestran un aviso de "muy pronto" en vez de navegar.
 */
export const APP_STORE_URL = "[APP_STORE_URL]";
export const PLAY_STORE_URL = "[PLAY_STORE_URL]";

export const isPlaceholder = (url: string) => url.startsWith("[");

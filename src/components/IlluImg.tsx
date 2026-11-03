import type { ReactNode } from "react";
import { ilu } from "@/lib/ilustraciones";

/**
 * Ilustración definitiva del manifiesto (con srcset) o, si aún no se generó, el placeholder vectorial.
 * ILUSTRACION-PENDIENTE: cada uso sin imagen en public/ilustraciones/manifest.json muestra su `fallback`.
 */
export default function IlluImg({ name, sizes, className, fallback }: { name: string; sizes: string; className?: string; fallback: ReactNode }) {
  const i = ilu(name);
  if (!i) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={i.src} srcSet={i.srcset} sizes={sizes} width={i.width} height={i.height} alt="" decoding="async" />;
}

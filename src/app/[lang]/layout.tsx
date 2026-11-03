import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { atkinson, fredoka } from "@/lib/fonts";
import PurchasesBoot from "@/components/PurchasesBoot";
import { getDict, isLang, LANGS } from "@/lib/i18n";
import { NATIVE_BOOT_SCRIPT } from "@/lib/platform";
import "../globals.css";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: { default: t.meta.title, template: "%s · Lunacuento" },
    description: t.meta.description,
    alternates: { languages: { es: "/es", en: "/en" } },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#27317A",
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} className={`${fredoka.variable} ${atkinson.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NATIVE_BOOT_SCRIPT }} />
      </head>
      <body>
        <PurchasesBoot />
        {children}
      </body>
    </html>
  );
}

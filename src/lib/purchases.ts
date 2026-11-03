"use client";

import { useSyncExternalStore } from "react";
import type { CustomerInfo, PRODUCT_CATEGORY, PurchasesStoreProduct } from "@revenuecat/purchases-capacitor";
import { MODO_PRUEBA } from "./modo-prueba";
import { getPlatform } from "./platform";

/**
 * Compra única NO consumible "Biblioteca completa" con RevenueCat.
 *
 * - Producto de la tienda: `lunacuento_biblioteca` (el mismo id en App Store Connect y Google Play).
 * - Entitlement en RevenueCat: `biblioteca`.
 * - Claves públicas del SDK: NEXT_PUBLIC_RC_IOS_KEY y NEXT_PUBLIC_RC_ANDROID_KEY (ver .env.example).
 *
 * En la web, o sin clave para la plataforma, todo responde `unavailable` y nunca lanza errores.
 * El SDK se carga con import() solo dentro de la app, así la web no lo descarga.
 */
export const PRODUCT_ID = "lunacuento_biblioteca";
export const ENTITLEMENT_ID = "biblioteca";

export type PurchaseStatus =
  | "success"      // compra o restauración que dejó la biblioteca desbloqueada
  | "cancelled"    // la persona cerró el diálogo de la tienda
  | "empty"        // restaurar: esta cuenta de la tienda no tiene la compra
  | "unavailable"  // web, o la app sin clave de RevenueCat
  | "error";       // la tienda o la red fallaron

export type PurchaseResult = { status: PurchaseStatus; owned: boolean };

/* ------------------------------------------------------------------ */
/* Estado "biblioteca desbloqueada"                                    */
/* ------------------------------------------------------------------ */

/**
 * Copia local de la última respuesta de RevenueCat, para abrir los cuentos sin conexión.
 * Cada vez que la tienda responde, esta copia se sobrescribe con la verdad.
 */
const CACHE_KEY = "lc_biblioteca";
let owned: boolean | null = null;
const listeners = new Set<() => void>();

function readCache(): boolean {
  try {
    return localStorage.getItem(CACHE_KEY) === "1";
  } catch {
    return false;
  }
}

function setOwned(v: boolean) {
  const prev = owned ?? readCache();
  owned = v;
  try {
    if (v) localStorage.setItem(CACHE_KEY, "1");
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* almacenamiento bloqueado: queda solo en memoria */
  }
  if (prev !== v) listeners.forEach((l) => l());
}

/** En modo de prueba (NEXT_PUBLIC_MODO_PRUEBA=1) la biblioteca siempre está desbloqueada. */
export const isLibraryOwned = () => MODO_PRUEBA || (owned ??= readCache());

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** ¿Está desbloqueada la biblioteca completa? Falso en el servidor y en la hidratación (verdadero en modo de prueba). */
export function useLibrary(): boolean {
  return useSyncExternalStore(subscribe, isLibraryOwned, () => MODO_PRUEBA);
}

/* ------------------------------------------------------------------ */
/* SDK de RevenueCat                                                   */
/* ------------------------------------------------------------------ */

function apiKey(): string {
  const p = getPlatform();
  const key = p === "ios" ? process.env.NEXT_PUBLIC_RC_IOS_KEY : p === "android" ? process.env.NEXT_PUBLIC_RC_ANDROID_KEY : "";
  return (key ?? "").trim();
}

/** ¿Se pueden hacer compras en este dispositivo? (app nativa + clave configurada) */
export const purchasesAvailable = () => apiKey() !== "";

const sdk = () => import("@revenuecat/purchases-capacitor").then((m) => m.Purchases);

function applyInfo(info: CustomerInfo) {
  setOwned(Boolean(info.entitlements.active[ENTITLEMENT_ID]));
}

let booting: Promise<boolean> | null = null;

/** Configura RevenueCat una sola vez. Devuelve false si no hay app nativa, clave o respuesta. */
export function initPurchases(): Promise<boolean> {
  const key = apiKey();
  if (!key) return Promise.resolve(false);
  booting ??= (async () => {
    try {
      const Purchases = await sdk();
      // Sin appUserID: RevenueCat crea un id anónimo. No se identifica a nadie ni se piden identificadores de publicidad.
      await Purchases.configure({ apiKey: key });
      await Purchases.addCustomerInfoUpdateListener(applyInfo);
      const { customerInfo } = await Purchases.getCustomerInfo();
      applyInfo(customerInfo);
      return true;
    } catch {
      booting = null; // permite reintentar (por ejemplo, sin red al abrir)
      return false;
    }
  })();
  return booting;
}

async function loadProduct(): Promise<PurchasesStoreProduct | null> {
  const Purchases = await sdk();
  const { products } = await Purchases.getProducts({
    productIdentifiers: [PRODUCT_ID],
    type: "NON_SUBSCRIPTION" as PRODUCT_CATEGORY, // Android: compra única; iOS lo ignora
  });
  return products.find((p) => p.identifier === PRODUCT_ID) ?? null;
}

/** Precio ya formateado y en la moneda de la tienda (p. ej. "US$7,99"), o null si no se pudo leer. */
export async function loadPrice(): Promise<string | null> {
  try {
    if (!(await initPurchases())) return null;
    return (await loadProduct())?.priceString ?? null;
  } catch {
    return null;
  }
}

/** Compra la biblioteca completa. Llamar solo después del portón para adultos. */
export async function purchaseLibrary(): Promise<PurchaseResult> {
  try {
    if (!(await initPurchases())) return { status: "unavailable", owned: isLibraryOwned() };
    const product = await loadProduct();
    if (!product) return { status: "error", owned: isLibraryOwned() };
    const Purchases = await sdk();
    const { customerInfo } = await Purchases.purchaseStoreProduct({ product });
    applyInfo(customerInfo);
    return { status: isLibraryOwned() ? "success" : "error", owned: isLibraryOwned() };
  } catch (e) {
    const err = e as { userCancelled?: boolean | null; code?: string };
    const cancelled = err?.userCancelled === true || err?.code === "1"; // 1 = PURCHASE_CANCELLED_ERROR
    return { status: cancelled ? "cancelled" : "error", owned: isLibraryOwned() };
  }
}

/** Restaura compras anteriores de la misma cuenta de la tienda. Llamar solo después del portón para adultos. */
export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    if (!(await initPurchases())) return { status: "unavailable", owned: isLibraryOwned() };
    const Purchases = await sdk();
    const { customerInfo } = await Purchases.restorePurchases();
    applyInfo(customerInfo);
    return { status: isLibraryOwned() ? "success" : "empty", owned: isLibraryOwned() };
  } catch {
    return { status: "error", owned: isLibraryOwned() };
  }
}

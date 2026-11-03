"use client";

import { useEffect } from "react";
import { initPurchases } from "@/lib/purchases";

/** Inicia RevenueCat al abrir la app (no hace nada en la web ni sin claves). Así el estado de la compra se actualiza solo. */
export default function PurchasesBoot() {
  useEffect(() => {
    void initPurchases();
  }, []);
  return null;
}

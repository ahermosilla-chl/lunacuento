/**
 * Modo de prueba: con NEXT_PUBLIC_MODO_PRUEBA=1 todos los cuentos premium quedan desbloqueados y no se muestra
 * la pantalla de compra (sirve para probar la funcionalidad antes de configurar los pagos).
 * Vacía = comportamiento normal. Se incrusta al compilar: cambiarla exige volver a compilar o desplegar.
 * Sin "use client" a propósito: lo usan componentes de servidor y de cliente.
 */
export const MODO_PRUEBA = process.env.NEXT_PUBLIC_MODO_PRUEBA === "1";

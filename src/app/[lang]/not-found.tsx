import Link from "next/link";

/** 404 dentro de un idioma. No recibe params, así que muestra ambos idiomas (texto mínimo). */
export default function NotFound() {
  return (
    <main id="contenido" className="wrap page-plain">
      <div className="card">
        <h1 lang="es">Esta página se perdió en la noche</h1>
        <p lang="en">This page got lost in the night</p>
        <p style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/es" className="btn btn-sun" lang="es">Volver al inicio</Link>
          <Link href="/en" className="btn btn-line" lang="en">Back to home</Link>
        </p>
      </div>
    </main>
  );
}

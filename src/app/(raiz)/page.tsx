import LangRedirect from "@/components/LangRedirect";

/** "/" no tiene contenido propio: el cliente elige /es o /en (ver LangRedirect). */
export default function Root() {
  return <LangRedirect />;
}

import { sceneSVG } from "@/lib/art";
import type { Story } from "@/lib/stories";

/** Tapa de un cuento: ilustración de su página de portada (o la imagen definitiva si ya existe). */
export default function CoverArt({ story }: { story: Story }) {
  const page = story.pages[story.coverPage] ?? story.pages[0];
  if (page.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={page.image.src} alt="" width={page.image.width} height={page.image.height} loading="lazy" />;
  }
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: sceneSVG(page.scene, `cover-${story.id}`) }} />;
}

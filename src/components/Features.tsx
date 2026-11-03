import type { Dict } from "@/lib/i18n";
import { IconMoon, IconPerson, IconSound } from "./icons";

const ICONS = [
  { bg: "#FFF0C2", color: "#3A2600", Icon: IconPerson },
  { bg: "#D9F6F1", color: "#00796B", Icon: IconSound },
  { bg: "#E8E5FF", color: "#2D2877", Icon: IconMoon },
];

export default function Features({ t }: { t: Dict }) {
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-label={t.features.map((f) => f.title).join(" · ")}>
      <div className="wrap features">
        {t.features.map((f, i) => {
          const { bg, color, Icon } = ICONS[i];
          return (
            <div key={f.title} className="feature">
              <span className="ico" aria-hidden="true" style={{ background: bg, color }}><Icon size={36} /></span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

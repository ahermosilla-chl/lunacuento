import type { Dict } from "@/lib/i18n";
import { IconMoon, IconPerson, IconSound } from "./icons";

const ICONS = [
  { bg: "#FFE6A3", color: "#3A2600", Icon: IconPerson },
  { bg: "#DDF5EC", color: "#1F6E57", Icon: IconSound },
  { bg: "#E4E6FA", color: "#27317A", Icon: IconMoon },
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

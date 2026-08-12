import PropertyCard, {
  type PropertyCardProps,
} from "@/component/property-card/property-card";
import styles from "./property-section.module.css";

export type PropertySectionItem = PropertyCardProps;

interface PropertySectionProps {
  /** Plain part of the heading, e.g. "อสังหาริมทรัพย์" */
  heading: string;
  /** Colored keyword after the heading, e.g. "บ้านเดี่ยว" — mirrors the
   * reference site's "ผลิตภัณฑ์ <accent>เงินฝาก</accent>" pattern. */
  accent: string;
  items: PropertySectionItem[];
  id?: string;
}

export default function PropertySection({
  heading,
  accent,
  items,
  id,
}: PropertySectionProps) {
  return (
    <section id={id} className={styles.section}>
      <h2 className={styles.heading}>
        {heading} <span className={styles.accent}>{accent}</span>
      </h2>
      <div className={styles.grid}>
        {items.map((item) => (
          <PropertyCard key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
}

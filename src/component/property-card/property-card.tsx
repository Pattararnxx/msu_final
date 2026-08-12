import Link from "next/link";
import Image from "next/image";
import Icon from "@/component/icon/icon";
import styles from "./property-card.module.css";

export interface PropertyCardProps {
  href: string;
  province: string;
  name: string;
  price: number;
  image: string;
  isNew?: boolean;
  /** Set on the first above-the-fold card so Next.js doesn't lazy-load it. */
  priority?: boolean;
}

function formatPrice(price: number) {
  return `${price.toLocaleString("th-TH")} บาท`;
}

// Real-estate listing card: photo (with a NEW badge in its top-right
// corner) followed by province, name, and price stacked on their own
// lines — modeled on KKPPropify's listing cards.
export default function PropertyCard({
  href,
  province,
  name,
  price,
  image,
  isNew,
  priority,
}: PropertyCardProps) {
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="50vw"
          className={styles.image}
        />
        {isNew && <span className={styles.newBadge}>NEW</span>}
      </div>

      <div className={styles.body}>
        <p className={styles.province}>
          <Icon src="/icon/regular/map-pin.svg" size={14} />
          {province}
        </p>
        <p className={styles.name}>{name}</p>
        <p className={styles.price}>{formatPrice(price)}</p>
      </div>
    </Link>
  );
}

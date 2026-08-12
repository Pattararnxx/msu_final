import type { CSSProperties } from "react";
import styles from "./icon.module.css";

interface IconProps {
  src: string;
  size?: number;
}

// Renders a Phosphor SVG (public/icon/**) as a currentColor mask so it
// inherits text/hover color instead of being a baked-in bitmap.
export default function Icon({ src, size = 16 }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={styles.icon}
      style={
        { "--icon-src": `url(${src})`, width: size, height: size } as CSSProperties
      }
    />
  );
}

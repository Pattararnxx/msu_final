import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Mirrors the yellow "primary" scale from src/styles/_color.scss (kept in
// sync manually — that file is the source of truth) so every Mantine
// component that defaults to primaryColor — Button fill, focus rings, etc.
// — renders the site's actual brand yellow instead of Mantine's own hue.
const brand: MantineColorsTuple = [
  "#FFFBE0", // primary-50
  "#FFF7B8", // primary-100
  "#FFF18A", // primary-200
  "#FFEB63", // primary-300
  "#FFE74D", // primary-400
  "#FFE23D", // primary-500 — base shade (== --yellow / --primary-500)
  "#F5D52F", // primary-600
  "#E6C521", // primary-700
  "#C9A900", // primary-800
  "#9F8500", // primary-900
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 5,
  // Yellow is too light for Mantine's default white button text to stay
  // readable — autoContrast picks black/white per shade automatically.
  autoContrast: true,
  colors: { brand },
  fontFamily:
    "var(--font-noto-sans-thai), var(--font-geist-sans), Arial, Helvetica, sans-serif",
  defaultRadius: "md",
  // "lg" (desktop nav vs. mobile hamburger) lowered from the original
  // 1100px to 780px — headroom equal to the chatbot panel's 320px width,
  // so opening the panel and shrinking the navbar's available space
  // doesn't flip it into mobile mode; it only activates for genuinely
  // narrow viewports.
  breakpoints: {
    xs: "36em",
    sm: "48em",
    md: "62em",
    lg: "48.75em",
    xl: "88em",
  },
});

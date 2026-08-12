import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Ramp built around the existing brand accent (#6a5ae0 / hover #5847d1) that
// the navbar already shipped with — kept as the exact shade-5/6 values so no
// existing surface changes color, only the components rendering it do.
const brand: MantineColorsTuple = [
  "#f4f3fc",
  "#e5e2f8",
  "#cbc6f1",
  "#a9a1e8",
  "#8478de",
  "#6a5ae0",
  "#5847d1",
  "#311ebd",
  "#29199e",
  "#21147f",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 5,
  colors: { brand },
  fontFamily:
    "var(--font-noto-sans-thai), var(--font-geist-sans), Arial, Helvetica, sans-serif",
  defaultRadius: "md",
  // Reuses the navbar's existing 1100px desktop breakpoint (design
  // fingerprint) instead of Mantine's default 1200px "lg".
  breakpoints: {
    xs: "36em",
    sm: "48em",
    md: "62em",
    lg: "68.75em",
    xl: "88em",
  },
});

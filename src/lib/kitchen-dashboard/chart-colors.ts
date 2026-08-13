// Mirrors --chart-cat-* / --chart-status-* in src/styles/_color.scss —
// validated with the dataviz skill's palette checker for surface #FCFCFB
// (see .whipui/design-fingerprint.json). Duplicated as plain hex here
// because Recharts (via @mantine/charts) assigns these directly to SVG
// fill attributes; CSS custom properties are for the surrounding chrome
// (legends, stat-tile icons) built in plain CSS.
//
// Warm-only set (red/orange/gold/brown), by explicit request, in place of
// the dataviz skill's own cooler-leaning documented default — re-searched
// and re-validated against the skill's own method/validator rather than
// eyeballed; see the comment above --chart-cat-1 in _color.scss.
//
// Fixed order — assign slots in sequence per chart, never cycle or remap
// an entity to a different slot when the data changes.
export const CHART_CATEGORICAL = [
  "#dba843", // 1 amber/gold
  "#932825", // 2 deep brick red
  "#e29d28", // 3 orange-gold
  "#833e21", // 4 dark rust/brown
] as const;

export const CHART_STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

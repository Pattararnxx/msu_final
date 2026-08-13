import type { HourlyUploadBucket } from "@/lib/team/types";
import styles from "./team-upload-chart.module.css";

interface TeamUploadChartProps {
  buckets: HourlyUploadBucket[];
}

// One series over time (hour of day) → a line, not bars: a single
// continuous trend reads more naturally as a line + area fill than as
// discrete columns. Single hue (the project's own yellow), no legend
// needed — one series names itself via the title. Baseline sits flush
// against the bottom edge of the plot (count 0 → y = height), so there's
// no wasted gap below the data.
const WIDTH = 700;
const HEIGHT = 140;
const PAD_X = 12;
const PAD_TOP = 16;

function buildPoints(buckets: HourlyUploadBucket[], max: number) {
  const stepX = (WIDTH - PAD_X * 2) / Math.max(1, buckets.length - 1);
  return buckets.map((bucket, index) => ({
    ...bucket,
    x: PAD_X + index * stepX,
    y: PAD_TOP + (1 - bucket.count / max) * (HEIGHT - PAD_TOP),
  }));
}

export default function TeamUploadChart({ buckets }: TeamUploadChartProps) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const points = buildPoints(buckets, max);

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT} L${points[0].x},${HEIGHT} Z`;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>ช่วงเวลาที่พนักงานอัปโหลดบ่อย</span>
        <span className={styles.subtitle}>รวมทั้งสัปดาห์ ตามชั่วโมง (06:00–19:00)</span>
      </div>

      {/* margin-top: auto in .plot pushes the graph itself down to sit
          flush against the bottom of the card once .card stretches to
          match the taller activity-log card beside it (see .chartsRow in
          page.module.css) — the title stays pinned at the top, and any
          leftover height collects above the graph instead of below it. */}
      <div className={styles.plot}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={styles.chart}
          role="img"
          aria-label="กราฟจำนวนครั้งที่อัปโหลดตามชั่วโมง"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="uploadChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--primary-500)", stopOpacity: 0.35 }} />
              <stop offset="100%" style={{ stopColor: "var(--primary-500)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          <path d={areaPath} style={{ fill: "url(#uploadChartFill)" }} />
          <path d={linePath} style={{ fill: "none", stroke: "var(--primary-700)", strokeWidth: 2 }} />

          {points.map((point) => (
            <g key={point.hour} className={styles.point}>
              <circle cx={point.x} cy={point.y} r={10} className={styles.hitArea} />
              <circle cx={point.x} cy={point.y} r={4} className={styles.dot} />
              <title>
                {point.hour} น. — {point.count} ครั้ง
              </title>
            </g>
          ))}
        </svg>

        <div className={styles.axisRow}>
          {buckets.map((bucket) => (
            <span key={bucket.hour} className={styles.hourLabel}>
              {bucket.hour.slice(0, 2)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

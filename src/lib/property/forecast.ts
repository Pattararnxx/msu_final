import type { ConfidenceLevel, Forecast, PricePoint, PropertyType } from "./types";

/**
 * Pure forecasting math. Deliberately imports nothing but types so it can be
 * run and tested outside the Next.js bundler (see scripts/forecast.test.ts).
 *
 * Model: OLS on log(pricePerSqm) for trend, additive monthly seasonal factors
 * in log space, and a textbook OLS prediction interval that widens with the
 * forecast horizon. Volatile markets therefore get wide intervals without any
 * per-market tuning.
 */

const Z_80 = 1.2816;
const CONFIDENCE_LEVEL_PCT = 80;

export function addMonths(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const total = year * 12 + (month - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

function monthOf(monthKey: string): number {
  return Number(monthKey.split("-")[1]);
}

interface Fit {
  intercept: number;
  slope: number;
  meanX: number;
  sxx: number;
}

function ols(xs: number[], ys: number[]): Fit {
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - meanX) * (ys[i] - meanY);
    sxx += (xs[i] - meanX) ** 2;
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  return { intercept: meanY - slope * meanX, slope, meanX, sxx };
}

export interface SeriesAnalysis {
  n: number;
  lastMonth: string;
  lastPricePerSqm: number;
  fit: Fit;
  /** Additive log-space seasonal factor per calendar month, index 1..12. */
  seasonal: number[];
  /** Residual standard deviation in log space. */
  sigma: number;
  cagrPct: number;
}

export function analyzeSeries(points: PricePoint[]): SeriesAnalysis {
  if (points.length < 6) {
    throw new Error(`need at least 6 points to analyze, got ${points.length}`);
  }

  const n = points.length;
  const xs = points.map((_, i) => i);
  const ys = points.map((p) => Math.log(p.pricePerSqm));

  const rough = ols(xs, ys);

  const bucketSum = new Array<number>(13).fill(0);
  const bucketCount = new Array<number>(13).fill(0);
  for (let i = 0; i < n; i++) {
    const m = monthOf(points[i].month);
    bucketSum[m] += ys[i] - (rough.intercept + rough.slope * xs[i]);
    bucketCount[m] += 1;
  }

  const seasonal = new Array<number>(13).fill(0);
  for (let m = 1; m <= 12; m++) {
    seasonal[m] = bucketCount[m] > 0 ? bucketSum[m] / bucketCount[m] : 0;
  }
  const seasonalMean = seasonal.slice(1).reduce((a, b) => a + b, 0) / 12;
  for (let m = 1; m <= 12; m++) seasonal[m] -= seasonalMean;

  const deseasonalized = ys.map((y, i) => y - seasonal[monthOf(points[i].month)]);
  const fit = ols(xs, deseasonalized);

  let sse = 0;
  for (let i = 0; i < n; i++) {
    sse += (deseasonalized[i] - (fit.intercept + fit.slope * xs[i])) ** 2;
  }
  const sigma = Math.sqrt(sse / Math.max(1, n - 2));

  return {
    n,
    lastMonth: points[n - 1].month,
    lastPricePerSqm: points[n - 1].pricePerSqm,
    fit,
    seasonal,
    sigma,
    cagrPct: Number(((Math.exp(fit.slope * 12) - 1) * 100).toFixed(2)),
  };
}

function classifyConfidence(relativeWidth: number, horizonMonths: number): ConfidenceLevel {
  if (horizonMonths > 12) return "low";
  if (relativeWidth < 0.05) return "high";
  if (relativeWidth < 0.11) return "medium";
  return "low";
}

export function forecastFromPoints(
  zoneId: string,
  propertyType: PropertyType,
  points: PricePoint[],
  horizonMonths: number,
): Forecast {
  const analysis = analyzeSeries(points);
  const { fit, seasonal, sigma, n } = analysis;

  const x0 = n - 1 + horizonMonths;
  const targetMonth = addMonths(analysis.lastMonth, horizonMonths);
  const seasonalAdj = seasonal[monthOf(targetMonth)];

  const mu = fit.intercept + fit.slope * x0 + seasonalAdj;
  const sePred = sigma * Math.sqrt(1 + 1 / n + (x0 - fit.meanX) ** 2 / fit.sxx);

  const point = Math.exp(mu);
  const low = Math.exp(mu - Z_80 * sePred);
  const high = Math.exp(mu + Z_80 * sePred);

  const relativeWidth = (high - low) / point;
  const confidence = classifyConfidence(relativeWidth, horizonMonths);
  const lowConfidence = horizonMonths > 12 || confidence === "low";

  return {
    zoneId,
    propertyType,
    horizonMonths,
    targetMonth,
    currentPricePerSqm: analysis.lastPricePerSqm,
    pointPricePerSqm: Math.round(point),
    lowPricePerSqm: Math.round(low),
    highPricePerSqm: Math.round(high),
    changePct: Number((((point - analysis.lastPricePerSqm) / analysis.lastPricePerSqm) * 100).toFixed(2)),
    cagrPct: analysis.cagrPct,
    seasonalAdjustmentPct: Number(((Math.exp(seasonalAdj) - 1) * 100).toFixed(2)),
    confidence,
    confidenceLevelPct: CONFIDENCE_LEVEL_PCT,
    basisMonths: n,
    volatilityPct: Number((sigma * 100).toFixed(2)),
    lowConfidence,
    cautionTh: lowConfidence
      ? horizonMonths > 12
        ? `การทำนายเกิน 12 เดือน (ขอมา ${horizonMonths} เดือน) เชื่อถือได้ต่ำ ต้องแจ้งผู้ใช้ว่าเป็นการประมาณการหยาบ ห้ามนำเสนอเป็นตัวเลขที่แน่นอน`
        : "ความผันผวนของโซนนี้สูง ช่วงราคาที่เป็นไปได้กว้าง ต้องแจ้งผู้ใช้ว่าตัวเลขกลางมีโอกาสคลาดเคลื่อนมาก"
      : null,
  };
}

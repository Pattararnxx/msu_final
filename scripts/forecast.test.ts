/**
 * Math check for the forecaster. Builds synthetic series with a known CAGR,
 * known seasonality and known noise, then asserts the model recovers them.
 *
 * Run: node --test scripts/forecast.test.ts
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { analyzeSeries, forecastFromPoints } from "../src/lib/property/forecast.ts";
import type { PricePoint } from "../src/lib/property/types.ts";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SyntheticOptions {
  cagr: number;
  seasonalAmp: number;
  peakMonth: number;
  noise: number;
  months?: number;
  base?: number;
  seed?: number;
}

function synthetic(options: SyntheticOptions): PricePoint[] {
  const months = options.months ?? 60;
  const base = options.base ?? 100000;
  const rand = mulberry32(options.seed ?? 7);
  const points: PricePoint[] = [];

  let year = 2021;
  let month = 8;
  for (let i = 0; i < months; i++) {
    const trend = base * Math.exp((Math.log(1 + options.cagr) * i) / 12);
    const seasonal =
      1 + options.seasonalAmp * Math.cos((2 * Math.PI * (month - options.peakMonth)) / 12);
    const jitter = 1 + options.noise * (rand() * 2 - 1);
    const pricePerSqm = trend * seasonal * jitter;

    points.push({
      month: `${year}-${String(month).padStart(2, "0")}`,
      pricePerSqm: Math.round(pricePerSqm),
      medianPrice: Math.round(pricePerSqm * 42),
      transactions: 20,
    });

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return points;
}

test("recovers a known CAGR", () => {
  const points = synthetic({ cagr: 0.06, seasonalAmp: 0.03, peakMonth: 1, noise: 0.004 });
  const analysis = analyzeSeries(points);
  assert.ok(
    Math.abs(analysis.cagrPct - 6) < 0.5,
    `expected CAGR near 6%, got ${analysis.cagrPct}%`,
  );
});

test("recovers a known seasonal peak", () => {
  const points = synthetic({ cagr: 0.04, seasonalAmp: 0.05, peakMonth: 1, noise: 0.002 });
  const analysis = analyzeSeries(points);
  const strongest = analysis.seasonal
    .map((value, index) => ({ value, index }))
    .slice(1)
    .sort((a, b) => b.value - a.value)[0];
  assert.equal(strongest.index, 1, `expected January peak, got month ${strongest.index}`);
  assert.ok(
    Math.abs(Math.exp(strongest.value) - 1 - 0.05) < 0.012,
    `expected ~5% seasonal lift, got ${((Math.exp(strongest.value) - 1) * 100).toFixed(2)}%`,
  );
});

test("12-month forecast lands near the true extrapolated value", () => {
  const cagr = 0.05;
  const points = synthetic({ cagr, seasonalAmp: 0.02, peakMonth: 6, noise: 0.004 });
  const forecast = forecastFromPoints("test-zone", "condo", points, 12);

  const truth = points[points.length - 1].pricePerSqm * (1 + cagr);
  const errorPct = Math.abs(forecast.pointPricePerSqm - truth) / truth;

  assert.ok(errorPct < 0.03, `expected within 3% of ${Math.round(truth)}, got ${forecast.pointPricePerSqm}`);
  assert.equal(forecast.targetMonth, "2027-07");
  assert.ok(forecast.lowPricePerSqm < forecast.pointPricePerSqm);
  assert.ok(forecast.highPricePerSqm > forecast.pointPricePerSqm);
});

test("a noisier market gets a wider interval", () => {
  const calm = forecastFromPoints(
    "calm",
    "condo",
    synthetic({ cagr: 0.05, seasonalAmp: 0.01, peakMonth: 3, noise: 0.003 }),
    12,
  );
  const wild = forecastFromPoints(
    "wild",
    "condo",
    synthetic({ cagr: 0.05, seasonalAmp: 0.01, peakMonth: 3, noise: 0.06 }),
    12,
  );

  const calmWidth = (calm.highPricePerSqm - calm.lowPricePerSqm) / calm.pointPricePerSqm;
  const wildWidth = (wild.highPricePerSqm - wild.lowPricePerSqm) / wild.pointPricePerSqm;

  assert.ok(wildWidth > calmWidth * 3, `expected a much wider band: ${wildWidth} vs ${calmWidth}`);
  assert.ok(wild.volatilityPct > calm.volatilityPct);
});

test("the interval widens as the horizon grows", () => {
  const points = synthetic({ cagr: 0.05, seasonalAmp: 0.02, peakMonth: 3, noise: 0.01 });
  const near = forecastFromPoints("z", "condo", points, 3);
  const far = forecastFromPoints("z", "condo", points, 24);

  const nearWidth = (near.highPricePerSqm - near.lowPricePerSqm) / near.pointPricePerSqm;
  const farWidth = (far.highPricePerSqm - far.lowPricePerSqm) / far.pointPricePerSqm;

  assert.ok(farWidth > nearWidth, `expected ${farWidth} > ${nearWidth}`);
});

test("horizons beyond 12 months are flagged low confidence", () => {
  const points = synthetic({ cagr: 0.05, seasonalAmp: 0.02, peakMonth: 3, noise: 0.005 });
  const far = forecastFromPoints("z", "condo", points, 18);

  assert.equal(far.confidence, "low");
  assert.equal(far.lowConfidence, true);
  assert.ok(far.cautionTh && far.cautionTh.length > 0);
});

test("a flat market forecasts flat", () => {
  const points = synthetic({ cagr: 0, seasonalAmp: 0, peakMonth: 1, noise: 0.002 });
  const forecast = forecastFromPoints("z", "condo", points, 6);
  assert.ok(Math.abs(forecast.changePct) < 1, `expected near-zero change, got ${forecast.changePct}%`);
});

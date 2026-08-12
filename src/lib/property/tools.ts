import { tool, type ToolSet } from "ai";
import { z } from "zod";

import { analyzeSeries, forecastFromPoints } from "./forecast";
import {
  PROPERTY_TYPE_LABEL_TH,
  currentPricePerSqm,
  getListingDetail,
  getPlaces,
  getSeries,
  getZone,
  getZoneStats,
  listZones,
  meta,
  provinces,
  resolveZone,
  searchListings,
  zones,
} from "./repository";
import type { PropertyType } from "./types";

const propertyTypeSchema = z
  .enum(["condo", "detached_house", "townhouse"])
  .describe("Property type. condo = คอนโด, townhouse = ทาวน์เฮาส์, detached_house = บ้านเดี่ยว.");

const placeCategorySchema = z.enum([
  "transit",
  "mall",
  "hospital",
  "school",
  "university",
  "market",
  "park",
  "airport",
  "beach",
]);

/** Envelope every tool returns, so the model can always cite where a number came from. */
function ok<T extends object>(data: T) {
  return { found: true as const, asOf: meta.asOf, source: meta.source, ...data };
}

function notFound(message: string, hint?: object) {
  return { found: false as const, asOf: meta.asOf, source: meta.source, message, ...hint };
}

const ZONE_DIRECTORY = zones.map((z) => ({
  zoneId: z.id,
  zoneNameTh: z.nameTh,
  zoneNameEn: z.nameEn,
  provinceId: z.provinceId,
}));

function resolveZoneOrNull(query: string) {
  return resolveZone(query) ?? getZone(query);
}

export const propertyTools = {
  searchListings: tool({
    description:
      "Search property listings for sale. Use this whenever the user asks to find, browse or shortlist properties. Returns listing summaries including how each one is priced against its zone median.",
    inputSchema: z.object({
      province: z.string().optional().describe("Province name or id, e.g. 'กรุงเทพ', 'phuket'."),
      zone: z.string().optional().describe("Zone/neighbourhood name or id, e.g. 'อโศก', 'bkk-asoke'."),
      propertyType: propertyTypeSchema.optional(),
      minPrice: z.number().optional().describe("Minimum total price in THB."),
      maxPrice: z.number().optional().describe("Maximum total price in THB."),
      minBedrooms: z.number().int().optional(),
      minAreaSqm: z.number().optional(),
      maxTransitKm: z
        .number()
        .optional()
        .describe("Only listings within this distance of a BTS/MRT station, in km."),
      sort: z
        .enum(["price_asc", "price_desc", "newest", "best_value", "longest_listed"])
        .optional()
        .describe("best_value ranks cheapest relative to the zone median. Defaults to best_value."),
      limit: z.number().int().min(1).max(20).optional(),
    }),
    execute: async (params) => {
      const result = searchListings(params as Parameters<typeof searchListings>[0]);

      if (result.unresolved.length > 0 && result.matches.length === 0) {
        return notFound(
          `ไม่รู้จักพื้นที่: ${result.unresolved.join(", ")} — ถามผู้ใช้ให้เลือกจากรายการพื้นที่ที่มีข้อมูล ห้ามเดา`,
          { availableZones: ZONE_DIRECTORY },
        );
      }
      if (result.matches.length === 0) {
        return notFound("ไม่มีประกาศที่ตรงเงื่อนไขนี้ — เสนอให้ผู้ใช้ผ่อนเงื่อนไข ห้ามแต่งประกาศขึ้นเอง", {
          appliedFilters: params,
        });
      }

      return ok({
        totalMatched: result.totalMatched,
        returned: result.matches.length,
        resolvedProvince: result.resolvedProvince?.nameTh ?? null,
        resolvedZone: result.resolvedZone?.nameTh ?? null,
        listings: result.matches,
      });
    },
  }),

  getListing: tool({
    description:
      "Get the full detail of one listing by id, including its price-cut history, days on market, how it compares to the zone median, and negotiation signals. Use before advising on a specific property.",
    inputSchema: z.object({
      listingId: z.string().describe("Listing id such as 'L0001'."),
    }),
    execute: async ({ listingId }) => {
      const detail = getListingDetail(listingId);
      if (!detail) {
        return notFound(`ไม่พบประกาศรหัส ${listingId} — ให้ค้นหาด้วย searchListings ก่อน`);
      }
      return ok({ listing: detail });
    },
  }),

  getZoneStats: tool({
    description:
      "Get current market statistics for one zone and property type: price per sqm, median price, year-on-year and 3-year change, inventory and median days on market. Use for 'how much is it around here' questions.",
    inputSchema: z.object({
      zone: z.string().describe("Zone name or id."),
      propertyType: propertyTypeSchema,
    }),
    execute: async ({ zone, propertyType }) => {
      const resolved = resolveZoneOrNull(zone);
      if (!resolved) {
        return notFound(`ไม่รู้จักพื้นที่ '${zone}' — ให้ผู้ใช้เลือกจากรายการนี้`, {
          availableZones: ZONE_DIRECTORY,
        });
      }
      const stats = getZoneStats(resolved.id, propertyType);
      if (!stats) {
        return notFound(`ไม่มีข้อมูล ${PROPERTY_TYPE_LABEL_TH[propertyType]} ในโซน ${resolved.nameTh}`);
      }
      return ok({ stats });
    },
  }),

  getPriceHistory: tool({
    description:
      "Get the historical price-per-sqm series for a zone and property type. Use when the user asks about the trend, the graph, or what happened to prices over time. Do not compute forecasts from this yourself — call forecastPrice instead.",
    inputSchema: z.object({
      zone: z.string().describe("Zone name or id."),
      propertyType: propertyTypeSchema,
      months: z
        .number()
        .int()
        .min(6)
        .max(60)
        .optional()
        .describe("How many most-recent months to return. Defaults to 36."),
    }),
    execute: async ({ zone, propertyType, months }) => {
      const resolved = resolveZoneOrNull(zone);
      if (!resolved) {
        return notFound(`ไม่รู้จักพื้นที่ '${zone}'`, { availableZones: ZONE_DIRECTORY });
      }
      const s = getSeries(resolved.id, propertyType);
      if (!s) {
        return notFound(`ไม่มีข้อมูลราคาย้อนหลังของ ${PROPERTY_TYPE_LABEL_TH[propertyType]} ในโซน ${resolved.nameTh}`);
      }

      const window = s.points.slice(-(months ?? 36));
      const first = window[0];
      const last = window[window.length - 1];

      return ok({
        zoneId: resolved.id,
        zoneNameTh: resolved.nameTh,
        propertyType,
        propertyTypeTh: PROPERTY_TYPE_LABEL_TH[propertyType],
        unit: "THB per sqm",
        fromMonth: first.month,
        toMonth: last.month,
        changePct: Number((((last.pricePerSqm - first.pricePerSqm) / first.pricePerSqm) * 100).toFixed(2)),
        points: window.map((p) => ({ month: p.month, pricePerSqm: p.pricePerSqm })),
      });
    },
  }),

  forecastPrice: tool({
    description:
      "Forecast the future price per sqm for a zone and property type. This is the ONLY approved way to answer any question about future prices, whether prices will rise or fall, or whether now is a good time to buy. Never estimate a future price yourself.",
    inputSchema: z.object({
      zone: z.string().describe("Zone name or id."),
      propertyType: propertyTypeSchema,
      horizonMonths: z
        .number()
        .int()
        .min(1)
        .max(36)
        .describe("How many months ahead to forecast. Anything above 12 is flagged low confidence."),
    }),
    execute: async ({ zone, propertyType, horizonMonths }) => {
      const resolved = resolveZoneOrNull(zone);
      if (!resolved) {
        return notFound(`ไม่รู้จักพื้นที่ '${zone}'`, { availableZones: ZONE_DIRECTORY });
      }
      const s = getSeries(resolved.id, propertyType);
      if (!s) {
        return notFound(`ไม่มีข้อมูลราคาย้อนหลังพอที่จะทำนายสำหรับโซน ${resolved.nameTh}`);
      }

      const forecast = forecastFromPoints(resolved.id, propertyType, s.points, horizonMonths);
      const typicalAreaSqm = propertyType === "condo" ? 42 : propertyType === "townhouse" ? 118 : 190;

      return ok({
        zoneNameTh: resolved.nameTh,
        propertyTypeTh: PROPERTY_TYPE_LABEL_TH[propertyType],
        unit: "THB per sqm",
        forecast,
        exampleUnitPrice: {
          typicalAreaSqm,
          pointPrice: Math.round(forecast.pointPricePerSqm * typicalAreaSqm),
          lowPrice: Math.round(forecast.lowPricePerSqm * typicalAreaSqm),
          highPrice: Math.round(forecast.highPricePerSqm * typicalAreaSqm),
        },
      });
    },
  }),

  compareZones: tool({
    description:
      "Compare 2-4 zones side by side for one property type, with the ranking and all differences computed server-side. Use this instead of calling getZoneStats several times and doing the arithmetic yourself.",
    inputSchema: z.object({
      zones: z.array(z.string()).min(2).max(4).describe("Zone names or ids to compare."),
      propertyType: propertyTypeSchema,
      horizonMonths: z
        .number()
        .int()
        .min(1)
        .max(24)
        .optional()
        .describe("Forecast horizon included in the comparison. Defaults to 12."),
    }),
    execute: async ({ zones: requested, propertyType, horizonMonths }) => {
      const horizon = horizonMonths ?? 12;
      const rows = [];
      const unresolved: string[] = [];

      for (const query of requested) {
        const resolved = resolveZoneOrNull(query);
        if (!resolved) {
          unresolved.push(query);
          continue;
        }
        const stats = getZoneStats(resolved.id, propertyType);
        const s = getSeries(resolved.id, propertyType);
        if (!stats || !s) {
          unresolved.push(query);
          continue;
        }
        const forecast = forecastFromPoints(resolved.id, propertyType, s.points, horizon);
        rows.push({
          zoneId: resolved.id,
          zoneNameTh: resolved.nameTh,
          provinceNameTh: stats.provinceNameTh,
          pricePerSqm: stats.pricePerSqm,
          changeYoYPct: stats.changeYoYPct,
          change3yPct: stats.change3yPct,
          cagrPct: analyzeSeries(s.points).cagrPct,
          forecastChangePct: forecast.changePct,
          forecastConfidence: forecast.confidence,
          volatilityPct: forecast.volatilityPct,
          listingsForSale: stats.listingsForSale,
          medianDaysOnMarket: stats.medianDaysOnMarket,
          hasMassTransit: stats.hasMassTransit,
        });
      }

      if (rows.length < 2) {
        return notFound(
          `เปรียบเทียบไม่ได้ ต้องมีโซนที่รู้จักอย่างน้อย 2 โซน (ไม่รู้จัก: ${unresolved.join(", ")})`,
          { availableZones: ZONE_DIRECTORY },
        );
      }

      const cheapest = [...rows].sort((a, b) => a.pricePerSqm - b.pricePerSqm)[0];
      const fastestGrowing = [...rows].sort((a, b) => b.cagrPct - a.cagrPct)[0];
      const mostStable = [...rows].sort((a, b) => a.volatilityPct - b.volatilityPct)[0];
      const priciest = [...rows].sort((a, b) => b.pricePerSqm - a.pricePerSqm)[0];

      return ok({
        propertyTypeTh: PROPERTY_TYPE_LABEL_TH[propertyType],
        horizonMonths: horizon,
        unresolved,
        rows,
        rankings: {
          cheapestZoneId: cheapest.zoneId,
          priciestZoneId: priciest.zoneId,
          fastestGrowingZoneId: fastestGrowing.zoneId,
          mostStableZoneId: mostStable.zoneId,
          priceGapPct: Number(
            (((priciest.pricePerSqm - cheapest.pricePerSqm) / cheapest.pricePerSqm) * 100).toFixed(1),
          ),
        },
      });
    },
  }),

  getNearbyPlaces: tool({
    description:
      "List notable places near a zone or a listing — BTS/MRT stations, malls, hospitals, schools, universities, markets, parks, airports, beaches — with distances. Use for any 'what is nearby' or 'is it close to X' question.",
    inputSchema: z.object({
      zone: z.string().optional().describe("Zone name or id."),
      listingId: z.string().optional().describe("Listing id; its zone is used."),
      category: placeCategorySchema.optional().describe("Filter to one category."),
    }),
    execute: async ({ zone, listingId, category }) => {
      let resolved = zone ? resolveZoneOrNull(zone) : null;

      if (!resolved && listingId) {
        const detail = getListingDetail(listingId);
        if (!detail) return notFound(`ไม่พบประกาศรหัส ${listingId}`);
        resolved = getZone(detail.zoneId);
      }
      if (!resolved) {
        return notFound("ต้องระบุ zone หรือ listingId ที่รู้จัก", { availableZones: ZONE_DIRECTORY });
      }

      const nearby = getPlaces(resolved.id, category);
      if (nearby.length === 0) {
        return notFound(`ไม่มีข้อมูลสถานที่หมวด '${category}' ในโซน ${resolved.nameTh}`);
      }

      return ok({
        zoneId: resolved.id,
        zoneNameTh: resolved.nameTh,
        blurbTh: resolved.blurbTh,
        hasMassTransit: resolved.hasMassTransit,
        places: nearby.map((p) => ({
          nameTh: p.nameTh,
          category: p.category,
          distanceKm: p.distanceKm,
          walkMinutes: p.walkMinutes,
        })),
      });
    },
  }),
} satisfies ToolSet;

export const DATASET_COVERAGE = {
  asOf: meta.asOf,
  source: meta.source,
  provinces: provinces.map((p) => ({
    provinceId: p.id,
    provinceNameTh: p.nameTh,
    marketCharacterTh: p.marketCharacterTh,
    zones: listZones(p.id).map((z) => ({ zoneId: z.id, zoneNameTh: z.nameTh })),
  })),
  propertyTypes: Object.entries(PROPERTY_TYPE_LABEL_TH).map(([id, labelTh]) => ({ id, labelTh })),
};

export function zoneCurrentPrice(zoneId: string, propertyType: PropertyType) {
  return currentPricePerSqm(zoneId, propertyType);
}

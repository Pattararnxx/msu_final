import listingsJson from "@/data/listings.json";
import metaJson from "@/data/meta.json";
import placesJson from "@/data/places.json";
import pricesJson from "@/data/price-history.json";
import provincesJson from "@/data/provinces.json";
import zonesJson from "@/data/zones.json";

import {
  HISTORY_MONTHS,
  type Listing,
  type Place,
  type PlaceCategory,
  type PriceSeries,
  type PropertyType,
  type Province,
  type Zone,
} from "./types";

export const meta = metaJson as { asOf: string; source: string };
export const provinces = provincesJson as Province[];
export const zones = zonesJson as Zone[];
export const places = placesJson as unknown as Place[];
export const listings = listingsJson as unknown as Listing[];
export const series = pricesJson as unknown as PriceSeries[];

const zoneById = new Map(zones.map((z) => [z.id, z]));
const provinceById = new Map(provinces.map((p) => [p.id, p]));
const listingById = new Map(listings.map((l) => [l.id, l]));
const seriesByKey = new Map(series.map((s) => [`${s.zoneId}:${s.propertyType}`, s]));

/**
 * Referential integrity check. The dataset is hand-editable JSON, so a typo in
 * a zoneId must fail loudly at import time instead of surfacing as an empty
 * tool result the model then has to explain away.
 */
function assertDataset(): void {
  for (const zone of zones) {
    if (!provinceById.has(zone.provinceId)) {
      throw new Error(`zone ${zone.id} references unknown province ${zone.provinceId}`);
    }
  }
  for (const listing of listings) {
    if (!zoneById.has(listing.zoneId)) {
      throw new Error(`listing ${listing.id} references unknown zone ${listing.zoneId}`);
    }
    if (listing.zoneId && zoneById.get(listing.zoneId)?.provinceId !== listing.provinceId) {
      throw new Error(`listing ${listing.id} province does not match its zone`);
    }
  }
  for (const place of places) {
    if (!zoneById.has(place.zoneId)) {
      throw new Error(`place ${place.id} references unknown zone ${place.zoneId}`);
    }
  }
  for (const s of series) {
    if (!zoneById.has(s.zoneId)) {
      throw new Error(`series references unknown zone ${s.zoneId}`);
    }
    if (s.points.length !== HISTORY_MONTHS) {
      throw new Error(
        `series ${s.zoneId}:${s.propertyType} has ${s.points.length} points, expected ${HISTORY_MONTHS}`,
      );
    }
  }
}

assertDataset();

export const PROPERTY_TYPE_LABEL_TH: Record<PropertyType, string> = {
  condo: "คอนโด",
  townhouse: "ทาวน์เฮาส์",
  detached_house: "บ้านเดี่ยว",
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s\-–_]/g, "");
}

export function resolveProvince(query: string): Province | null {
  const q = normalize(query);
  if (!q) return null;
  return (
    provinces.find((p) => normalize(p.id) === q) ??
    provinces.find((p) => normalize(p.nameTh) === q || normalize(p.nameEn) === q) ??
    provinces.find((p) => normalize(p.nameTh).includes(q) || normalize(p.nameEn).includes(q)) ??
    null
  );
}

export function resolveZone(query: string): Zone | null {
  const q = normalize(query);
  if (!q) return null;
  return (
    zones.find((z) => normalize(z.id) === q) ??
    zones.find((z) => normalize(z.nameTh) === q || normalize(z.nameEn) === q) ??
    zones.find((z) => normalize(z.nameTh).includes(q) || normalize(z.nameEn).includes(q)) ??
    zones.find((z) => q.includes(normalize(z.nameEn)) && normalize(z.nameEn).length > 3) ??
    null
  );
}

export function getZone(zoneId: string): Zone | null {
  return zoneById.get(zoneId) ?? null;
}

export function getProvince(provinceId: string): Province | null {
  return provinceById.get(provinceId) ?? null;
}

export function getListing(listingId: string): Listing | null {
  return listingById.get(listingId.toUpperCase()) ?? null;
}

export function getSeries(zoneId: string, propertyType: PropertyType): PriceSeries | null {
  return seriesByKey.get(`${zoneId}:${propertyType}`) ?? null;
}

export function listZones(provinceId?: string): Zone[] {
  return provinceId ? zones.filter((z) => z.provinceId === provinceId) : zones;
}

export function getPlaces(zoneId: string, category?: PlaceCategory): Place[] {
  return places
    .filter((p) => p.zoneId === zoneId && (!category || p.category === category))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function currentPricePerSqm(zoneId: string, propertyType: PropertyType): number | null {
  const s = getSeries(zoneId, propertyType);
  if (!s) return null;
  return s.points[s.points.length - 1].pricePerSqm;
}

export interface ZoneStats {
  zoneId: string;
  zoneNameTh: string;
  provinceId: string;
  provinceNameTh: string;
  propertyType: PropertyType;
  propertyTypeTh: string;
  pricePerSqm: number;
  medianPrice: number;
  changeYoYPct: number;
  change3yPct: number;
  monthlyTransactions: number;
  listingsForSale: number;
  medianDaysOnMarket: number;
  hasMassTransit: boolean;
  blurbTh: string;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

export function getZoneStats(zoneId: string, propertyType: PropertyType): ZoneStats | null {
  const zone = zoneById.get(zoneId);
  const s = getSeries(zoneId, propertyType);
  const province = zone ? provinceById.get(zone.provinceId) : null;
  if (!zone || !s || !province) return null;

  const points = s.points;
  const last = points[points.length - 1];
  const yearAgo = points[points.length - 13];
  const threeYearsAgo = points[points.length - 37];

  const zoneListings = listings.filter(
    (l) => l.zoneId === zoneId && l.propertyType === propertyType && l.status === "for_sale",
  );

  return {
    zoneId: zone.id,
    zoneNameTh: zone.nameTh,
    provinceId: province.id,
    provinceNameTh: province.nameTh,
    propertyType,
    propertyTypeTh: PROPERTY_TYPE_LABEL_TH[propertyType],
    pricePerSqm: last.pricePerSqm,
    medianPrice: last.medianPrice,
    changeYoYPct: Number((((last.pricePerSqm - yearAgo.pricePerSqm) / yearAgo.pricePerSqm) * 100).toFixed(2)),
    change3yPct: Number(
      (((last.pricePerSqm - threeYearsAgo.pricePerSqm) / threeYearsAgo.pricePerSqm) * 100).toFixed(2),
    ),
    monthlyTransactions: last.transactions,
    listingsForSale: zoneListings.length,
    medianDaysOnMarket: median(zoneListings.map((l) => l.daysOnMarket)),
    hasMassTransit: zone.hasMassTransit,
    blurbTh: zone.blurbTh,
  };
}

export interface ListingSearchParams {
  province?: string;
  zone?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minAreaSqm?: number;
  maxTransitKm?: number;
  status?: Listing["status"];
  sort?: "price_asc" | "price_desc" | "newest" | "best_value" | "longest_listed";
  limit?: number;
}

export interface ListingSummary {
  id: string;
  titleTh: string;
  zoneNameTh: string;
  provinceNameTh: string;
  propertyTypeTh: string;
  price: number;
  pricePerSqm: number;
  areaSqm: number;
  bedrooms: number;
  daysOnMarket: number;
  priceCuts: number;
  vsZoneMedianPct: number;
  nearestTransitKm: number | null;
  status: Listing["status"];
}

function vsZoneMedianPct(listing: Listing): number {
  const zoneMedian = currentPricePerSqm(listing.zoneId, listing.propertyType);
  if (!zoneMedian) return 0;
  return Number((((listing.pricePerSqm - zoneMedian) / zoneMedian) * 100).toFixed(1));
}

export function toSummary(listing: Listing): ListingSummary {
  const zone = zoneById.get(listing.zoneId);
  const province = provinceById.get(listing.provinceId);
  return {
    id: listing.id,
    titleTh: listing.titleTh,
    zoneNameTh: zone?.nameTh ?? listing.zoneId,
    provinceNameTh: province?.nameTh ?? listing.provinceId,
    propertyTypeTh: PROPERTY_TYPE_LABEL_TH[listing.propertyType],
    price: listing.price,
    pricePerSqm: listing.pricePerSqm,
    areaSqm: listing.areaSqm,
    bedrooms: listing.bedrooms,
    daysOnMarket: listing.daysOnMarket,
    priceCuts: listing.priceChanges.length,
    vsZoneMedianPct: vsZoneMedianPct(listing),
    nearestTransitKm: listing.nearestTransitKm,
    status: listing.status,
  };
}

export function searchListings(params: ListingSearchParams): {
  matches: ListingSummary[];
  totalMatched: number;
  resolvedProvince: Province | null;
  resolvedZone: Zone | null;
  unresolved: string[];
} {
  const unresolved: string[] = [];

  const resolvedProvince = params.province ? resolveProvince(params.province) : null;
  if (params.province && !resolvedProvince) unresolved.push(params.province);

  const resolvedZone = params.zone ? resolveZone(params.zone) : null;
  if (params.zone && !resolvedZone) unresolved.push(params.zone);

  let result = listings.filter((l) => l.status === (params.status ?? "for_sale"));

  if (resolvedZone) result = result.filter((l) => l.zoneId === resolvedZone.id);
  else if (resolvedProvince) result = result.filter((l) => l.provinceId === resolvedProvince.id);

  if (params.propertyType) result = result.filter((l) => l.propertyType === params.propertyType);
  if (params.minPrice !== undefined) result = result.filter((l) => l.price >= params.minPrice!);
  if (params.maxPrice !== undefined) result = result.filter((l) => l.price <= params.maxPrice!);
  if (params.minBedrooms !== undefined) result = result.filter((l) => l.bedrooms >= params.minBedrooms!);
  if (params.minAreaSqm !== undefined) result = result.filter((l) => l.areaSqm >= params.minAreaSqm!);
  if (params.maxTransitKm !== undefined) {
    result = result.filter(
      (l) => l.nearestTransitKm !== null && l.nearestTransitKm <= params.maxTransitKm!,
    );
  }

  const totalMatched = result.length;
  const summaries = result.map(toSummary);

  switch (params.sort) {
    case "price_asc":
      summaries.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      summaries.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      summaries.sort((a, b) => a.daysOnMarket - b.daysOnMarket);
      break;
    case "longest_listed":
      summaries.sort((a, b) => b.daysOnMarket - a.daysOnMarket);
      break;
    case "best_value":
    default:
      summaries.sort((a, b) => a.vsZoneMedianPct - b.vsZoneMedianPct);
      break;
  }

  return {
    matches: summaries.slice(0, params.limit ?? 8),
    totalMatched,
    resolvedProvince,
    resolvedZone,
    unresolved,
  };
}

export interface ListingDetail extends ListingSummary {
  bathrooms: number;
  floor: number | null;
  yearBuilt: number;
  listedDate: string;
  featuresTh: string[];
  priceChanges: Listing["priceChanges"];
  originalPrice: number;
  totalPriceCutPct: number;
  zoneId: string;
  zoneMedianPricePerSqm: number;
  zoneMedianDaysOnMarket: number;
  negotiationSignalsTh: string[];
}

export function getListingDetail(listingId: string): ListingDetail | null {
  const listing = getListing(listingId);
  if (!listing) return null;

  const stats = getZoneStats(listing.zoneId, listing.propertyType);
  const originalPrice = listing.priceChanges[0]?.fromPrice ?? listing.price;
  const totalPriceCutPct = Number((((listing.price - originalPrice) / originalPrice) * 100).toFixed(2));

  const signals: string[] = [];
  const vsMedian = vsZoneMedianPct(listing);
  if (listing.priceChanges.length >= 2) signals.push(`ลดราคามาแล้ว ${listing.priceChanges.length} ครั้ง`);
  else if (listing.priceChanges.length === 1) signals.push("ลดราคามาแล้ว 1 ครั้ง");
  if (stats && listing.daysOnMarket > stats.medianDaysOnMarket) {
    signals.push(`ค้างขาย ${listing.daysOnMarket} วัน นานกว่าค่ากลางโซนที่ ${stats.medianDaysOnMarket} วัน`);
  }
  if (vsMedian > 5) signals.push(`ราคาต่อ ตร.ม. สูงกว่าค่ากลางโซน ${vsMedian}%`);
  if (vsMedian < -5) signals.push(`ราคาต่อ ตร.ม. ต่ำกว่าค่ากลางโซน ${Math.abs(vsMedian)}%`);

  return {
    ...toSummary(listing),
    bathrooms: listing.bathrooms,
    floor: listing.floor,
    yearBuilt: listing.yearBuilt,
    listedDate: listing.listedDate,
    featuresTh: listing.featuresTh,
    priceChanges: listing.priceChanges,
    originalPrice,
    totalPriceCutPct,
    zoneId: listing.zoneId,
    zoneMedianPricePerSqm: stats?.pricePerSqm ?? 0,
    zoneMedianDaysOnMarket: stats?.medianDaysOnMarket ?? 0,
    negotiationSignalsTh: signals,
  };
}

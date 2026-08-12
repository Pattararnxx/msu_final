export const DATASET_AS_OF = "2026-07";
export const DATASET_SOURCE = "msu-mock-property-dataset/v1";
export const HISTORY_START = "2021-08";
export const HISTORY_MONTHS = 60;

export type PropertyType = "condo" | "detached_house" | "townhouse";

export type ListingStatus = "for_sale" | "under_offer" | "sold";

export type PlaceCategory =
  | "transit"
  | "mall"
  | "hospital"
  | "school"
  | "university"
  | "market"
  | "park"
  | "airport"
  | "beach";

export interface Province {
  id: string;
  nameTh: string;
  nameEn: string;
  region: string;
  marketCharacterTh: string;
}

export interface Zone {
  id: string;
  provinceId: string;
  nameTh: string;
  nameEn: string;
  lat: number;
  lng: number;
  hasMassTransit: boolean;
  blurbTh: string;
}

export interface Place {
  id: string;
  zoneId: string;
  nameTh: string;
  category: PlaceCategory;
  distanceKm: number;
  walkMinutes: number;
}

export interface PriceChangeEvent {
  date: string;
  fromPrice: number;
  toPrice: number;
  changePct: number;
}

export interface Listing {
  id: string;
  titleTh: string;
  provinceId: string;
  zoneId: string;
  propertyType: PropertyType;
  status: ListingStatus;
  price: number;
  areaSqm: number;
  pricePerSqm: number;
  bedrooms: number;
  bathrooms: number;
  floor: number | null;
  yearBuilt: number;
  listedDate: string;
  daysOnMarket: number;
  nearestTransitKm: number | null;
  featuresTh: string[];
  priceChanges: PriceChangeEvent[];
}

export interface PricePoint {
  month: string;
  pricePerSqm: number;
  medianPrice: number;
  transactions: number;
}

export interface PriceSeries {
  zoneId: string;
  propertyType: PropertyType;
  points: PricePoint[];
}

export interface PropertyDataset {
  asOf: string;
  source: string;
  provinces: Province[];
  zones: Zone[];
  places: Place[];
  listings: Listing[];
  series: PriceSeries[];
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface Forecast {
  zoneId: string;
  propertyType: PropertyType;
  horizonMonths: number;
  targetMonth: string;
  currentPricePerSqm: number;
  pointPricePerSqm: number;
  lowPricePerSqm: number;
  highPricePerSqm: number;
  changePct: number;
  cagrPct: number;
  seasonalAdjustmentPct: number;
  confidence: ConfidenceLevel;
  confidenceLevelPct: number;
  basisMonths: number;
  volatilityPct: number;
  lowConfidence: boolean;
  cautionTh: string | null;
}

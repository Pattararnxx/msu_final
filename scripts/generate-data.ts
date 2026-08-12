/**
 * Deterministic mock-data generator for the property dataset.
 *
 * Run: node scripts/generate-data.ts
 * Output: src/data/*.json  (committed — hand edits survive until this is re-run)
 *
 * Shapes mirror src/lib/property/types.ts. repository.ts casts the JSON to
 * those types, so any drift fails `next build`.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");

const SEED = 20260812;
const HISTORY_START_YEAR = 2021;
const HISTORY_START_MONTH = 8;
const HISTORY_MONTHS = 60;
const AS_OF = "2026-07";
const AS_OF_DATE = "2026-07-31";
const SOURCE = "msu-mock-property-dataset/v1";

type PropertyType = "condo" | "detached_house" | "townhouse";

const PROPERTY_TYPES: PropertyType[] = ["condo", "detached_house", "townhouse"];

const TYPICAL_AREA: Record<PropertyType, number> = {
  condo: 42,
  townhouse: 118,
  detached_house: 190,
};

const AREA_RANGE: Record<PropertyType, [number, number]> = {
  condo: [28, 95],
  townhouse: [88, 168],
  detached_house: [140, 320],
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);

function gauss(): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pick<T>(items: T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function randInt(min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function buildMonths(): { key: string; month: number }[] {
  const out: { key: string; month: number }[] = [];
  let year = HISTORY_START_YEAR;
  let month = HISTORY_START_MONTH;
  for (let i = 0; i < HISTORY_MONTHS; i++) {
    out.push({ key: monthKey(year, month), month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return out;
}

function addMonths(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  return monthKey(Math.floor(total / 12), (total % 12) + 1);
}

function daysBefore(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

interface ProvinceConfig {
  id: string;
  nameTh: string;
  nameEn: string;
  region: string;
  marketCharacterTh: string;
  seasonAmp: number;
  seasonAmp2: number;
  peakMonth: number;
  noiseSigma: number;
  listingCount: number;
  typeWeights: Record<PropertyType, number>;
}

const PROVINCES: ProvinceConfig[] = [
  {
    id: "bangkok",
    nameTh: "กรุงเทพมหานคร",
    nameEn: "Bangkok",
    region: "ภาคกลาง",
    marketCharacterTh:
      "ตลาดคอนโดแนวรถไฟฟ้าเป็นหลัก ราคาต่อตารางเมตรสูงสุดของประเทศ เติบโตสม่ำเสมอ โซนที่มีรถไฟฟ้าสายใหม่โตเร็วกว่าค่าเฉลี่ยชัดเจน",
    seasonAmp: 0.006,
    seasonAmp2: 0,
    peakMonth: 3,
    noiseSigma: 0.009,
    listingCount: 44,
    typeWeights: { condo: 0.62, townhouse: 0.24, detached_house: 0.14 },
  },
  {
    id: "chiangmai",
    nameTh: "เชียงใหม่",
    nameEn: "Chiang Mai",
    region: "ภาคเหนือ",
    marketCharacterTh:
      "ตลาดบ้านและวิลล่าสำหรับผู้อยู่อาศัยระยะยาว ชาวต่างชาติ และดิจิทัลโนแมด ราคาขยับช้าแต่นิ่ง มีจังหวะคึกคักช่วงฤดูหนาว",
    seasonAmp: 0.016,
    seasonAmp2: 0,
    peakMonth: 12,
    noiseSigma: 0.013,
    listingCount: 40,
    typeWeights: { condo: 0.34, townhouse: 0.22, detached_house: 0.44 },
  },
  {
    id: "phuket",
    nameTh: "ภูเก็ต",
    nameEn: "Phuket",
    region: "ภาคใต้",
    marketCharacterTh:
      "ตลาดวิลล่าและคอนโดเพื่อการลงทุนปล่อยเช่าท่องเที่ยว ราคาโตแรงแต่ผันผวนตามรอบไฮ/โลว์ซีซั่นและกระแสนักท่องเที่ยวต่างชาติ",
    seasonAmp: 0.042,
    seasonAmp2: 0,
    peakMonth: 1,
    noiseSigma: 0.03,
    listingCount: 40,
    typeWeights: { condo: 0.46, townhouse: 0.14, detached_house: 0.4 },
  },
  {
    id: "mahasarakham",
    nameTh: "มหาสารคาม",
    nameEn: "Maha Sarakham",
    region: "ภาคตะวันออกเฉียงเหนือ",
    marketCharacterTh:
      "ตลาดหอพักและบ้านให้เช่ารอบมหาวิทยาลัยมหาสารคาม ราคาต่ำและนิ่ง ดีมานด์ขึ้นลงตามปฏิทินการศึกษา คือช่วงเปิดเทอมกลางปีและปลายปี",
    seasonAmp: 0.026,
    seasonAmp2: 0.014,
    peakMonth: 6,
    noiseSigma: 0.012,
    listingCount: 36,
    typeWeights: { condo: 0.4, townhouse: 0.3, detached_house: 0.3 },
  },
];

interface ZoneConfig {
  id: string;
  provinceId: string;
  nameTh: string;
  nameEn: string;
  lat: number;
  lng: number;
  hasMassTransit: boolean;
  blurbTh: string;
  growthPct: number;
  basePricePerSqm: Record<PropertyType, number>;
  places: [string, string, number][];
}

const ZONES: ZoneConfig[] = [
  {
    id: "bkk-asoke",
    provinceId: "bangkok",
    nameTh: "อโศก–สุขุมวิท",
    nameEn: "Asoke-Sukhumvit",
    lat: 13.7375,
    lng: 100.5602,
    hasMassTransit: true,
    blurbTh: "ศูนย์กลางธุรกิจและคอนโดไฮเอนด์ จุดตัด BTS อโศก และ MRT สุขุมวิท",
    growthPct: 4.5,
    basePricePerSqm: { condo: 185000, townhouse: 165000, detached_house: 240000 },
    places: [
      ["BTS อโศก", "transit", 0.2],
      ["MRT สุขุมวิท", "transit", 0.35],
      ["เทอร์มินอล 21", "mall", 0.3],
      ["โรงพยาบาลบำรุงราษฎร์", "hospital", 1.2],
      ["สวนเบญจกิติ", "park", 1.1],
    ],
  },
  {
    id: "bkk-sathorn",
    provinceId: "bangkok",
    nameTh: "สาทร–สีลม",
    nameEn: "Sathorn-Silom",
    lat: 13.722,
    lng: 100.529,
    hasMassTransit: true,
    blurbTh: "ย่านสำนักงานและสถานทูต ราคาต่อตารางเมตรสูงสุดในกรุงเทพ",
    growthPct: 4,
    basePricePerSqm: { condo: 196000, townhouse: 175000, detached_house: 255000 },
    places: [
      ["BTS ช่องนนทรี", "transit", 0.25],
      ["MRT ลุมพินี", "transit", 0.6],
      ["สีลมคอมเพล็กซ์", "mall", 0.7],
      ["โรงพยาบาลบีเอ็นเอช", "hospital", 0.8],
      ["สวนลุมพินี", "park", 0.9],
    ],
  },
  {
    id: "bkk-ari",
    provinceId: "bangkok",
    nameTh: "อารีย์–พหลโยธิน",
    nameEn: "Ari-Phahonyothin",
    lat: 13.7797,
    lng: 100.5449,
    hasMassTransit: true,
    blurbTh: "ย่านคาเฟ่และออฟฟิศรุ่นใหม่ ดีมานด์เช่าสูงจากคนทำงาน",
    growthPct: 5.2,
    basePricePerSqm: { condo: 152000, townhouse: 138000, detached_house: 195000 },
    places: [
      ["BTS อารีย์", "transit", 0.25],
      ["ลาวิลล่า อารีย์", "mall", 0.5],
      ["โรงพยาบาลพญาไท 2", "hospital", 1.4],
      ["ตลาดอารีย์", "market", 0.4],
      ["สวนรถไฟ", "park", 2.1],
    ],
  },
  {
    id: "bkk-ladprao",
    provinceId: "bangkok",
    nameTh: "ลาดพร้าว–จตุจักร",
    nameEn: "Ladprao-Chatuchak",
    lat: 13.816,
    lng: 100.561,
    hasMassTransit: true,
    blurbTh: "จุดเชื่อม MRT และสายสีเหลือง ที่อยู่อาศัยระดับกลางหนาแน่น",
    growthPct: 4.8,
    basePricePerSqm: { condo: 112000, townhouse: 96000, detached_house: 135000 },
    places: [
      ["MRT ลาดพร้าว", "transit", 0.3],
      ["เซ็นทรัล ลาดพร้าว", "mall", 0.6],
      ["ตลาดนัดจตุจักร", "market", 2.4],
      ["โรงพยาบาลเปาโล เกษตร", "hospital", 2.0],
      ["สวนจตุจักร", "park", 2.2],
    ],
  },
  {
    id: "bkk-bangna",
    provinceId: "bangkok",
    nameTh: "บางนา",
    nameEn: "Bangna",
    lat: 13.668,
    lng: 100.604,
    hasMassTransit: true,
    blurbTh: "ทางออกสู่ภาคตะวันออก บ้านจัดสรรและคอนโดราคาเข้าถึงได้",
    growthPct: 3.6,
    basePricePerSqm: { condo: 86000, townhouse: 72000, detached_house: 98000 },
    places: [
      ["BTS บางนา", "transit", 0.5],
      ["เซ็นทรัล บางนา", "mall", 1.1],
      ["โรงพยาบาลบางนา 1", "hospital", 1.8],
      ["โรงเรียนนานาชาติเบิร์กลีย์", "school", 2.6],
      ["ท่าอากาศยานสุวรรณภูมิ", "airport", 14.5],
    ],
  },
  {
    id: "bkk-minburi",
    provinceId: "bangkok",
    nameTh: "มีนบุรี",
    nameEn: "Minburi",
    lat: 13.814,
    lng: 100.732,
    hasMassTransit: true,
    blurbTh: "ชานเมืองตะวันออก ราคาต่ำสุดในกรุงเทพ ได้อานิสงส์รถไฟฟ้าสายสีชมพู",
    growthPct: 7.4,
    basePricePerSqm: { condo: 62000, townhouse: 52000, detached_house: 68000 },
    places: [
      ["MRT สายสีชมพู มีนบุรี", "transit", 0.4],
      ["ตลาดมีนบุรี", "market", 0.7],
      ["โรงพยาบาลนพรัตนราชธานี", "hospital", 2.8],
      ["แฟชั่นไอส์แลนด์", "mall", 4.2],
      ["สวนเฉลิมพระเกียรติ ร.9", "park", 3.1],
    ],
  },
  {
    id: "cnx-nimman",
    provinceId: "chiangmai",
    nameTh: "นิมมานเหมินท์",
    nameEn: "Nimmanhaemin",
    lat: 18.7963,
    lng: 98.967,
    hasMassTransit: false,
    blurbTh: "ย่านคาเฟ่และโคเวิร์กกิ้ง ดีมานด์เช่ารายเดือนจากดิจิทัลโนแมดสูงสุดในเชียงใหม่",
    growthPct: 3.4,
    basePricePerSqm: { condo: 96000, townhouse: 72000, detached_house: 105000 },
    places: [
      ["มหาวิทยาลัยเชียงใหม่", "university", 1.3],
      ["เมญ่า ไลฟ์สไตล์ ช้อปปิ้งเซ็นเตอร์", "mall", 0.6],
      ["โรงพยาบาลสวนดอก", "hospital", 1.6],
      ["ตลาดต้นพยอม", "market", 1.5],
      ["ท่าอากาศยานเชียงใหม่", "airport", 4.4],
    ],
  },
  {
    id: "cnx-oldcity",
    provinceId: "chiangmai",
    nameTh: "คูเมือง–เมืองเชียงใหม่",
    nameEn: "Old City",
    lat: 18.7877,
    lng: 98.9931,
    hasMassTransit: false,
    blurbTh: "เขตเมืองเก่าในคูเมือง ข้อจำกัดการก่อสร้างสูง ซัพพลายใหม่แทบไม่มี",
    growthPct: 2.6,
    basePricePerSqm: { condo: 78000, townhouse: 64000, detached_house: 92000 },
    places: [
      ["ประตูท่าแพ", "park", 0.4],
      ["ตลาดวโรรส", "market", 1.2],
      ["โรงพยาบาลเชียงใหม่ราม", "hospital", 1.9],
      ["เซ็นทรัล กาดสวนแก้ว", "mall", 1.7],
      ["ท่าอากาศยานเชียงใหม่", "airport", 3.8],
    ],
  },
  {
    id: "cnx-hangdong",
    provinceId: "chiangmai",
    nameTh: "หางดง",
    nameEn: "Hang Dong",
    lat: 18.689,
    lng: 98.92,
    hasMassTransit: false,
    blurbTh: "โซนบ้านจัดสรรและวิลล่าครอบครัว ใกล้โรงเรียนนานาชาติหลายแห่ง",
    growthPct: 3.0,
    basePricePerSqm: { condo: 52000, townhouse: 46000, detached_house: 58000 },
    places: [
      ["โรงเรียนนานาชาติเปรมติณสูลานนท์", "school", 3.4],
      ["เซ็นทรัล เชียงใหม่ แอร์พอร์ต", "mall", 6.2],
      ["โรงพยาบาลหางดง", "hospital", 1.5],
      ["ตลาดหางดง", "market", 0.8],
      ["ท่าอากาศยานเชียงใหม่", "airport", 7.9],
    ],
  },
  {
    id: "cnx-sansai",
    provinceId: "chiangmai",
    nameTh: "สันทราย",
    nameEn: "San Sai",
    lat: 18.858,
    lng: 99.045,
    hasMassTransit: false,
    blurbTh: "โซนมหาวิทยาลัยแม่โจ้ ตลาดเช่านักศึกษาและบ้านเดี่ยวราคาเข้าถึงได้",
    growthPct: 2.8,
    basePricePerSqm: { condo: 48000, townhouse: 42000, detached_house: 53000 },
    places: [
      ["มหาวิทยาลัยแม่โจ้", "university", 1.1],
      ["โรงพยาบาลสันทราย", "hospital", 2.3],
      ["ตลาดสันทรายหลวง", "market", 1.0],
      ["เซ็นทรัล เฟสติวัล เชียงใหม่", "mall", 7.4],
      ["สวนสาธารณะหนองน้ำสันทราย", "park", 1.8],
    ],
  },
  {
    id: "cnx-maerim",
    provinceId: "chiangmai",
    nameTh: "แม่ริม",
    nameEn: "Mae Rim",
    lat: 18.916,
    lng: 98.937,
    hasMassTransit: false,
    blurbTh: "โซนวิวภูเขาและรีสอร์ต บ้านพักตากอากาศเป็นหลัก",
    growthPct: 2.4,
    basePricePerSqm: { condo: 46000, townhouse: 41000, detached_house: 62000 },
    places: [
      ["สวนพฤกษศาสตร์สมเด็จพระนางเจ้าสิริกิติ์", "park", 5.6],
      ["โรงพยาบาลแม่ริม", "hospital", 1.4],
      ["ตลาดแม่ริม", "market", 0.9],
      ["โรงเรียนนานาชาติลานนา", "school", 8.2],
      ["ท่าอากาศยานเชียงใหม่", "airport", 16.3],
    ],
  },
  {
    id: "cnx-sankamphaeng",
    provinceId: "chiangmai",
    nameTh: "สันกำแพง",
    nameEn: "San Kamphaeng",
    lat: 18.745,
    lng: 99.118,
    hasMassTransit: false,
    blurbTh: "โซนหัตถกรรมและบ่อน้ำพุร้อน ราคาต่ำสุดในกลุ่มปริมณฑลเชียงใหม่",
    growthPct: 2.2,
    basePricePerSqm: { condo: 44000, townhouse: 39000, detached_house: 50000 },
    places: [
      ["น้ำพุร้อนสันกำแพง", "park", 11.4],
      ["โรงพยาบาลสันกำแพง", "hospital", 1.2],
      ["ตลาดสันกำแพง", "market", 0.6],
      ["พรอมเมนาดา รีสอร์ต มอลล์", "mall", 6.8],
      ["ท่าอากาศยานเชียงใหม่", "airport", 13.1],
    ],
  },
  {
    id: "hkt-patong",
    provinceId: "phuket",
    nameTh: "ป่าตอง",
    nameEn: "Patong",
    lat: 7.8918,
    lng: 98.296,
    hasMassTransit: false,
    blurbTh: "ศูนย์กลางท่องเที่ยวของภูเก็ต อัตราเข้าพักและรายได้ค่าเช่าผันผวนตามฤดูกาลรุนแรง",
    growthPct: 7.5,
    basePricePerSqm: { condo: 132000, townhouse: 98000, detached_house: 155000 },
    places: [
      ["หาดป่าตอง", "beach", 0.3],
      ["จังซีลอน", "mall", 0.5],
      ["โรงพยาบาลป่าตอง", "hospital", 1.1],
      ["ถนนบางลา", "market", 0.6],
      ["ท่าอากาศยานภูเก็ต", "airport", 24.6],
    ],
  },
  {
    id: "hkt-bangtao",
    provinceId: "phuket",
    nameTh: "บางเทา–เชิงทะเล",
    nameEn: "Bangtao-Cherngtalay",
    lat: 8.0,
    lng: 98.293,
    hasMassTransit: false,
    blurbTh: "โซนวิลล่าหรูและบีชคลับ ราคาต่อตารางเมตรสูงสุดของภูเก็ต",
    growthPct: 8.6,
    basePricePerSqm: { condo: 148000, townhouse: 110000, detached_house: 182000 },
    places: [
      ["หาดบางเทา", "beach", 0.4],
      ["ปอร์โต เดอ ภูเก็ต", "mall", 2.8],
      ["โรงพยาบาลถลาง", "hospital", 6.4],
      ["โรงเรียนนานาชาติยูดับเบิลยูซี", "school", 4.1],
      ["ท่าอากาศยานภูเก็ต", "airport", 13.2],
    ],
  },
  {
    id: "hkt-karonkata",
    provinceId: "phuket",
    nameTh: "กะรน–กะตะ",
    nameEn: "Karon-Kata",
    lat: 7.818,
    lng: 98.296,
    hasMassTransit: false,
    blurbTh: "หาดครอบครัวเงียบกว่าป่าตอง คอนโดวิวทะเลปล่อยเช่ารายวันเป็นหลัก",
    growthPct: 6.8,
    basePricePerSqm: { condo: 118000, townhouse: 88000, detached_house: 138000 },
    places: [
      ["หาดกะตะ", "beach", 0.3],
      ["หาดกะรน", "beach", 1.4],
      ["โรงพยาบาลฉลอง", "hospital", 5.2],
      ["ตลาดกะรน", "market", 0.8],
      ["ท่าอากาศยานภูเก็ต", "airport", 30.4],
    ],
  },
  {
    id: "hkt-rawai",
    provinceId: "phuket",
    nameTh: "ราไวย์",
    nameEn: "Rawai",
    lat: 7.776,
    lng: 98.325,
    hasMassTransit: false,
    blurbTh: "โซนผู้พักอาศัยระยะยาวและครอบครัวต่างชาติ ราคาต่ำกว่าฝั่งหาดท่องเที่ยว",
    growthPct: 6.2,
    basePricePerSqm: { condo: 96000, townhouse: 76000, detached_house: 112000 },
    places: [
      ["หาดราไวย์", "beach", 0.5],
      ["แหลมพรหมเทพ", "park", 3.2],
      ["โรงพยาบาลฉลอง", "hospital", 2.6],
      ["ตลาดราไวย์", "market", 0.7],
      ["ท่าอากาศยานภูเก็ต", "airport", 33.8],
    ],
  },
  {
    id: "hkt-town",
    provinceId: "phuket",
    nameTh: "เมืองภูเก็ต",
    nameEn: "Phuket Town",
    lat: 7.8804,
    lng: 98.3923,
    hasMassTransit: false,
    blurbTh: "ย่านเมืองเก่าและศูนย์ราชการ ดีมานด์จากคนทำงานประจำ ไม่พึ่งท่องเที่ยวมากนัก",
    growthPct: 4.8,
    basePricePerSqm: { condo: 78000, townhouse: 66000, detached_house: 88000 },
    places: [
      ["เซ็นทรัล ภูเก็ต", "mall", 2.4],
      ["โรงพยาบาลวชิระภูเก็ต", "hospital", 1.3],
      ["ย่านเมืองเก่าถนนถลาง", "market", 0.6],
      ["มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตภูเก็ต", "university", 4.8],
      ["ท่าอากาศยานภูเก็ต", "airport", 30.2],
    ],
  },
  {
    id: "hkt-maikhao",
    provinceId: "phuket",
    nameTh: "ไม้ขาว",
    nameEn: "Mai Khao",
    lat: 8.155,
    lng: 98.3,
    hasMassTransit: false,
    blurbTh: "หาดยาวติดสนามบิน โครงการแบรนด์เรสซิเดนซ์และรีสอร์ตระดับบน",
    growthPct: 7.0,
    basePricePerSqm: { condo: 104000, townhouse: 82000, detached_house: 126000 },
    places: [
      ["หาดไม้ขาว", "beach", 0.4],
      ["ท่าอากาศยานภูเก็ต", "airport", 4.6],
      ["โรงพยาบาลถลาง", "hospital", 9.1],
      ["ตลาดถลาง", "market", 8.4],
      ["อุทยานแห่งชาติสิรินาถ", "park", 1.2],
    ],
  },
  {
    id: "msk-thakhonyang",
    provinceId: "mahasarakham",
    nameTh: "ท่าขอนยาง",
    nameEn: "Tha Khon Yang",
    lat: 16.247,
    lng: 103.25,
    hasMassTransit: false,
    blurbTh: "หน้ามหาวิทยาลัยมหาสารคาม เขตขามเรียง ตลาดหอพักหนาแน่นที่สุดของจังหวัด",
    growthPct: 2.2,
    basePricePerSqm: { condo: 38000, townhouse: 30000, detached_house: 34000 },
    places: [
      ["มหาวิทยาลัยมหาสารคาม เขตขามเรียง", "university", 0.6],
      ["ตลาดน้อย ท่าขอนยาง", "market", 0.3],
      ["โรงพยาบาลสุทธาเวช", "hospital", 1.4],
      ["เสริมไทย คอมเพล็กซ์", "mall", 8.6],
      ["สวนสุขภาพ มมส.", "park", 0.9],
    ],
  },
  {
    id: "msk-khamriang",
    provinceId: "mahasarakham",
    nameTh: "ขามเรียง",
    nameEn: "Kham Riang",
    lat: 16.253,
    lng: 103.24,
    hasMassTransit: false,
    blurbTh: "ติดพื้นที่การศึกษา มมส. ซัพพลายหอพักใหม่เพิ่มต่อเนื่อง แข่งขันด้านราคาเช่าสูง",
    growthPct: 2.6,
    basePricePerSqm: { condo: 36000, townhouse: 29000, detached_house: 33000 },
    places: [
      ["มหาวิทยาลัยมหาสารคาม เขตขามเรียง", "university", 0.4],
      ["ตลาดขามเรียง", "market", 0.5],
      ["โรงพยาบาลสุทธาเวช", "hospital", 1.1],
      ["โรงเรียนสาธิต มมส.", "school", 1.0],
      ["สวนสุขภาพ มมส.", "park", 0.7],
    ],
  },
  {
    id: "msk-town",
    provinceId: "mahasarakham",
    nameTh: "เมืองมหาสารคาม",
    nameEn: "Maha Sarakham City",
    lat: 16.185,
    lng: 103.3,
    hasMassTransit: false,
    blurbTh: "เขตเทศบาลเมือง ศูนย์ราชการและโรงเรียน ดีมานด์จากครอบครัวประจำถิ่น",
    growthPct: 1.6,
    basePricePerSqm: { condo: 32000, townhouse: 27000, detached_house: 31000 },
    places: [
      ["เสริมไทย คอมเพล็กซ์", "mall", 0.9],
      ["โรงพยาบาลมหาสารคาม", "hospital", 1.2],
      ["ตลาดสดเทศบาลเมือง", "market", 0.5],
      ["โรงเรียนสารคามพิทยาคม", "school", 1.6],
      ["มหาวิทยาลัยมหาสารคาม เขตในเมือง", "university", 2.1],
    ],
  },
  {
    id: "msk-koeng",
    provinceId: "mahasarakham",
    nameTh: "เกิ้ง",
    nameEn: "Koeng",
    lat: 16.2,
    lng: 103.27,
    hasMassTransit: false,
    blurbTh: "รอยต่อเมืองกับ มมส. บ้านเดี่ยวราคาเข้าถึงได้สำหรับบุคลากรมหาวิทยาลัย",
    growthPct: 1.4,
    basePricePerSqm: { condo: 28000, townhouse: 24000, detached_house: 28000 },
    places: [
      ["มหาวิทยาลัยมหาสารคาม เขตขามเรียง", "university", 4.2],
      ["โรงพยาบาลมหาสารคาม", "hospital", 3.1],
      ["ตลาดเกิ้ง", "market", 0.6],
      ["เสริมไทย คอมเพล็กซ์", "mall", 3.4],
      ["สวนสาธารณะหนองข่า", "park", 1.7],
    ],
  },
  {
    id: "msk-waengnang",
    provinceId: "mahasarakham",
    nameTh: "แวงน่าง",
    nameEn: "Waeng Nang",
    lat: 16.16,
    lng: 103.29,
    hasMassTransit: false,
    blurbTh: "โซนชานเมืองด้านใต้ ที่ดินแปลงใหญ่ ราคาต่ำ ซัพพลายบ้านสร้างเองเป็นหลัก",
    growthPct: 1.2,
    basePricePerSqm: { condo: 26000, townhouse: 23000, detached_house: 27000 },
    places: [
      ["โรงพยาบาลมหาสารคาม", "hospital", 4.4],
      ["ตลาดแวงน่าง", "market", 0.8],
      ["โรงเรียนแวงน่างวิทยาคม", "school", 1.3],
      ["เสริมไทย คอมเพล็กซ์", "mall", 4.9],
      ["มหาวิทยาลัยมหาสารคาม เขตในเมือง", "university", 5.2],
    ],
  },
  {
    id: "msk-borabue",
    provinceId: "mahasarakham",
    nameTh: "บรบือ",
    nameEn: "Borabue",
    lat: 16.03,
    lng: 103.12,
    hasMassTransit: false,
    blurbTh: "อำเภอรองห่างตัวเมือง 25 กม. ราคาต่ำสุดในชุดข้อมูล สภาพคล่องต่ำ",
    growthPct: 1.0,
    basePricePerSqm: { condo: 24000, townhouse: 21000, detached_house: 25000 },
    places: [
      ["โรงพยาบาลบรบือ", "hospital", 0.8],
      ["ตลาดบรบือ", "market", 0.4],
      ["โรงเรียนบรบือวิทยาคาร", "school", 1.1],
      ["เสริมไทย คอมเพล็กซ์", "mall", 26.3],
      ["อ่างเก็บน้ำหนองบ่อ", "park", 2.2],
    ],
  },
];

const CONDO_NAMES = [
  "เดอะ ริช",
  "ไอดีโอ โมบิ",
  "ลุมพินี วิลล์",
  "ศุภาลัย ปาร์ค",
  "แอสปาย",
  "นิช ไพรด์",
  "เดอะ เบส",
  "ริธึ่ม",
  "เออร์บาโน่",
  "พลัม คอนโด",
];

const HOUSE_NAMES = [
  "บ้านกลางเมือง",
  "แลนซีโอ",
  "เศรษฐสิริ",
  "มัณฑนา",
  "ภัสสร",
  "คาซ่า วิลล์",
  "เดอะ แพลนท์",
  "สราญสิริ",
  "อนาสิริ",
  "ชัยพฤกษ์",
];

const FEATURE_POOL: Record<PropertyType, string[]> = {
  condo: [
    "สระว่ายน้ำระบบเกลือ",
    "ฟิตเนสชั้นดาดฟ้า",
    "โคเวิร์กกิ้งสเปซ",
    "รักษาความปลอดภัย 24 ชม.",
    "ที่จอดรถส่วนตัว",
    "วิวเมือง",
    "เฟอร์นิเจอร์ครบ",
    "เครื่องปรับอากาศทุกห้อง",
  ],
  townhouse: [
    "ที่จอดรถ 2 คัน",
    "หมู่บ้านมีรั้วรอบ",
    "สวนหลังบ้าน",
    "ครัวไทยแยกส่วน",
    "ต่อเติมแล้ว",
    "ใกล้ทางด่วน",
    "รักษาความปลอดภัย 24 ชม.",
  ],
  detached_house: [
    "สระว่ายน้ำส่วนตัว",
    "ที่ดินแปลงมุม",
    "สวนขนาดใหญ่",
    "ห้องนอนชั้นล่าง",
    "โซลาร์รูฟ",
    "ที่จอดรถ 3 คัน",
    "ห้องแม่บ้านแยกส่วน",
    "ครัวไทยแยกส่วน",
  ],
};

const MONTHS = buildMonths();

function seasonalFactor(province: ProvinceConfig, month: number): number {
  const phase = (2 * Math.PI * (month - province.peakMonth)) / 12;
  return 1 + province.seasonAmp * Math.cos(phase) + province.seasonAmp2 * Math.cos(2 * phase);
}

function buildSeries(zone: ZoneConfig, province: ProvinceConfig, type: PropertyType) {
  const target = zone.basePricePerSqm[type];
  const growth = zone.growthPct / 100;
  const start = target / Math.exp((growth * (HISTORY_MONTHS - 1)) / 12);
  const area = TYPICAL_AREA[type];

  let noise = 0;
  const points = MONTHS.map((m, i) => {
    noise = 0.62 * noise + province.noiseSigma * gauss();
    const level = start * Math.exp((growth * i) / 12);
    const seasonal = seasonalFactor(province, m.month);
    const pricePerSqm = level * seasonal * Math.exp(noise);
    const transactions = Math.max(
      2,
      Math.round(20 * (1 + 6 * (seasonal - 1)) * (1 + 0.15 * gauss())),
    );
    return {
      month: m.key,
      pricePerSqm: roundTo(pricePerSqm, 100),
      medianPrice: roundTo(pricePerSqm * area, 10000),
      transactions,
    };
  });

  return { zoneId: zone.id, propertyType: type, points };
}

function weightedType(weights: Record<PropertyType, number>): PropertyType {
  const roll = rand();
  let acc = 0;
  for (const type of PROPERTY_TYPES) {
    acc += weights[type];
    if (roll <= acc) return type;
  }
  return "condo";
}

function buildListings(
  zonesByProvince: Map<string, ZoneConfig[]>,
  lastPricePerSqm: Map<string, number>,
) {
  const listings: Record<string, unknown>[] = [];
  let counter = 1;

  for (const province of PROVINCES) {
    const zones = zonesByProvince.get(province.id) ?? [];

    // Real markets carry more affordable stock than premium stock, so allocate
    // listings inversely to zone price instead of evenly. Without this, a
    // "งบ 5 ล้าน" search across Bangkok returns almost nothing.
    const cheapest = Math.min(...zones.map((z) => z.basePricePerSqm.condo));
    const weights = zones.map((z) => (cheapest / z.basePricePerSqm.condo) ** 0.75);
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const slots: ZoneConfig[] = [];
    zones.forEach((zone, index) => {
      const share = Math.max(3, Math.round((weights[index] / weightSum) * province.listingCount));
      for (let k = 0; k < share; k++) slots.push(zone);
    });

    for (let i = 0; i < province.listingCount; i++) {
      const zone = slots[i % slots.length];
      const type = weightedType(province.typeWeights);
      const [minArea, maxArea] = AREA_RANGE[type];
      const areaSqm = roundTo(minArea + rand() * (maxArea - minArea), 1);

      const zoneMedianPerSqm = lastPricePerSqm.get(`${zone.id}:${type}`) ?? 50000;
      const spread = Math.max(0.7, Math.min(1.45, 1 + 0.13 * gauss()));
      const pricePerSqm = roundTo(zoneMedianPerSqm * spread, 100);
      const price = roundTo(pricePerSqm * areaSqm, 10000);

      const daysOnMarket = randInt(4, 260);
      const listedDate = daysBefore(AS_OF_DATE, daysOnMarket);

      let cuts = 0;
      if (daysOnMarket > 200) cuts = rand() < 0.72 ? 2 : 1;
      else if (daysOnMarket > 120) cuts = rand() < 0.55 ? 1 : 0;
      else if (daysOnMarket > 60) cuts = rand() < 0.22 ? 1 : 0;

      // Walk backwards from the current price to the original asking price, then
      // reverse so the chain reads oldest-first: highest price -> current price.
      const chain: { fromPrice: number; toPrice: number; changePct: number }[] = [];
      let workingPrice = price;
      for (let c = 0; c < cuts; c++) {
        const cutPct = 2 + rand() * 5;
        const fromPrice = roundTo(workingPrice / (1 - cutPct / 100), 10000);
        chain.push({
          fromPrice,
          toPrice: workingPrice,
          changePct: Number((((workingPrice - fromPrice) / fromPrice) * 100).toFixed(2)),
        });
        workingPrice = fromPrice;
      }
      chain.reverse();

      const priceChanges = chain.map((step, idx) => ({
        date: daysBefore(AS_OF_DATE, Math.round((daysOnMarket * (cuts - idx)) / (cuts + 1))),
        fromPrice: step.fromPrice,
        toPrice: step.toPrice,
        changePct: step.changePct,
      }));

      const bedrooms =
        type === "condo" ? (areaSqm < 36 ? 1 : areaSqm < 62 ? 2 : 3) : areaSqm < 140 ? 3 : 4;
      const bathrooms = Math.max(1, bedrooms - 1);

      const statusRoll = rand();
      const status =
        statusRoll > 0.93 ? "sold" : statusRoll > 0.84 ? "under_offer" : "for_sale";

      const namePool = type === "condo" ? CONDO_NAMES : HOUSE_NAMES;
      const features = FEATURE_POOL[type];
      const featuresTh: string[] = [];
      while (featuresTh.length < 3) {
        const f = pick(features);
        if (!featuresTh.includes(f)) featuresTh.push(f);
      }

      const typeLabel =
        type === "condo" ? "คอนโด" : type === "townhouse" ? "ทาวน์เฮาส์" : "บ้านเดี่ยว";

      listings.push({
        id: `L${String(counter++).padStart(4, "0")}`,
        titleTh: `${typeLabel} ${pick(namePool)} ${zone.nameTh} ${bedrooms} ห้องนอน ${areaSqm} ตร.ม.`,
        provinceId: province.id,
        zoneId: zone.id,
        propertyType: type,
        status,
        price,
        areaSqm,
        pricePerSqm,
        bedrooms,
        bathrooms,
        floor: type === "condo" ? randInt(2, 32) : null,
        yearBuilt: randInt(2012, 2025),
        listedDate,
        daysOnMarket,
        // Distance to transit tracks the price premium: units priced above the
        // zone median sit closer to a station. Random distances would let a
        // pricier unit read as further from the BTS, which breaks the whole
        // "ใกล้รถไฟฟ้าเลยแพง" story the forecaster and the bot lean on.
        nearestTransitKm: zone.hasMassTransit
          ? Number(
              Math.max(
                0.12,
                Math.min(2.4, 2.3 - ((spread - 0.7) / 0.75) * 2.0 + 0.18 * gauss()),
              ).toFixed(2),
            )
          : null,
        featuresTh,
        priceChanges,
      });
    }
  }

  return listings;
}

function main() {
  const zonesByProvince = new Map<string, ZoneConfig[]>();
  for (const zone of ZONES) {
    const list = zonesByProvince.get(zone.provinceId) ?? [];
    list.push(zone);
    zonesByProvince.set(zone.provinceId, list);
  }

  const provinceById = new Map(PROVINCES.map((p) => [p.id, p]));

  const series: Record<string, unknown>[] = [];
  const lastPricePerSqm = new Map<string, number>();

  for (const zone of ZONES) {
    const province = provinceById.get(zone.provinceId);
    if (!province) throw new Error(`unknown province ${zone.provinceId}`);
    for (const type of PROPERTY_TYPES) {
      const s = buildSeries(zone, province, type);
      series.push(s);
      lastPricePerSqm.set(`${zone.id}:${type}`, s.points[s.points.length - 1].pricePerSqm);
    }
  }

  const places: Record<string, unknown>[] = [];
  let placeCounter = 1;
  for (const zone of ZONES) {
    for (const [nameTh, category, distanceKm] of zone.places) {
      places.push({
        id: `P${String(placeCounter++).padStart(4, "0")}`,
        zoneId: zone.id,
        nameTh,
        category,
        distanceKm,
        walkMinutes: Math.round(distanceKm * 12),
      });
    }
  }

  const listings = buildListings(zonesByProvince, lastPricePerSqm);

  // Hand-tuned stage prop for demos: priced 12% over the zone median, two price
  // cuts, stale on the market, 200 m from the BTS. Lives here rather than as a
  // hand edit in listings.json so a regenerate does not silently erase it.
  const demoOverride = {
    titleTh: "คอนโด เดอะ เบส อโศก–สุขุมวิท 2 ห้องนอน 46 ตร.ม.",
    provinceId: "bangkok",
    zoneId: "bkk-asoke",
    propertyType: "condo",
    status: "for_sale",
    price: 9670000,
    areaSqm: 46,
    pricePerSqm: 210200,
    bedrooms: 2,
    bathrooms: 1,
    floor: 28,
    yearBuilt: 2023,
    listedDate: "2026-04-04",
    daysOnMarket: 118,
    nearestTransitKm: 0.2,
    featuresTh: ["โคเวิร์กกิ้งสเปซ", "เครื่องปรับอากาศทุกห้อง", "ฟิตเนสชั้นดาดฟ้า"],
    priceChanges: [
      { date: "2026-05-13", fromPrice: 10900000, toPrice: 10250000, changePct: -5.96 },
      { date: "2026-06-22", fromPrice: 10250000, toPrice: 9670000, changePct: -5.66 },
    ],
  };
  const demoTarget = listings.find((l) => l.id === "L0001");
  if (!demoTarget) throw new Error("demo override target L0001 is missing");
  Object.assign(demoTarget, demoOverride);

  const provinces = PROVINCES.map((p) => ({
    id: p.id,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    region: p.region,
    marketCharacterTh: p.marketCharacterTh,
  }));

  const zones = ZONES.map((z) => ({
    id: z.id,
    provinceId: z.provinceId,
    nameTh: z.nameTh,
    nameEn: z.nameEn,
    lat: z.lat,
    lng: z.lng,
    hasMassTransit: z.hasMassTransit,
    blurbTh: z.blurbTh,
  }));

  mkdirSync(OUT_DIR, { recursive: true });

  const write = (name: string, data: unknown) => {
    writeFileSync(join(OUT_DIR, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
    console.log(`wrote ${name}`);
  };

  write("meta.json", { asOf: AS_OF, source: SOURCE, generatedFrom: "scripts/generate-data.ts" });
  write("provinces.json", provinces);
  write("zones.json", zones);
  write("places.json", places);
  write("listings.json", listings);
  write("price-history.json", series);

  console.log(
    `provinces=${provinces.length} zones=${zones.length} places=${places.length} listings=${listings.length} series=${series.length} points=${series.length * HISTORY_MONTHS}`,
  );
}

main();

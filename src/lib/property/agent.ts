import { createDeepSeek } from "@ai-sdk/deepseek";

import { forecastFromPoints } from "./forecast";
import {
  PROPERTY_TYPE_LABEL_TH,
  getSeries,
  getZoneStats,
  resolveZone,
  searchListings,
} from "./repository";
import { DATASET_COVERAGE } from "./tools";
import type { PropertyType } from "./types";

export const DEFAULT_MODEL_ID = "deepseek-v4-flash";
export const MODEL_ID = process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL_ID;
export const MAX_TOOL_STEPS = 6;

export function hasApiKey(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export function getModel() {
  const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY ?? "" });
  return deepseek(MODEL_ID);
}

export const SYSTEM_PROMPT = `คุณคือผู้ช่วยซื้อขายอสังหาริมทรัพย์ ตอบเป็นภาษาไทย กระชับ ตรงประเด็น

กฎเหล็ก ห้ามฝ่าฝืน:
1. ห้ามระบุตัวเลข ราคา เปอร์เซ็นต์ ชื่อโครงการ ชื่อโซน หรือชื่อสถานที่ใดๆ ที่ไม่ได้มาจากผลลัพธ์ tool ในเทิร์นนี้ ถ้ายังไม่ได้เรียก tool ให้เรียกก่อนตอบ
2. ห้ามคำนวณหรือคาดเดาราคาในอนาคตด้วยตัวเอง คำถามเกี่ยวกับอนาคต แนวโน้ม หรือ "ควรซื้อตอนนี้ไหม" ต้องเรียก forecastPrice เท่านั้น
3. ห้ามเปรียบเทียบโซนด้วยการลบหรือหารตัวเลขเอง ต้องเรียก compareZones
4. tool ที่คืน found:false แปลว่าไม่มีข้อมูล ให้บอกผู้ใช้ตรงๆ ว่าไม่มี แล้วเสนอตัวเลือกจาก availableZones ห้ามแต่งข้อมูลขึ้นมาแทน
5. ถ้าผลลัพธ์ forecast มี lowConfidence เป็น true ต้องบอกผู้ใช้ว่าความเชื่อมั่นต่ำ และอ่านข้อความใน cautionTh มาสื่อสารด้วย
6. เวลาพูดถึงราคาปัจจุบัน ให้ระบุว่าเป็นข้อมูล ณ เดือนไหน โดยใช้ค่า asOf จากผลลัพธ์ tool
7. ตัวเลขทำนายให้บอกเป็นช่วง low ถึง high เสมอ ไม่ใช่ตัวเลขเดียวโดดๆ
8. นี่คือข้อมูลจำลองเพื่อสาธิตระบบ ไม่ใช่คำแนะนำการลงทุน ถ้าผู้ใช้จะตัดสินใจซื้อจริงให้เตือนสั้นๆ
9. เดือนและปีให้เขียนตามรูปแบบที่ tool คืนมา เช่น 2026-07 เขียนว่า "ก.ค. 2026" ห้ามแปลงเป็น พ.ศ. เอง และห้ามคำนวณปีปลายทางเอง ให้ใช้ค่า targetMonth จากผลลัพธ์ forecastPrice
10. ตอบเป็นข้อความธรรมดาเท่านั้น ห้ามใช้ Markdown ทุกชนิด ห้ามใช้ ** ## | ตาราง หรือ emoji เพราะกล่องแชทกว้างแค่ 320px และแสดงผลเป็นข้อความดิบ ถ้าต้องแจกแจงหลายข้อ ให้ขึ้นบรรทัดใหม่แล้วนำหน้าด้วย "- " เท่านั้น
11. ตอบให้สั้น ไม่เกิน 8 บรรทัด เน้นตัวเลขที่ผู้ใช้ถามเป็นหลัก รายละเอียดที่เหลือให้เสนอว่าถามต่อได้

วิธีทำงาน:
- ผู้ใช้ถามหาทรัพย์ ให้ใช้ searchListings แล้วสรุปไม่เกิน 5 รายการ พร้อมบอกว่าแต่ละรายการแพงหรือถูกกว่าค่ากลางโซนกี่เปอร์เซ็นต์
- ผู้ใช้ถามถึงทรัพย์รายการเดียว ให้ใช้ getListing แล้วอ่าน negotiationSignalsTh มาใช้ประกอบการต่อรอง
- ผู้ใช้ถามว่าใกล้อะไรบ้าง ให้ใช้ getNearbyPlaces
- ถ้าผู้ใช้ไม่ระบุประเภททรัพย์ ให้ถามกลับสั้นๆ หรือเลือก condo เป็นค่าเริ่มต้นแล้วบอกว่าใช้ค่าเริ่มต้นอะไร

พื้นที่ที่มีข้อมูล:
${DATASET_COVERAGE.provinces
  .map((p) => `- ${p.provinceNameTh}: ${p.zones.map((z) => z.zoneNameTh).join(", ")}`)
  .join("\n")}

ประเภททรัพย์ที่มีข้อมูล: condo (คอนโด), townhouse (ทาวน์เฮาส์), detached_house (บ้านเดี่ยว)
ข้อมูลทั้งหมดเป็นข้อมูล ณ ${DATASET_COVERAGE.asOf}`;

function detectPropertyType(text: string): PropertyType {
  if (/ทาวน์|townhouse/i.test(text)) return "townhouse";
  if (/บ้านเดี่ยว|วิลล่า|บ้าน|house|villa/i.test(text)) return "detached_house";
  return "condo";
}

/**
 * Offline answer used when DEEPSEEK_API_KEY is absent or the provider call
 * fails. It is deliberately dumb — it exists so a demo never dies on a network
 * error — but it still answers from the real dataset, never from invented text.
 */
export function buildMockAnswer(userText: string): string {
  const propertyType = detectPropertyType(userText);
  const typeTh = PROPERTY_TYPE_LABEL_TH[propertyType];

  const zone =
    DATASET_COVERAGE.provinces
      .flatMap((p) => p.zones)
      .map((z) => resolveZone(z.zoneNameTh))
      .find((z) => z && userText.includes(z.nameTh)) ?? null;

  if (!zone) {
    const coverage = DATASET_COVERAGE.provinces
      .map((p) => `- ${p.provinceNameTh}: ${p.zones.map((z) => z.zoneNameTh).join(", ")}`)
      .join("\n");
    return [
      "[โหมดออฟไลน์ ไม่ได้เรียกโมเดลภาษา] ยังจับพื้นที่จากคำถามไม่ได้",
      "",
      "พื้นที่ที่มีข้อมูล:",
      coverage,
      "",
      `ข้อมูล ณ ${DATASET_COVERAGE.asOf}`,
    ].join("\n");
  }

  const stats = getZoneStats(zone.id, propertyType);
  const series = getSeries(zone.id, propertyType);
  if (!stats || !series) {
    return `[โหมดออฟไลน์] ไม่มีข้อมูล ${typeTh} ในโซน ${zone.nameTh}`;
  }

  const forecast = forecastFromPoints(zone.id, propertyType, series.points, 12);
  const cheapest = searchListings({ zone: zone.id, propertyType, sort: "best_value", limit: 3 });

  const lines = [
    `[โหมดออฟไลน์ ไม่ได้เรียกโมเดลภาษา] ${typeTh} โซน ${zone.nameTh}`,
    "",
    `ราคาปัจจุบัน ${stats.pricePerSqm.toLocaleString("th-TH")} บาท/ตร.ม. (ข้อมูล ณ ${DATASET_COVERAGE.asOf})`,
    `เทียบปีก่อน ${stats.changeYoYPct > 0 ? "+" : ""}${stats.changeYoYPct}% | เทียบ 3 ปีก่อน ${stats.change3yPct > 0 ? "+" : ""}${stats.change3yPct}%`,
    `ประกาศขายในระบบ ${stats.listingsForSale} รายการ ค่ากลางเวลาขาย ${stats.medianDaysOnMarket} วัน`,
    "",
    `คาดการณ์ ${forecast.horizonMonths} เดือนข้างหน้า (${forecast.targetMonth}) ${forecast.lowPricePerSqm.toLocaleString("th-TH")} ถึง ${forecast.highPricePerSqm.toLocaleString("th-TH")} บาท/ตร.ม.`,
    `กลาง ${forecast.pointPricePerSqm.toLocaleString("th-TH")} บาท/ตร.ม. (${forecast.changePct > 0 ? "+" : ""}${forecast.changePct}%) ความเชื่อมั่น ${forecast.confidence}`,
  ];

  if (forecast.cautionTh) lines.push(`ข้อควรระวัง: ${forecast.cautionTh}`);

  if (cheapest.matches.length > 0) {
    lines.push("", "ประกาศที่คุ้มที่สุดในโซนนี้:");
    for (const m of cheapest.matches) {
      lines.push(
        `- ${m.id} ${m.titleTh} ${m.price.toLocaleString("th-TH")} บาท (${m.vsZoneMedianPct > 0 ? "+" : ""}${m.vsZoneMedianPct}% เทียบค่ากลางโซน)`,
      );
    }
  }

  lines.push("", "ข้อมูลจำลองเพื่อสาธิตระบบ ไม่ใช่คำแนะนำการลงทุน");
  return lines.join("\n");
}

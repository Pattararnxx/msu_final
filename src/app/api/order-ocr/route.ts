import {
  orderExtractionJsonSchema,
  orderExtractionSchema,
  type OrderOcrBatchPayload,
  type OrderOcrPayload,
} from "@/lib/order-ocr/schema";
import { ORDER_TYPE_VALUES, type OrderType } from "@/lib/expense/types";
import { MOCK_MENU_ITEMS } from "@/lib/menu/mock-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_BATCH_FILES = 10;
const MAX_CONCURRENT_OCR = 3;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const TYPHOON_API_URL = "https://api.opentyphoon.ai/v1/chat/completions";

const OCR_INSTRUCTIONS = `คุณเป็นระบบ OCR ใบออร์เดอร์อาหารภาษาไทย รวมถึงลายมือภาษาไทย
อ่านข้อความตามลำดับในภาพเป็น Markdown โดยเก็บเลขออร์เดอร์ ชื่อผู้สั่ง รายการอาหาร
topping และจำนวนของ topping จำนวนอาหาร วันเวลา ประเภทออเดอร์ ราคาต่อหน่วย ราคารวม และหมายเหตุ
ห้ามเดา สร้าง หรือคำนวณข้อมูลที่ไม่เห็นในภาพ ถ้าอ่านไม่ชัดให้คงข้อความเท่าที่เห็น
ตอบเฉพาะ Markdown ที่ OCR อ่านได้เท่านั้น`;

const NORMALIZER_INSTRUCTIONS = `แปลงข้อความ OCR ใบออร์เดอร์ร้านอาหารเป็น JSON ตาม schema เท่านั้น
ใช้ข้อความ OCR เป็นแหล่งข้อมูลเดียว ห้ามเดาหรือเติมข้อมูล
- orderNumber คือเลขออร์เดอร์ที่เห็นจริงเท่านั้น ถ้าไม่เห็นให้ null
- ไม่มี receiptNumber และไม่มีข้อมูลรายจ่าย/ใบเสร็จในระบบนี้
- orderedAt ต้องเป็น YYYY-MM-DDTHH:mm:ss; แปลง พ.ศ. เป็น ค.ศ. ได้เมื่อเห็นวันชัดเจน
- items เก็บอาหารทุกบรรทัด; toppings ต้องอยู่ใน item เจ้าของ และ quantity ของ topping แยกจากอาหาร
- "ไม่ผัก" หรือ "ไม่ใส่ผัก" เป็นคำสั่งพิเศษของเมนู ให้ใส่ใน items[].notes ไม่ใช่ topping
- ราคาในภาพเป็นหลักฐาน OCR เท่านั้น ระบบจะจับคู่ชื่อกับเมนูและคำนวณราคาจากแค็ตตาล็อกร้านภายหลัง
- orderType ใช้ dine_in, takeaway, delivery หรือ unknown
- ถ้าข้อมูลสำคัญหายหรือไม่ชัด ให้ needsReview=true พร้อมเหตุผล
- ตอบ JSON object เดียว ไม่มี markdown หรือคำอธิบาย`;

type TyphoonContent =
  | string
  | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
type TyphoonMessage = { role: "system" | "user"; content: TyphoonContent };
type TyphoonResponse = {
  choices?: Array<{ message?: { content?: string | Array<{ text?: string }> | null } }>;
};

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

function getText(response: TyphoonResponse): string {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  return Array.isArray(content) ? content.map((part) => part.text ?? "").join("").trim() : "";
}

async function callTyphoon(
  apiKey: string,
  model: string,
  messages: TyphoonMessage[],
  maxTokens: number,
  timeoutMs: number,
) {
  const upstream = await fetch(TYPHOON_API_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.1,
      top_p: 0.6,
      stream: false,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const detail = await upstream.text();
  let response: TyphoonResponse = {};
  try {
    response = JSON.parse(detail) as TyphoonResponse;
  } catch {
    // Keep a malformed upstream body out of the client response.
  }
  if (!upstream.ok) {
    console.error("Typhoon order OCR upstream error", upstream.status, detail.slice(0, 500));
    throw new Error(`Typhoon upstream returned ${upstream.status}`);
  }
  const text = getText(response);
  if (!text) throw new Error("Typhoon returned an empty response");
  return text;
}

function parseJsonObject(raw: string): unknown {
  const cleaned = raw.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Typhoon normalizer did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function unwrapOcrText(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { natural_text?: unknown };
    if (typeof parsed.natural_text === "string" && parsed.natural_text.trim()) {
      return parsed.natural_text.trim();
    }
  } catch {
    // OCR also legitimately returns Markdown directly.
  }
  const fenced = raw.trim().match(/\`\`\`(?:markdown|md|text)?\s*([\s\S]*?)\`\`\`/i);
  return fenced?.[1]?.trim() || raw.trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function nullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeDateTime(value: unknown): string | null {
  const text = nullableText(value);
  if (!text) return null;
  const match = text.match(/^(\d{4})[-/]?(\d{1,2})[-/]?(\d{1,2})(?:[T\s](\d{1,2})(?::(\d{1,2}))?)?/);
  if (!match) return null;
  const year = Number(match[1]) >= 2400 ? Number(match[1]) - 543 : Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) return null;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}T${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:00`;
}

function dateTimeFromFileMetadata(value: FormDataEntryValue | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  // The browser sends the file's local timestamp as ISO text. Preserve the
  // visible clock fields rather than converting them in the server timezone.
  const localDateTime = normalizeDateTime(text);
  if (localDateTime) return localDateTime;
  const timestamp = /^\d+$/.test(text) ? Number(text) : Date.parse(text);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 19);
}

function generatedOrderNumber(orderedAt: string | null) {
  const stamp = (orderedAt ?? new Date().toISOString()).slice(0, 10).replaceAll("-", "");
  return `ORD-${stamp}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function orderType(value: unknown): OrderType {
  const text = nullableText(value)?.toLowerCase() ?? "";
  if (text === "dine_in" || text.includes("ทานที่ร้าน") || text.includes("ที่ร้าน")) return "dine_in";
  if (text === "takeaway" || text.includes("รับกลับ") || text.includes("กลับบ้าน")) return "takeaway";
  if (text === "delivery" || text.includes("เดลิเวอรี่") || text.includes("ส่ง")) return "delivery";
  return ORDER_TYPE_VALUES.includes(text as OrderType) ? (text as OrderType) : "unknown";
}

function confidence(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

function comparableName(value: string) {
  return value.toLocaleLowerCase("th-TH").replace(/[\s()+/._-]/g, "");
}

function configuredMenu(name: string, id: string | null) {
  const byId = id ? MOCK_MENU_ITEMS.find((item) => item.id === id) : undefined;
  if (byId) return byId;
  const comparable = comparableName(name);
  if (!comparable) return undefined;
  return MOCK_MENU_ITEMS.find((item) => {
    const candidate = comparableName(item.name);
    return candidate === comparable || candidate.includes(comparable) || comparable.includes(candidate);
  });
}

function configuredToppingPrice(menuItemId: string, toppingName: string): number | null {
  const menu = MOCK_MENU_ITEMS.find((item) => item.id === menuItemId);
  if (!menu) return null;
  const comparable = comparableName(toppingName);
  if (!comparable) return null;
  const choice = menu.optionGroups
    .flatMap((group) => group.choices)
    .find((item) => {
      const candidate = comparableName(item.label);
      return candidate === comparable || candidate.includes(comparable) || comparable.includes(candidate);
    });
  return choice?.priceDelta ?? null;
}

function splitInlineItemNote(menuItemName: string, notes: string) {
  const match = menuItemName.match(/^(.*?)(?:\s+)(ไม่(?:ใส่)?ผัก)$/);
  if (!match) return { menuItemName, notes };
  return {
    menuItemName: match[1].trim(),
    notes: [notes, match[2]].filter(Boolean).join(" • "),
  };
}

function isMenuInstruction(name: string) {
  return /^ไม่(?:ใส่)?ผัก$/.test(name.trim());
}

function normalizeExtraction(value: unknown, metadataDateTime: string | null) {
  const source = asRecord(value);
  const reasons = Array.isArray(source.reviewReasons)
    ? source.reviewReasons.filter((reason): reason is string => typeof reason === "string" && reason.trim() !== "")
    : [];
  const items = (Array.isArray(source.items) ? source.items : []).map((rawItem, itemIndex) => {
    const item = asRecord(rawItem);
    const readMenuItemName = nullableText(item.menuItemName) ?? "";
    const itemNotes = nullableText(item.notes) ?? "";
    const inlineItem = splitInlineItemNote(readMenuItemName, itemNotes);
    const quantity = nullableNumber(item.quantity) ?? 0;
    const rawMenuItemId = nullableText(item.menuItemId);
    const matchedMenu = configuredMenu(inlineItem.menuItemName, rawMenuItemId);
    const parsedToppings = (Array.isArray(item.toppings) ? item.toppings : []).map((rawTopping, toppingIndex) => {
      const topping = asRecord(rawTopping);
      const name = nullableText(topping.name) ?? "";
      const quantity = nullableNumber(topping.quantity) ?? 0;
      const configuredPrice = matchedMenu ? configuredToppingPrice(matchedMenu.id, name) : null;
      return {
        id: nullableText(topping.id) ?? `topping-${itemIndex + 1}-${toppingIndex + 1}`,
        name,
        quantity,
        unit: nullableText(topping.unit) ?? "รายการ",
        unitPrice: configuredPrice,
        totalPrice: configuredPrice === null ? null : configuredPrice * quantity,
        confidence: confidence(topping.confidence),
        needsReview: topping.needsReview === true || !name || quantity <= 0 || configuredPrice === null,
        humanReviewed: false,
        rawText: [name, nullableText(topping.unitPrice), nullableText(topping.totalPrice)].filter(Boolean).join(" "),
      };
    });
    const menuInstructions = parsedToppings
      .filter((topping) => isMenuInstruction(topping.name))
      .map((topping) => topping.name.trim());
    const toppings = parsedToppings.filter((topping) => !isMenuInstruction(topping.name));
    const menuItemName = matchedMenu?.name ?? inlineItem.menuItemName;
    const notes = [...new Set([inlineItem.notes, ...menuInstructions].filter(Boolean))].join(" • ");
    const ocrUnitPrice = nullableNumber(item.unitPrice);
    const ocrTotalPrice = nullableNumber(item.totalPrice);
    const unitPrice = matchedMenu?.price ?? null;
    const toppingTotal = toppings.reduce((sum, topping) => sum + (topping.totalPrice ?? 0), 0);
    const totalPrice = unitPrice === null || quantity <= 0 ? null : unitPrice * quantity + toppingTotal;
    const needsReview =
      item.needsReview === true ||
      !matchedMenu ||
      quantity <= 0 ||
      unitPrice === null ||
      totalPrice === null;
    if (!matchedMenu) reasons.push(`รายการที่ ${itemIndex + 1} จับคู่กับเมนูของร้านไม่ได้`);
    if (quantity <= 0) reasons.push(`รายการที่ ${itemIndex + 1} ไม่พบจำนวน`);
    if (unitPrice === null || totalPrice === null) reasons.push(`รายการที่ ${itemIndex + 1} ยังคิดราคาจากเมนูร้านไม่ได้`);
    return {
      lineId: nullableText(item.lineId) ?? `line-${itemIndex + 1}`,
      menuItemId: matchedMenu?.id ?? null,
      menuItemName,
      quantity,
      unit: nullableText(item.unit) ?? "ที่",
      toppings,
      unitPrice,
      totalPrice,
      notes,
      confidence: confidence(item.confidence),
      needsReview,
      humanReviewed: false,
      rawText: [readMenuItemName, nullableText(item.quantity), itemNotes].filter(Boolean).join(" "),
      ocrUnitPrice,
      ocrTotalPrice,
    };
  });

  const extractedOrderNumber = nullableText(source.orderNumber);
  const imageDateTime = normalizeDateTime(source.orderedAt);
  const orderedAt = imageDateTime ?? metadataDateTime;
  const totalAmount = items.length > 0 && items.every((item) => item.totalPrice !== null)
    ? items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0)
    : null;
  if (imageDateTime === null && metadataDateTime !== null) {
    reasons.push("ใช้วันที่เวลาอ้างอิงจาก metadata ของไฟล์ โปรดตรวจสอบ");
  }
  if (!orderedAt) reasons.push("ไม่พบวันที่เวลาที่อ่านได้ชัดเจน");
  if (items.length === 0) reasons.push("ไม่พบรายการอาหาร");
  if (totalAmount === null) reasons.push("ยังคำนวณยอดจากราคาเมนูของร้านไม่ได้");

  const detectedOrderType = orderType(source.orderType);
  const orderTypeFromRawText =
    detectedOrderType === "unknown" ? orderType(source.rawText) : detectedOrderType;
  const overallConfidence = confidence(source.confidence);
  return {
    orderNumber: extractedOrderNumber ?? generatedOrderNumber(orderedAt),
    orderNumberSource: extractedOrderNumber ? "image" : "generated",
    customerName: nullableText(source.customerName),
    orderedAt,
    orderedAtSource: imageDateTime ? "image" : metadataDateTime ? "file_metadata" : "missing",
    orderType: orderTypeFromRawText,
    items,
    notes: nullableText(source.notes),
    subtotal: nullableNumber(source.subtotal),
    tax: nullableNumber(source.tax),
    discount: nullableNumber(source.discount),
    totalAmount,
    confidence: overallConfidence,
    needsReview: source.needsReview === true || reasons.length > 0 || overallConfidence < 0.7,
    reviewReasons: Array.from(new Set(reasons)),
    rawText: nullableText(source.rawText) ?? "",
  };
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) return "รองรับเฉพาะไฟล์ JPG หรือ PNG";
  if (file.size > MAX_FILE_BYTES) return "ไฟล์ต้องมีขนาดไม่เกิน 10 MB";
  return null;
}

function filenameSeed(filename: string) {
  return Array.from(filename.toLocaleLowerCase("th-TH")).reduce(
    (hash, char) => Math.imul(hash ^ (char.codePointAt(0) ?? 0), 16777619) >>> 0,
    2166136261,
  );
}

function mockOrder(file: File, metadataDateTime: string | null): OrderOcrPayload {
  const seed = filenameSeed(file.name);
  const handwritten = /hand|write|ลายมือ|unclear|low/i.test(file.name);
  const variant = seed % 3;
  const orderedAt = metadataDateTime ?? `2026-08-13T0${6 + variant}:${String(12 + variant * 11).padStart(2, "0")}:00`;
  const sampleItems = handwritten
    ? [
        {
          lineId: "line-1",
          menuItemId: null,
          menuItemName: "โจ๊กหมู",
          quantity: 2,
          unit: "ที่",
          toppings: [{
            id: "line-1-topping-1",
            name: "เพิ่มไข่ลวก",
            quantity: 1,
            unit: "ฟอง",
            unitPrice: null,
            totalPrice: null,
            confidence: 0.64,
            needsReview: true,
            humanReviewed: false,
          }],
          unitPrice: 35,
          totalPrice: 80,
          notes: "ไม่ผัก",
          confidence: 0.62,
          needsReview: true,
          humanReviewed: false,
          rawText: "โจ๊กหมู 2 + ไข่? ไม่ผัก",
        },
      ]
    : [
        {
          lineId: "line-1",
          menuItemId: variant === 1 ? "menu-008" : "menu-001",
          menuItemName: variant === 1 ? "ก๋วยจั๊บน้ำข้น หมูกรอบ" : "ข้าวต้มหมูสับ",
          quantity: variant === 2 ? 2 : 1,
          unit: "ที่",
          toppings: variant === 0 ? [{
            id: "line-1-topping-1",
            name: "เพิ่มไข่ลวก",
            quantity: 1,
            unit: "ฟอง",
            unitPrice: 10,
            totalPrice: 10,
            confidence: 0.94,
            needsReview: false,
            humanReviewed: false,
          }] : [],
          unitPrice: variant === 1 ? 50 : 40,
          totalPrice: variant === 1 ? 50 : (variant === 2 ? 80 : 50),
          notes: variant === 2 ? "ไม่ใส่ผงชูรส" : "",
          confidence: 0.94,
          needsReview: false,
          humanReviewed: false,
          rawText: variant === 1 ? "ก๋วยจั๊บน้ำข้นหมูกรอบ 1" : "ข้าวต้มหมูสับ",
        },
      ];
  const normalized = normalizeExtraction({
    orderNumber: `MOCK-${String(seed % 10_000).padStart(4, "0")}`,
    customerName: ["คุณอรุณ", "คุณเมย์", "โต๊ะ 4"][variant],
    orderedAt,
    orderType: variant === 1 ? "takeaway" : "dine_in",
    items: sampleItems,
    notes: handwritten ? "ตัวอย่างใบสั่งลายมือ ต้องให้พนักงานตรวจ" : "ตัวอย่าง OCR สำหรับ prototype",
    confidence: handwritten ? 0.62 : 0.94,
    needsReview: handwritten,
    reviewReasons: handwritten ? ["ลายมือบริเวณจำนวนไข่ไม่ชัดเจน"] : [],
    rawText: sampleItems.map((item) => item.rawText).join("\n"),
  }, metadataDateTime);
  const extraction = orderExtractionSchema.parse(normalized);

  return {
    schema_version: "restaurant.order.v2",
    event: "restaurant.order.extracted",
    payload_id: `mock-${seed.toString(16)}`,
    captured_at: orderedAt,
    source: {
      type: "order_ocr",
      provider: "mock",
      model: handwritten ? "deterministic-handwritten-review" : "deterministic-typed-order",
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    },
    extraction,
  };
}

async function extractOrder(
  file: File,
  metadataDateTime: string | null,
  apiKey: string,
  ocrModel: string,
  normalizerModel: string,
): Promise<OrderOcrPayload> {
  const imageBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const ocrRaw = await callTyphoon(
    apiKey,
    ocrModel,
    [{
      role: "user",
      content: [
        { type: "text", text: OCR_INSTRUCTIONS },
        { type: "image_url", image_url: { url: `data:${file.type};base64,${imageBase64}` } },
      ],
    }],
    16_000,
    35_000,
  );
  const ocrText = unwrapOcrText(ocrRaw);
  if (!ocrText) throw new Error("Typhoon OCR returned no readable text");
  const normalizedRaw = await callTyphoon(
    apiKey,
    normalizerModel,
    [
      { role: "system", content: NORMALIZER_INSTRUCTIONS },
      {
        role: "user",
        content: `SCHEMA:\n${JSON.stringify(orderExtractionJsonSchema)}\n\nOCR_MARKDOWN_START\n${ocrText}\nOCR_MARKDOWN_END`,
      },
    ],
    4_000,
    20_000,
  );
  const extraction = orderExtractionSchema.safeParse(
    normalizeExtraction(parseJsonObject(normalizedRaw), metadataDateTime),
  );
  if (!extraction.success) {
    console.error("Typhoon order OCR schema validation error", extraction.error.issues);
    throw new Error("ผล OCR ไม่ตรงกับรูปแบบใบออร์เดอร์ที่ระบบรองรับ");
  }
  return {
    schema_version: "restaurant.order.v2",
    event: "restaurant.order.extracted",
    payload_id: crypto.randomUUID(),
    captured_at: new Date().toISOString(),
    source: {
      type: "order_ocr",
      provider: "opentyphoon",
      model: `${ocrModel} + ${normalizerModel}`,
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    },
    extraction: extraction.data,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(MAX_CONCURRENT_OCR, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function clientError(error: unknown) {
  if (error instanceof Error && error.name === "TimeoutError") {
    return "Typhoon ใช้เวลาประมวลผลนานเกินไป กรุณาลองภาพที่คมชัดขึ้นอีกครั้ง";
  }
  return "เกิดข้อผิดพลาดระหว่าง OCR กรุณาลองใหม่อีกครั้ง";
}

export async function POST(request: Request) {
  const apiKey = process.env.TYPHOON_OCR_API_KEY?.trim();
  const formData = await request.formData().catch(() => null);
  const multipleFiles = formData?.getAll("files") ?? [];
  const rawFiles = multipleFiles.length > 0 ? multipleFiles : formData?.getAll("file") ?? [];
  const files = rawFiles.filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) return errorResponse("ต้องแนบไฟล์ภาพใน field ชื่อ file หรือ files", 400);
  if (files.length > MAX_BATCH_FILES) {
    return errorResponse(`สแกนได้สูงสุด ${MAX_BATCH_FILES} ภาพต่อครั้ง`, 413);
  }

  const ocrModel = process.env.TYPHOON_OCR_MODEL?.trim() || "typhoon-ocr";
  const normalizerModel =
    process.env.TYPHOON_NORMALIZER_MODEL?.trim() || "typhoon-v2.5-30b-a3b-instruct";
  const metadataValues = formData?.getAll("fileLastModified") ?? [];
  const requestedMock = formData?.get("mode") === "mock";

  if (!apiKey || requestedMock) {
    if (files.length === 1) {
      const fileError = validateFile(files[0]);
      if (fileError) return errorResponse(fileError, fileError.includes("ขนาด") ? 413 : 415);
      return Response.json(mockOrder(files[0], dateTimeFromFileMetadata(metadataValues[0])));
    }
    const results = files.map((file, index) => {
      const fileError = validateFile(file);
      return fileError
        ? { index, filename: file.name, error: fileError }
        : { index, filename: file.name, payload: mockOrder(file, dateTimeFromFileMetadata(metadataValues[index])) };
    });
    const payload: OrderOcrBatchPayload = {
      schema_version: "restaurant.order.batch.v1",
      event: "restaurant.order.batch.extracted",
      batch_id: `mock-batch-${files.map((file) => filenameSeed(file.name)).join("-")}`,
      captured_at: results.find((result) => result.payload)?.payload?.captured_at ?? "2026-08-13T07:00:00",
      results,
    };
    return Response.json(payload);
  }

  if (files.length === 1) {
    const fileError = validateFile(files[0]);
    if (fileError) return errorResponse(fileError, fileError.includes("ขนาด") ? 413 : 415);
    try {
      const payload = await extractOrder(
        files[0],
        dateTimeFromFileMetadata(metadataValues[0]),
        apiKey,
        ocrModel,
        normalizerModel,
      );
      return Response.json(payload);
    } catch (error) {
      console.error("Typhoon order OCR request failed", error);
      return errorResponse(clientError(error), error instanceof Error && error.name === "TimeoutError" ? 504 : 500);
    }
  }

  const results = await mapWithConcurrency(files, async (file, index) => {
    const fileError = validateFile(file);
    if (fileError) return { index, filename: file.name, error: fileError };
    try {
      return {
        index,
        filename: file.name,
        payload: await extractOrder(
          file,
          dateTimeFromFileMetadata(metadataValues[index]),
          apiKey,
          ocrModel,
          normalizerModel,
        ),
      };
    } catch (error) {
      console.error("Typhoon batch order OCR item failed", file.name, error);
      return { index, filename: file.name, error: clientError(error) };
    }
  });

  const payload: OrderOcrBatchPayload = {
    schema_version: "restaurant.order.batch.v1",
    event: "restaurant.order.batch.extracted",
    batch_id: crypto.randomUUID(),
    captured_at: new Date().toISOString(),
    results,
  };
  return Response.json(payload);
}

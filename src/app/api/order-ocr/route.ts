import {
  extractionResultSchema,
  orderExtractionJsonSchema,
  type OrderPayload,
} from "@/lib/order-ocr/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const TYPHOON_API_URL = "https://api.opentyphoon.ai/v1/chat/completions";
const OCR_MODEL = process.env.TYPHOON_OCR_MODEL?.trim() || "typhoon-ocr";
const NORMALIZER_MODEL =
  process.env.TYPHOON_NORMALIZER_MODEL?.trim() || "typhoon-v2.5-30b-a3b-instruct";

const OCR_INSTRUCTIONS = `คุณเป็นระบบ OCR ใบออร์เดอร์อาหารลายมือสำหรับร้านอาหาร
อ่านภาพที่แนบมาและถอดข้อความทั้งหมดเป็น Markdown ที่สะอาดตามลำดับที่เห็น

กติกาสำคัญ:
- รักษาภาษาไทย อังกฤษ ตัวเลข เครื่องหมาย และการขึ้นบรรทัดตามที่เห็นให้มากที่สุด
- ห้ามเดาหรือเติมข้อความที่อ่านไม่ออก และอย่าตีความราคา จำนวน หรือเมนูที่ไม่มีในภาพ
- อย่าอ่านลายเส้น/รอยขีดฆ่าเป็นรายการใหม่
- ถ้าเป็นภาพที่ไม่ใช่เอกสาร ให้คืนข้อความสั้น ๆ ที่บอกว่าไม่พบเอกสาร
- ตอบเฉพาะ Markdown ของข้อความที่อ่านได้ ห้ามใส่คำอธิบายเกี่ยวกับขั้นตอน OCR`;

const NORMALIZER_INSTRUCTIONS = `คุณเป็นระบบแปลงข้อความ OCR ใบออร์เดอร์อาหารเป็นข้อมูล JSON
ใช้ข้อความ OCR ที่ให้มาเป็นแหล่งข้อมูลเดียว ห้ามเดาเมนู ราคา จำนวน หรือรายละเอียดที่ไม่มีหลักฐาน

กติกาสำคัญ:
- คืน JSON object เดียวตาม schema ที่กำหนด ห้ามใส่ markdown หรือคำอธิบายรอบ JSON
- อ่านภาษาไทย อังกฤษ ตัวเลข และคำสั่งพิเศษจาก OCR โดยรักษา raw_text ของแต่ละรายการ
- ถ้าอ่านไม่ชัดให้ใช้ null หรือ [] ตาม schema และเพิ่มเหตุผลใน quality.review_reasons
- quantity ต้องเป็นจำนวนเต็มอย่างน้อย 1; ถ้าไม่เห็นจำนวนให้ใช้ 1 และตั้ง needs_review เป็น true
- แยกคำสั่งพิเศษ เช่น ไม่เผ็ด หวานน้อย เพิ่มไข่ ลงใน modifiers หรือ notes
- ราคาเป็นตัวเลขเงินบาท ไม่ใส่สัญลักษณ์ ฿ และห้ามคำนวณราคาที่ไม่มีในข้อความ
- ห้ามนับรายการที่ถูกขีดฆ่าหรือเป็นเพียงรอยแก้ไข
- human_reviewed ต้องเป็น false เสมอ เพราะยังไม่มีพนักงานตรวจผล
- confidence และ overall_confidence เป็นค่าประเมินความชัดเจนของข้อความ ไม่ใช่การยืนยันความถูกต้อง
- ถ้าเป็นใบออร์เดอร์เปล่าหรือภาพไม่ใช่ใบออร์เดอร์ ให้คืน items เป็น [] และอธิบายใน review_reasons`;

type TyphoonMessage = {
  role: "system" | "user";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

type TyphoonResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }> | null;
    };
  }>;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function getText(response: TyphoonResponse): string {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => part.text || "")
    .join("")
    .trim();
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
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
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
  let response: TyphoonResponse;
  try {
    response = JSON.parse(detail) as TyphoonResponse;
  } catch {
    response = {};
  }

  if (!upstream.ok) {
    console.error("Typhoon upstream error", upstream.status, detail.slice(0, 500));
    throw new Error(`Typhoon upstream returned ${upstream.status}`);
  }

  const text = getText(response);
  if (!text) throw new Error("Typhoon returned an empty response");
  return text;
}

function unwrapOcrText(raw: string): string {
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed) as { natural_text?: unknown };
    if (typeof parsed.natural_text === "string" && parsed.natural_text.trim()) {
      return parsed.natural_text.trim();
    }
  } catch {
    // The hosted endpoint may return plain Markdown instead of the helper JSON.
  }

  const fenced = trimmed.match(/```(?:markdown|md|text)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() || trimmed;
}

function parseJsonObject(raw: string): unknown {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Typhoon normalizer did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(request: Request) {
  const apiKey = process.env.TYPHOON_OCR_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse("ยังไม่ได้ตั้งค่า TYPHOON_OCR_API_KEY บนเซิร์ฟเวอร์", 503);
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return errorResponse("ต้องแนบไฟล์ภาพใน field ชื่อ file", 400);
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return errorResponse("รองรับเฉพาะไฟล์ JPG หรือ PNG", 415);
  }
  if (file.size > MAX_FILE_BYTES) {
    return errorResponse("ไฟล์ต้องมีขนาดไม่เกิน 10 MB", 413);
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const imageBase64 = bytes.toString("base64");
    const ocrRaw = await callTyphoon(
      apiKey,
      OCR_MODEL,
      [
        {
          role: "user",
          content: [
            { type: "text", text: OCR_INSTRUCTIONS },
            {
              type: "image_url",
              image_url: { url: `data:${file.type};base64,${imageBase64}` },
            },
          ],
        },
      ],
      16_000,
      35_000,
    );
    const ocrText = unwrapOcrText(ocrRaw);
    if (!ocrText) throw new Error("Typhoon OCR returned no readable text");

    const normalizedRaw = await callTyphoon(
      apiKey,
      NORMALIZER_MODEL,
      [
        { role: "system", content: NORMALIZER_INSTRUCTIONS },
        {
          role: "user",
          content: `แปลง OCR Markdown ด้านล่างเป็น JSON ตาม schema นี้เท่านั้น

SCHEMA:
${JSON.stringify(orderExtractionJsonSchema)}

OCR_MARKDOWN_START
${ocrText}
OCR_MARKDOWN_END`,
        },
      ],
      3_000,
      20_000,
    );

    const parsed = parseJsonObject(normalizedRaw);
    const extraction = extractionResultSchema.safeParse(parsed);
    if (!extraction.success) {
      console.error("Typhoon OCR schema validation error", extraction.error.issues);
      return errorResponse("ผล OCR ไม่ตรงกับรูปแบบข้อมูลที่ระบบรองรับ", 502);
    }

    const payload: OrderPayload = {
      schema_version: "restaurant.order.v1",
      event: "restaurant.order.extracted",
      payload_id: crypto.randomUUID(),
      captured_at: new Date().toISOString(),
      source: {
        type: "handwritten_order_ocr",
        provider: "opentyphoon",
        model: `${OCR_MODEL} + ${NORMALIZER_MODEL}`,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      },
      ...extraction.data,
    };

    return Response.json(payload);
  } catch (error) {
    console.error("Typhoon order OCR request failed", error);
    if (error instanceof Error && error.name === "TimeoutError") {
      return errorResponse("Typhoon ใช้เวลาประมวลผลนานเกินไป กรุณาลองภาพที่คมชัดขึ้นอีกครั้ง", 504);
    }
    return errorResponse("เกิดข้อผิดพลาดระหว่าง OCR กรุณาลองใหม่อีกครั้ง", 500);
  }
}

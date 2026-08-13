import {
  extractionResultSchema,
  geminiExtractionSchema,
  type OrderPayload,
} from "@/lib/order-ocr/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const GEMINI_MODEL = process.env.GEMINI_OCR_MODEL?.trim() || "gemini-2.5-flash";

const OCR_INSTRUCTIONS = `คุณเป็นระบบ OCR ใบออร์เดอร์อาหารลายมือสำหรับร้านอาหาร
อ่านภาพที่แนบมาอย่างระมัดระวังและแปลงเป็น JSON ตาม schema ที่กำหนดเท่านั้น

กติกาสำคัญ:
- อ่านภาษาไทย อังกฤษ ตัวเลข และเครื่องหมายจากลายมือ โดยรักษา raw_text ตามที่เห็น
- ห้ามเดาเมนู ราคา จำนวน หรือ modifier ที่อ่านไม่ออก ให้ใช้ค่าว่าง/nullable ที่ schema อนุญาต
- ถ้าไม่แน่ใจในรายการใด ให้ confidence ต่ำกว่า 0.7 และ needs_review เป็น true
- human_reviewed ต้องเป็น false เสมอ เพราะยังไม่มีพนักงานตรวจผลในขั้นตอน OCR
- quantity ต้องเป็นจำนวนเต็มอย่างน้อย 1; ถ้าไม่เห็นจำนวนให้ใช้ 1 และใส่เหตุผลใน quality.review_reasons
- แยกคำสั่งพิเศษ เช่น ไม่เผ็ด หวานน้อย เพิ่มไข่ ลงใน modifiers หรือ notes
- ราคาเป็นตัวเลขเงินบาท ไม่ใส่สัญลักษณ์ ฿ และไม่คำนวณราคาที่ไม่มีในภาพ
- อย่าอ่านลายเส้น/รอยขีดฆ่าเป็นรายการใหม่ และอย่ารวมยอดจากการคาดเดา
- ถ้าเป็นใบออร์เดอร์เปล่าหรือภาพไม่ใช่ใบออร์เดอร์ ให้คืน items เป็น [] และอธิบายใน review_reasons
- ตอบ JSON object เดียวตาม schema ห้ามใส่ markdown หรือคำอธิบายรอบ JSON`;

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function getText(response: unknown): string {
  const data = response as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim() || "";
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse("ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์", 503);
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return errorResponse("ต้องแนบไฟล์ภาพใน field ชื่อ file", 400);
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return errorResponse("รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP", 415);
  }
  if (file.size > MAX_FILE_BYTES) {
    return errorResponse("ไฟล์ต้องมีขนาดไม่เกิน 10 MB", 413);
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const imageBase64 = bytes.toString("base64");
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: OCR_INSTRUCTIONS }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: "อ่านข้อความในใบออร์เดอร์นี้และคืนผลตาม schema" },
                { inline_data: { mime_type: file.type, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: geminiExtractionSchema,
          },
        }),
        signal: AbortSignal.timeout(55_000),
      },
    );

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("Gemini OCR error", upstream.status, detail.slice(0, 500));
      return errorResponse("บริการ OCR ไม่สามารถประมวลผลภาพนี้ได้ กรุณาลองใหม่", 502);
    }

    const parsed = JSON.parse(getText(await upstream.json()));
    const extraction = extractionResultSchema.safeParse(parsed);
    if (!extraction.success) {
      console.error("Gemini OCR schema validation error", extraction.error.issues);
      return errorResponse("ผล OCR ไม่ตรงกับรูปแบบข้อมูลที่ระบบรองรับ", 502);
    }

    const payload: OrderPayload = {
      schema_version: "restaurant.order.v1",
      event: "restaurant.order.extracted",
      payload_id: crypto.randomUUID(),
      captured_at: new Date().toISOString(),
      source: {
        type: "handwritten_order_ocr",
        provider: "google_gemini",
        model: GEMINI_MODEL,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      },
      ...extraction.data,
    };

    return Response.json(payload);
  } catch (error) {
    console.error("Order OCR request failed", error);
    return errorResponse("เกิดข้อผิดพลาดระหว่าง OCR กรุณาลองใหม่อีกครั้ง", 500);
  }
}

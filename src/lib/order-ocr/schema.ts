import { z } from "zod";
import { ORDER_TYPE_VALUES, type OrderOcrFields } from "@/lib/expense/types";

const nullablePrice = z.number().nonnegative().nullable();
const confidence = z.number().min(0).max(1);

export const orderToppingSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitPrice: nullablePrice,
  totalPrice: nullablePrice,
  confidence,
  needsReview: z.boolean(),
  humanReviewed: z.boolean(),
});

export const orderItemSchema = z.object({
  lineId: z.string(),
  menuItemId: z.string().nullable(),
  menuItemName: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  toppings: z.array(orderToppingSchema),
  unitPrice: nullablePrice,
  totalPrice: nullablePrice,
  notes: z.string(),
  confidence,
  needsReview: z.boolean(),
  humanReviewed: z.boolean(),
  rawText: z.string().optional(),
  ocrUnitPrice: nullablePrice.optional(),
  ocrTotalPrice: nullablePrice.optional(),
});

export const orderExtractionSchema = z.object({
  orderNumber: z.string(),
  orderNumberSource: z.enum(["image", "generated"]),
  customerName: z.string().nullable(),
  orderedAt: z.string().datetime({ local: true }).nullable(),
  orderedAtSource: z.enum(["image", "file_metadata", "missing"]),
  orderType: z.enum(ORDER_TYPE_VALUES),
  items: z.array(orderItemSchema),
  notes: z.string().nullable(),
  subtotal: nullablePrice,
  tax: nullablePrice,
  discount: nullablePrice,
  totalAmount: nullablePrice,
  confidence,
  needsReview: z.boolean(),
  reviewReasons: z.array(z.string()),
  rawText: z.string(),
});

export type OrderExtraction = OrderOcrFields;

export interface OrderOcrPayload {
  schema_version: "restaurant.order.v2";
  event: "restaurant.order.extracted";
  payload_id: string;
  captured_at: string;
  source: {
    type: "order_ocr";
    provider: "opentyphoon" | "mock";
    model: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
  };
  extraction: OrderExtraction;
}

export interface OrderOcrBatchResult {
  /** Zero-based index matching the uploaded `files` order. */
  index: number;
  filename: string;
  payload?: OrderOcrPayload;
  error?: string;
}

export interface OrderOcrBatchPayload {
  schema_version: "restaurant.order.batch.v1";
  event: "restaurant.order.batch.extracted";
  batch_id: string;
  captured_at: string;
  results: OrderOcrBatchResult[];
}

export const orderExtractionJsonSchema = {
  type: "object",
  properties: {
    orderNumber: { type: ["string", "null"] },
    customerName: { type: ["string", "null"] },
    orderedAt: { type: ["string", "null"] },
    orderType: { type: "string", enum: [...ORDER_TYPE_VALUES] },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lineId: { type: "string" },
          menuItemId: { type: ["string", "null"] },
          menuItemName: { type: "string" },
          quantity: { type: "number", minimum: 0 },
          unit: { type: "string" },
          toppings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                quantity: { type: "number", minimum: 0 },
                unit: { type: "string" },
                unitPrice: { type: ["number", "null"] },
                totalPrice: { type: ["number", "null"] },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                needsReview: { type: "boolean" },
                humanReviewed: { type: "boolean" },
              },
              required: ["id", "name", "quantity", "unit", "unitPrice", "totalPrice", "confidence", "needsReview", "humanReviewed"],
            },
          },
          unitPrice: { type: ["number", "null"] },
          totalPrice: { type: ["number", "null"] },
          notes: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          needsReview: { type: "boolean" },
          humanReviewed: { type: "boolean" },
        },
        required: ["lineId", "menuItemId", "menuItemName", "quantity", "unit", "toppings", "unitPrice", "totalPrice", "notes", "confidence", "needsReview", "humanReviewed"],
      },
    },
    notes: { type: ["string", "null"] },
    subtotal: { type: ["number", "null"] },
    tax: { type: ["number", "null"] },
    discount: { type: ["number", "null"] },
    totalAmount: { type: ["number", "null"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    needsReview: { type: "boolean" },
    reviewReasons: { type: "array", items: { type: "string" } },
    rawText: { type: "string" },
  },
  required: ["orderNumber", "customerName", "orderedAt", "orderType", "items", "notes", "subtotal", "tax", "discount", "totalAmount", "confidence", "needsReview", "reviewReasons", "rawText"],
} as const;

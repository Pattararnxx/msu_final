import { z } from "zod";

const confidenceSchema = z.number().min(0).max(1);

export const orderItemSchema = z.object({
  line_id: z.string(),
  menu_item_name: z.string(),
  quantity: z.number().int().min(1),
  unit: z.string(),
  modifiers: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      confidence: confidenceSchema,
    }),
  ),
  notes: z.array(z.string()),
  unit_price: z.number().nonnegative().nullable(),
  subtotal: z.number().nonnegative().nullable(),
  confidence: confidenceSchema,
  needs_review: z.boolean(),
  human_reviewed: z.boolean(),
  raw_text: z.string(),
});

export const extractedOrderSchema = z.object({
  order_id: z.string().nullable(),
  restaurant_name: z.string().nullable(),
  table_number: z.string().nullable(),
  service_type: z.enum(["dine_in", "takeaway", "delivery", "unknown"]),
  ordered_at: z.string().nullable(),
  currency: z.literal("THB"),
  items: z.array(orderItemSchema),
  notes: z.array(z.string()),
  totals: z.object({
    subtotal: z.number().nonnegative().nullable(),
    tax: z.number().nonnegative().nullable(),
    discount: z.number().nonnegative().nullable(),
    grand_total: z.number().nonnegative().nullable(),
  }),
});

export const extractionResultSchema = z.object({
  order: extractedOrderSchema,
  quality: z.object({
    overall_confidence: confidenceSchema,
    needs_review: z.boolean(),
    review_reasons: z.array(z.string()),
  }),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type ExtractedOrder = z.infer<typeof extractedOrderSchema>;
export type ExtractionResult = z.infer<typeof extractionResultSchema>;

export interface OrderPayload extends ExtractionResult {
  schema_version: "restaurant.order.v1";
  event: "restaurant.order.extracted";
  payload_id: string;
  captured_at: string;
  source: {
    type: "handwritten_order_ocr";
    provider: "opentyphoon";
    model: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
  };
}

/**
 * The Typhoon normalizer receives this JSON-schema subset in its prompt.
 * Keep it explicit rather than deriving it from Zod so the API contract is
 * easy to inspect and stable across Zod upgrades.
 */
export const orderExtractionJsonSchema = {
  type: "object",
  properties: {
    order: {
      type: "object",
      properties: {
        order_id: { type: ["string", "null"] },
        restaurant_name: { type: ["string", "null"] },
        table_number: { type: ["string", "null"] },
        service_type: {
          type: "string",
          enum: ["dine_in", "takeaway", "delivery", "unknown"],
        },
        ordered_at: { type: ["string", "null"] },
        currency: { type: "string", enum: ["THB"] },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              line_id: { type: "string" },
              menu_item_name: { type: "string" },
              quantity: { type: "integer" },
              unit: { type: "string" },
              modifiers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    value: { type: "string" },
                    confidence: { type: "number" },
                  },
                  required: ["name", "value", "confidence"],
                },
              },
              notes: { type: "array", items: { type: "string" } },
              unit_price: { type: ["number", "null"] },
              subtotal: { type: ["number", "null"] },
              confidence: { type: "number" },
              needs_review: { type: "boolean" },
              human_reviewed: { type: "boolean" },
              raw_text: { type: "string" },
            },
            required: [
              "line_id",
              "menu_item_name",
              "quantity",
              "unit",
              "modifiers",
              "notes",
              "unit_price",
              "subtotal",
              "confidence",
              "needs_review",
              "human_reviewed",
              "raw_text",
            ],
          },
        },
        notes: { type: "array", items: { type: "string" } },
        totals: {
          type: "object",
          properties: {
            subtotal: { type: ["number", "null"] },
            tax: { type: ["number", "null"] },
            discount: { type: ["number", "null"] },
            grand_total: { type: ["number", "null"] },
          },
          required: ["subtotal", "tax", "discount", "grand_total"],
        },
      },
      required: [
        "order_id",
        "restaurant_name",
        "table_number",
        "service_type",
        "ordered_at",
        "currency",
        "items",
        "notes",
        "totals",
      ],
    },
    quality: {
      type: "object",
      properties: {
        overall_confidence: { type: "number" },
        needs_review: { type: "boolean" },
        review_reasons: { type: "array", items: { type: "string" } },
      },
      required: ["overall_confidence", "needs_review", "review_reasons"],
    },
  },
  required: ["order", "quality"],
} as const;

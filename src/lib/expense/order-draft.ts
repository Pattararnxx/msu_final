import type { ExpenseItem, OrderDraft, OrderItem, OrderLineItem } from "./types";

function asNumber(value: number | ""): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function orderDraftTotal(draft: OrderDraft): number {
  return draft.items.reduce((sum, item) => sum + (asNumber(item.totalPrice) ?? 0), 0);
}

export function orderDraftNeedsReview(draft: OrderDraft): boolean {
  if (!draft.orderNumber.trim() || !draft.orderedAt || draft.items.length === 0) return true;
  if (draft.needsReview && !draft.humanReviewed) return true;
  if (draft.confidence < 0.7) return true;
  return draft.items.some((item) =>
    !item.menuItemId ||
    !item.menuItemName.trim() ||
    item.quantity <= 0 ||
    asNumber(item.unitPrice) === null ||
    asNumber(item.totalPrice) === null ||
    item.confidence < 0.7 ||
    item.needsReview ||
    item.toppings.some((topping) =>
      !topping.name.trim() || topping.quantity <= 0 || topping.confidence < 0.7 || topping.needsReview,
    ),
  );
}

export function orderDraftToExpenseItem(
  draft: OrderDraft,
  options: { id?: string; imageUrl?: string; uploadedBy?: string } = {},
): ExpenseItem {
  const orderedAt = draft.orderedAt || new Date().toISOString().slice(0, 19);
  const items: OrderItem[] = draft.items.map((item) => ({
    ...item,
    unitPrice: asNumber(item.unitPrice),
    totalPrice: asNumber(item.totalPrice),
    humanReviewed: draft.humanReviewed || item.humanReviewed,
    toppings: item.toppings.map((topping) => ({
      ...topping,
      unitPrice: asNumber(topping.unitPrice),
      totalPrice: asNumber(topping.totalPrice),
      humanReviewed: draft.humanReviewed || topping.humanReviewed,
    })),
  }));
  const lineItems: OrderLineItem[] = items.flatMap((item) =>
    item.menuItemId ? [{ menuItemId: item.menuItemId, quantity: item.quantity }] : [],
  );
  const description = items
    .map((item) => `${item.menuItemName || "เมนูที่ต้องตรวจ"} x${item.quantity}${item.notes ? ` (${item.notes})` : ""}`)
    .join(", ");

  return {
    id: options.id ?? `order-${crypto.randomUUID()}`,
    orderNumber: draft.orderNumber,
    date: orderedAt.slice(0, 10),
    orderedAt,
    orderType: draft.orderType,
    ...(draft.customerName.trim() ? { customerName: draft.customerName.trim() } : {}),
    items,
    notes: draft.notes.trim(),
    lineItems,
    description,
    uploadedAt: orderedAt.slice(11, 16) || new Date().toTimeString().slice(0, 5),
    uploadedBy: options.uploadedBy ?? "พนักงานหน้าร้าน (Prototype)",
    ...(options.imageUrl ? { imageUrl: options.imageUrl } : {}),
    confidence: draft.confidence,
    humanReviewed: draft.humanReviewed,
    amount: orderDraftTotal(draft),
  };
}

import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { MOCK_EXPENSES } from "@/lib/expense/mock-data";
import type { FoodType } from "@/lib/expense/types";
import { MOCK_MENU_ITEMS } from "@/lib/menu/mock-data";
import type {
  MarketingMenuItem,
  MarketingSalesItem,
  MarketingUiBlock,
} from "./types";

const DATASET_SOURCE = "เมนูและออร์เดอร์ตัวอย่างที่ร้านตั้งไว้ในระบบ";
const DATASET_AS_OF = "19 เมษายน 2026";

const foodTypeSchema = z.enum(["ข้าวต้ม", "โจ๊ก", "ก๋วยจั๊บ", "อื่นๆ"]);

interface SalesRow extends MarketingSalesItem {
  category: FoodType;
}

export function getMenuSnapshot(category?: FoodType): MarketingMenuItem[] {
  return MOCK_MENU_ITEMS
    .filter((item) => !category || item.category === category)
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      ingredients: item.ingredients,
      options: item.optionGroups.flatMap((group) =>
        group.choices.map((choice) => ({
          group: group.label,
          name: choice.label,
          priceDelta: choice.priceDelta,
        })),
      ),
    }));
}

export function getSalesSnapshot(category?: FoodType): SalesRow[] {
  const sales = new Map<string, SalesRow>();

  for (const order of MOCK_EXPENSES) {
    const seenInOrder = new Set<string>();
    for (const line of order.lineItems ?? []) {
      const item = MOCK_MENU_ITEMS.find((menuItem) => menuItem.id === line.menuItemId);
      if (!item || (category && item.category !== category)) continue;

      const current = sales.get(item.id) ?? {
        menuItemId: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantitySold: 0,
        revenue: 0,
        orderCount: 0,
      };
      current.quantitySold += line.quantity;
      current.revenue += line.quantity * item.price;
      if (!seenInOrder.has(item.id)) current.orderCount += 1;
      seenInOrder.add(item.id);
      sales.set(item.id, current);
    }
  }

  return [...sales.values()].sort((a, b) => b.quantitySold - a.quantitySold);
}

function getBundleSnapshot(menuItemIds: string[], discountPercent: number) {
  const items = menuItemIds.map((id) => MOCK_MENU_ITEMS.find((item) => item.id === id));
  if (items.some((item) => !item)) return null;

  const selectedItems = items.filter(Boolean).map((item) => ({
    id: item!.id,
    name: item!.name,
    price: item!.price,
  }));
  const regularPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const discount = Math.round((regularPrice * discountPercent) / 100);

  return {
    items: selectedItems,
    regularPrice,
    discountPercent,
    discountAmount: discount,
    proposedPrice: regularPrice - discount,
    status: "ข้อเสนอร่าง ต้องให้เจ้าของร้านอนุมัติก่อนใช้จริง",
  };
}

export const marketingTools: ToolSet = {
  getRestaurantMenu: tool({
    description:
      "Read the restaurant's configured menu, prices, ingredients, and add-on options. Always use this before mentioning a menu price or writing a menu-specific promotion.",
    inputSchema: z.object({
      category: foodTypeSchema.optional().describe("Optional menu category to filter."),
    }),
    execute: async ({ category }) => {
      const items = getMenuSnapshot(category);
      return {
        found: items.length > 0,
        asOf: DATASET_AS_OF,
        source: DATASET_SOURCE,
        items,
        ui:
          items.length > 0
            ? ({
                type: "menu_catalog",
                title: "ฐานข้อมูลเมนูร้าน",
                asOf: DATASET_AS_OF,
                items: items.map(({ id, name, category, price }) => ({ id, name, category, price })),
              } satisfies MarketingUiBlock)
            : undefined,
      };
    },
  }),

  getSalesInsights: tool({
    description:
      "Read the sample order history and return menu sales ranking. Use this before claiming which menu is popular, which category sells best, or what should be promoted.",
    inputSchema: z.object({
      category: foodTypeSchema.optional().describe("Optional menu category to filter."),
      topN: z.number().int().min(1).max(10).default(5).describe("Number of top menu items to return."),
    }),
    execute: async ({ category, topN }) => {
      const rows = getSalesSnapshot(category);
      const categoryTotals = rows.reduce<Record<string, { quantitySold: number; revenue: number }>>(
        (totals, row) => {
          const current = totals[row.category] ?? { quantitySold: 0, revenue: 0 };
          current.quantitySold += row.quantitySold;
          current.revenue += row.revenue;
          totals[row.category] = current;
          return totals;
        },
        {},
      );

      return {
        found: rows.length > 0,
        asOf: DATASET_AS_OF,
        source: DATASET_SOURCE,
        note: "เป็นยอดจากข้อมูลตัวอย่างในระบบ ไม่ใช่ยอดขายสดจาก POS",
        topItems: rows.slice(0, topN),
        categoryTotals,
        ui:
          rows.length > 0
            ? ({
                type: "sales_insight",
                title: "เมนูที่ควรดัน",
                asOf: DATASET_AS_OF,
                note: "จัดอันดับจากจำนวนที่สั่งในข้อมูลตัวอย่าง ไม่ใช่ยอดขายสด",
                items: rows.slice(0, topN).map(({ menuItemId, name, category, price, quantitySold }) => ({
                  menuItemId,
                  name,
                  category,
                  price,
                  quantitySold,
                })),
                recommendedAction: `เริ่มจาก ${rows[0].name} เป็นเมนูนำ แล้วทดสอบการจับคู่กับเครื่องดื่มหรือของทานเล่นเป็นร่างโปรโมชัน`,
              } satisfies MarketingUiBlock)
            : undefined,
      };
    },
  }),

  calculateBundlePrice: tool({
    description:
      "Calculate a draft bundle price from configured menu prices. Use for promotion ideas; never present it as an approved price or publish it automatically.",
    inputSchema: z.object({
      menuItemIds: z.array(z.string()).min(2).max(3).describe("Two or three configured menu item ids."),
      discountPercent: z.number().min(0).max(30).default(10).describe("Draft discount percentage, capped at 30."),
    }),
    execute: async ({ menuItemIds, discountPercent }) => {
      const bundle = getBundleSnapshot(menuItemIds, discountPercent);
      if (!bundle) {
        return {
          found: false,
          source: DATASET_SOURCE,
          message: "มีเมนูบางรายการที่ไม่พบใน catalogue ร้าน ให้เรียก getRestaurantMenu ก่อน",
        };
      }
      return {
        found: true,
        asOf: DATASET_AS_OF,
        source: DATASET_SOURCE,
        ...bundle,
        ui: {
          type: "bundle_draft",
          title: "ร่างชุดโปรโมชัน",
          asOf: DATASET_AS_OF,
          ...bundle,
        } satisfies MarketingUiBlock,
      };
    },
  }),
};

export { DATASET_AS_OF, DATASET_SOURCE };

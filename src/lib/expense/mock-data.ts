import { MOCK_MENU_ITEMS } from "@/lib/menu/mock-data";
import type {
  ExpenseItem,
  FoodType,
  OrderItem,
  OrderLineItem,
  OrderTopping,
  OrderType,
} from "./types";

interface LegacyOrder {
  id: string;
  date: string;
  foodItems: FoodType[];
  lineItems: OrderLineItem[];
  orderNumber?: string;
  orderType?: OrderType;
  customerName?: string;
  description: string;
  notes?: string;
  uploadedAt: string;
  uploadedBy?: string;
  amount: number;
}

// Placeholder data for a breakfast-soup restaurant that photographs each
// customer's order slip and prices it from the photo — rows are customer
// orders, not the restaurant's own expenses. Two full weeks (6–12 and
// 13–19 April 2026), a dozen-ish orders each, so week grouping actually
// reads as "a busy week" instead of two or three lonely rows. Most orders
// have one dish; a couple have two, since a real order slip often does.
// customerName is only set when the photographed slip actually named the
// customer — table numbers and delivery-platform orders leave it unset,
// which the list renders as "ไม่ทราบชื่อ". `lineItems` maps each order to
// real menu items (see src/lib/menu) so the menu dashboard's sales chart
// can aggregate genuine numbers instead of a disconnected mock series.
const HAND_AUTHORED_ORDERS: LegacyOrder[] = [
  // Week of 6–12 Apr
  {
    id: "ord-001",
    date: "2026-04-06",
    foodItems: ["ข้าวต้ม"],
    lineItems: [{ menuItemId: "menu-001", quantity: 2 }],
    description: "โต๊ะ 2 - ข้าวต้มหมูสับ 2 ที่, ไข่ลวก 1 ฟอง",
    uploadedAt: "06:45",
    amount: 90,
  },
  {
    id: "ord-002",
    date: "2026-04-06",
    foodItems: ["โจ๊ก"],
    lineItems: [{ menuItemId: "menu-006", quantity: 1 }],
    description: "เดลิเวอรี่ #Grab1042 - โจ๊กไก่ฉีก 1, น้ำเปล่า 1",
    uploadedAt: "07:10",
    amount: 65,
  },
  {
    id: "ord-003",
    date: "2026-04-07",
    foodItems: ["ก๋วยจั๊บ"],
    lineItems: [{ menuItemId: "menu-008", quantity: 1 }],
    description: "โต๊ะ 5 - ก๋วยจั๊บน้ำข้น หมูกรอบ 1 ที่",
    uploadedAt: "07:30",
    amount: 55,
  },
  {
    id: "ord-004",
    date: "2026-04-07",
    foodItems: ["ข้าวต้ม"],
    lineItems: [{ menuItemId: "menu-003", quantity: 1 }],
    customerName: "คุณสมชาย",
    description: "ข้าวต้มปลากะพง 1 ที่",
    uploadedAt: "08:05",
    amount: 75,
  },
  {
    id: "ord-005",
    date: "2026-04-08",
    foodItems: ["โจ๊ก"],
    lineItems: [{ menuItemId: "menu-005", quantity: 1 }],
    description: "โต๊ะ 1 - โจ๊กหมูใส่ไข่, ไข่ต้ม 1 ฟอง",
    uploadedAt: "06:55",
    amount: 60,
  },
  {
    id: "ord-006",
    date: "2026-04-08",
    foodItems: ["อื่นๆ"],
    lineItems: [
      { menuItemId: "menu-011", quantity: 1 },
      { menuItemId: "menu-012", quantity: 1 },
    ],
    description: "เดลิเวอรี่ #LINEMAN0098 - ปาท่องโก๋ 4 ชิ้น, น้ำเต้าหู้ 1",
    uploadedAt: "07:40",
    amount: 45,
  },
  {
    id: "ord-007",
    date: "2026-04-08",
    foodItems: ["ก๋วยจั๊บ"],
    lineItems: [{ menuItemId: "menu-010", quantity: 1 }],
    description: "โต๊ะ 6 - ก๋วยจั๊บรวม หมู+เครื่องใน 1 ที่",
    uploadedAt: "08:20",
    amount: 65,
  },
  {
    id: "ord-008",
    date: "2026-04-09",
    foodItems: ["ข้าวต้ม"],
    lineItems: [{ menuItemId: "menu-002", quantity: 2 }],
    description: "โต๊ะ 3 - ข้าวต้มไก่ 2 ที่, ไข่เจียว 1",
    uploadedAt: "07:00",
    amount: 130,
  },
  {
    id: "ord-009",
    date: "2026-04-09",
    foodItems: ["โจ๊ก"],
    lineItems: [{ menuItemId: "menu-007", quantity: 1 }],
    customerName: "คุณมานี",
    description: "โจ๊กไข่เยี่ยวม้า พิเศษ 1 ที่",
    uploadedAt: "07:50",
    amount: 70,
  },
  {
    id: "ord-010",
    date: "2026-04-10",
    foodItems: ["อื่นๆ"],
    lineItems: [{ menuItemId: "menu-013", quantity: 2 }],
    description: "เดลิเวอรี่ #Grab1187 - กาแฟเย็น 2, ขนมปังปิ้ง 1",
    uploadedAt: "08:10",
    amount: 95,
  },
  {
    id: "ord-011",
    date: "2026-04-11",
    foodItems: ["ก๋วยจั๊บ"],
    lineItems: [{ menuItemId: "menu-009", quantity: 1 }],
    description: "โต๊ะ 4 - ก๋วยจั๊บน้ำใส หมู 1 ที่",
    uploadedAt: "06:50",
    amount: 50,
  },
  {
    id: "ord-012",
    date: "2026-04-12",
    foodItems: ["ข้าวต้ม", "ก๋วยจั๊บ"],
    lineItems: [
      { menuItemId: "menu-004", quantity: 1 },
      { menuItemId: "menu-009", quantity: 1 },
    ],
    description: "โต๊ะ 8 - ข้าวต้มทะเล 1, ก๋วยจั๊บ 1 ที่",
    uploadedAt: "09:15",
    amount: 110,
  },

  // Week of 13–19 Apr
  {
    id: "ord-013",
    date: "2026-04-13",
    foodItems: ["โจ๊ก"],
    lineItems: [{ menuItemId: "menu-005", quantity: 2 }],
    description: "โต๊ะ 2 - โจ๊กหมู 2 ที่",
    uploadedAt: "06:40",
    amount: 120,
  },
  {
    id: "ord-014",
    date: "2026-04-13",
    foodItems: ["ข้าวต้ม"],
    lineItems: [{ menuItemId: "menu-001", quantity: 1 }],
    description: "เดลิเวอรี่ #Grab1233 - ข้าวต้มหมูสับ 1, น้ำเปล่า 1",
    uploadedAt: "07:25",
    amount: 70,
  },
  {
    id: "ord-015",
    date: "2026-04-14",
    foodItems: ["ก๋วยจั๊บ"],
    lineItems: [{ menuItemId: "menu-009", quantity: 1 }],
    description: "โต๊ะ 7 - ก๋วยจั๊บใส่ไข่ 1 ที่",
    uploadedAt: "07:55",
    amount: 60,
  },
  {
    id: "ord-016",
    date: "2026-04-14",
    foodItems: ["อื่นๆ"],
    lineItems: [
      { menuItemId: "menu-014", quantity: 1 },
      { menuItemId: "menu-011", quantity: 1 },
    ],
    customerName: "คุณวิภา",
    description: "ชุดเช้า - กาแฟร้อน 1, ปาท่องโก๋ 3",
    uploadedAt: "08:30",
    amount: 55,
  },
  {
    id: "ord-017",
    date: "2026-04-15",
    foodItems: ["ข้าวต้ม"],
    lineItems: [{ menuItemId: "menu-004", quantity: 1 }],
    description: "โต๊ะ 1 - ข้าวต้มรวมทะเล 1 ที่",
    uploadedAt: "07:05",
    amount: 100,
  },
  {
    id: "ord-018",
    date: "2026-04-15",
    foodItems: ["โจ๊ก"],
    lineItems: [{ menuItemId: "menu-005", quantity: 1 }],
    description: "โต๊ะ 3 - โจ๊กหมู, ไข่ลวก 1",
    uploadedAt: "07:35",
    amount: 65,
  },
  {
    id: "ord-019",
    date: "2026-04-16",
    foodItems: ["ก๋วยจั๊บ"],
    lineItems: [{ menuItemId: "menu-008", quantity: 2 }],
    description: "เดลิเวอรี่ #LINEMAN0155 - ก๋วยจั๊บหมูกรอบ 2 ที่",
    uploadedAt: "06:45",
    amount: 110,
  },
  {
    id: "ord-020",
    date: "2026-04-16",
    foodItems: ["ข้าวต้ม"],
    lineItems: [{ menuItemId: "menu-002", quantity: 1 }],
    description: "โต๊ะ 5 - ข้าวต้มไก่ 1 ที่",
    uploadedAt: "08:00",
    amount: 65,
  },
  {
    id: "ord-021",
    date: "2026-04-17",
    foodItems: ["โจ๊ก"],
    lineItems: [{ menuItemId: "menu-005", quantity: 2 }],
    customerName: "คุณอนันต์",
    description: "โจ๊กพิเศษ 2 ที่",
    uploadedAt: "07:15",
    amount: 140,
  },
  {
    id: "ord-022",
    date: "2026-04-18",
    foodItems: ["อื่นๆ"],
    lineItems: [
      { menuItemId: "menu-012", quantity: 2 },
      { menuItemId: "menu-011", quantity: 1 },
    ],
    description: "โต๊ะ 9 - ชุดเครื่องดื่ม น้ำเต้าหู้ 2, ปาท่องโก๋ 2",
    uploadedAt: "08:45",
    amount: 60,
  },
  {
    id: "ord-023",
    date: "2026-04-19",
    foodItems: ["ก๋วยจั๊บ", "โจ๊ก"],
    lineItems: [
      { menuItemId: "menu-009", quantity: 1 },
      { menuItemId: "menu-005", quantity: 1 },
    ],
    description: "โต๊ะ 2 - ก๋วยจั๊บ 1, โจ๊ก 1 ที่",
    uploadedAt: "07:20",
    amount: 120,
  },
  {
    id: "ord-024",
    date: "2026-04-19",
    foodItems: ["ข้าวต้ม"],
    lineItems: [{ menuItemId: "menu-003", quantity: 1 }],
    description: "เดลิเวอรี่ #Grab1301 - ข้าวต้มปลา 1 ที่",
    uploadedAt: "09:05",
    amount: 75,
  },
];

const MENU_ITEM_BY_ID = new Map(MOCK_MENU_ITEMS.map((item) => [item.id, item]));

const UPLOAD_STAFF = ["แม่ครัวใหญ่ สมศรี", "พนักงานเสิร์ฟ นภา", "ผู้จัดการร้าน อนัญญา"];

function orderTypeFromDescription(description: string): OrderType {
  if (description.includes("เดลิเวอรี่")) return "delivery";
  if (description.includes("โต๊ะ")) return "dine_in";
  if (description.includes("รับกลับ")) return "takeaway";
  return "unknown";
}

function itemUnit(menuItemId: string): string {
  if (menuItemId === "menu-011") return "ชุด";
  if (["menu-012", "menu-013", "menu-014"].includes(menuItemId)) return "แก้ว";
  return "ที่";
}

function topping(
  lineId: string,
  suffix: string,
  name: string,
  quantity: number,
  unit: string,
  unitPrice: number,
): OrderTopping {
  return {
    id: `${lineId}-topping-${suffix}`,
    name,
    quantity,
    unit,
    unitPrice,
    totalPrice: quantity * unitPrice,
    confidence: 1,
    needsReview: false,
    humanReviewed: true,
  };
}

function toppingsForLine(source: LegacyOrder, lineId: string, lineIndex: number): OrderTopping[] {
  // The handwritten additions in the legacy descriptions belong to the first
  // mapped menu line. This keeps the sales-only `lineItems` compact while
  // giving the rich OCR-shaped item its quantities and prices.
  if (lineIndex !== 0) return [];

  const toppings: OrderTopping[] = [];
  const softBoiledEgg = source.description.match(/ไข่ลวก\s*(\d+)?/);
  const boiledEgg = source.description.match(/ไข่ต้ม\s*(\d+)?/);

  if (softBoiledEgg) {
    toppings.push(topping(lineId, "soft-boiled-egg", "เพิ่มไข่ลวก", Number(softBoiledEgg[1] ?? 1), "ฟอง", 10));
  }
  if (boiledEgg) {
    toppings.push(topping(lineId, "boiled-egg", "เพิ่มไข่ต้ม", Number(boiledEgg[1] ?? 1), "ฟอง", 10));
  }
  if (source.description.includes("ใส่ไข่") && !softBoiledEgg && !boiledEgg) {
    toppings.push(topping(lineId, "egg", "เพิ่มไข่", 1, "ฟอง", 10));
  }
  if (source.description.includes("พิเศษ")) {
    toppings.push(topping(lineId, "special", "ขนาดพิเศษ", 1, "ระดับ", 15));
  }

  return toppings;
}

function allocateLineTotals(weights: number[], amount: number): number[] {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let allocated = 0;

  return weights.map((weight, index) => {
    const total = index === weights.length - 1
      ? amount - allocated
      : Math.round((amount * weight) / totalWeight);
    allocated += total;
    return total;
  });
}

function enrichOrder(source: LegacyOrder): ExpenseItem {
  const lineDetails = source.lineItems.map((line, index) => {
    const lineId = `${source.id}-line-${index + 1}`;
    const menuItem = MENU_ITEM_BY_ID.get(line.menuItemId);
    const toppings = toppingsForLine(source, lineId, index);
    const toppingTotal = toppings.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
    const menuTotal = (menuItem?.price ?? 0) * line.quantity;

    return { line, lineId, menuItem, toppings, toppingTotal, weight: menuTotal + toppingTotal };
  });

  const lineTotals = allocateLineTotals(
    lineDetails.map((detail) => detail.weight),
    source.amount,
  );

  const items: OrderItem[] = lineDetails.map((detail, index) => {
    const totalPrice = lineTotals[index];
    const baseTotal = Math.max(totalPrice - detail.toppingTotal, 0);

    return {
      lineId: detail.lineId,
      menuItemId: detail.line.menuItemId,
      menuItemName: detail.menuItem?.name ?? detail.line.menuItemId,
      quantity: detail.line.quantity,
      unit: itemUnit(detail.line.menuItemId),
      toppings: detail.toppings,
      unitPrice: baseTotal / detail.line.quantity,
      totalPrice,
      notes: "",
      confidence: 1,
      needsReview: false,
      humanReviewed: true,
    };
  });

  const staffIndex = Number(source.id.match(/\d+$/)?.[0] ?? 0) % UPLOAD_STAFF.length;

  return {
    id: source.id,
    orderNumber: source.orderNumber ?? `MOCK-${source.id.toUpperCase()}`,
    date: source.date,
    orderedAt: `${source.date}T${source.uploadedAt}:00`,
    orderType: source.orderType ?? orderTypeFromDescription(source.description),
    ...(source.customerName ? { customerName: source.customerName } : {}),
    items,
    notes: source.notes ?? "",
    lineItems: source.lineItems.map((line) => ({ ...line })),
    description: source.description,
    uploadedAt: source.uploadedAt,
    uploadedBy: source.uploadedBy ?? UPLOAD_STAFF[staffIndex],
    amount: source.amount,
  };
}

// Deterministic PRNG (mulberry32) — module-level mock data runs on both the
// server render and the client hydration pass, so Math.random() here would
// produce two different arrays and trigger a hydration mismatch. A fixed
// seed keeps every run identical.
function mulberry32(seed: number) {
  let state = seed;
  return function rng() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Relative popularity per menu item — drives both how often each dish gets
// picked in the generated history and, downstream, which ones the "ขายดี"
// badge lands on (src/lib/menu/sales.ts ranks by total quantity sold).
const POPULARITY_WEIGHT: Record<string, number> = {
  "menu-001": 10, // ข้าวต้มหมูสับ
  "menu-002": 6,
  "menu-003": 4,
  "menu-004": 3,
  "menu-005": 9, // โจ๊กหมู
  "menu-006": 5,
  "menu-007": 3,
  "menu-008": 8, // ก๋วยจั๊บน้ำข้น หมูกรอบ
  "menu-009": 5,
  "menu-010": 3,
  "menu-011": 4,
  "menu-012": 3,
  "menu-013": 7, // กาแฟเย็น
  "menu-014": 3,
};

function pickWeighted(rng: () => number): (typeof MOCK_MENU_ITEMS)[number] {
  const totalWeight = MOCK_MENU_ITEMS.reduce(
    (sum, item) => sum + (POPULARITY_WEIGHT[item.id] ?? 1),
    0,
  );
  let roll = rng() * totalWeight;
  for (const item of MOCK_MENU_ITEMS) {
    roll -= POPULARITY_WEIGHT[item.id] ?? 1;
    if (roll <= 0) return item;
  }
  return MOCK_MENU_ITEMS[MOCK_MENU_ITEMS.length - 1];
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function uniqueFoodTypes(items: OrderLineItem[]): FoodType[] {
  const found = new Set<FoodType>();
  for (const line of items) {
    const menuItem = MOCK_MENU_ITEMS.find((m) => m.id === line.menuItemId);
    if (menuItem) found.add(menuItem.category);
  }
  return Array.from(found);
}

// Fills in the rest of a trailing 12 months of order history (deterministic,
// seeded) so the menu dashboard's per-item sales chart has enough data to
// aggregate by week, month, and year — see src/lib/menu/sales.ts. Weekends
// run busier than weekdays, and each menu item's POPULARITY_WEIGHT above
// shapes how often it gets ordered, so some dishes read as clear top
// sellers and others as slow movers, same as a real 12 months would.
function generateHistoricalOrders(referenceDate: Date, days: number): LegacyOrder[] {
  const rng = mulberry32(20260813);
  const generated: LegacyOrder[] = [];
  let counter = 1;

  for (let offset = days; offset >= 1; offset -= 1) {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - offset);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const orderCount = Math.round(3 + rng() * (isWeekend ? 5 : 3));

    for (let i = 0; i < orderCount; i += 1) {
      const lineItemCount = rng() < 0.25 ? 2 : 1;
      const lineItems: OrderLineItem[] = [];
      for (let j = 0; j < lineItemCount; j += 1) {
        const menuItem = pickWeighted(rng);
        const quantity = rng() < 0.2 ? 2 : 1;
        lineItems.push({ menuItemId: menuItem.id, quantity });
      }

      const amount = lineItems.reduce((sum, line) => {
        const menuItem = MOCK_MENU_ITEMS.find((m) => m.id === line.menuItemId);
        return sum + (menuItem?.price ?? 0) * line.quantity;
      }, 0);

      const hour = 6 + Math.floor(rng() * 3);
      const minute = Math.floor(rng() * 60);
      const uploadedAt = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const orderTypeRoll = rng();
      const orderType: OrderType = orderTypeRoll < 0.6
        ? "dine_in"
        : orderTypeRoll < 0.85
          ? "takeaway"
          : "delivery";

      generated.push({
        id: `ord-gen-${String(counter).padStart(4, "0")}`,
        date: toIsoDate(date),
        foodItems: uniqueFoodTypes(lineItems),
        lineItems,
        description: lineItems
          .map((line) => {
            const menuItem = MOCK_MENU_ITEMS.find((m) => m.id === line.menuItemId);
            return `${menuItem?.name ?? line.menuItemId} x${line.quantity}`;
        })
          .join(", "),
        uploadedAt,
        orderType,
        amount,
      });
      counter += 1;
    }
  }

  return generated;
}

// "Now" for the trailing-12-months sales history — matches REFERENCE_DATE in
// src/app/home/page.tsx's usage but lives here since this is where the
// range is actually generated from.
const SALES_HISTORY_REFERENCE_DATE = new Date("2026-08-13");

export const MOCK_EXPENSES: ExpenseItem[] = [
  ...HAND_AUTHORED_ORDERS.map(enrichOrder),
  ...generateHistoricalOrders(SALES_HISTORY_REFERENCE_DATE, 365).map(enrichOrder),
];

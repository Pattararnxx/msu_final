import type { ExpenseItem } from "./types";

// Placeholder data for a breakfast-soup restaurant that photographs each
// customer's order slip and prices it from the photo — rows are customer
// orders, not the restaurant's own expenses. Two full weeks (6–12 and
// 13–19 April 2026), a dozen-ish orders each, so week grouping actually
// reads as "a busy week" instead of two or three lonely rows.
// customerName is only set when the photographed slip actually named the
// customer — table numbers and delivery-platform orders leave it unset,
// which the list renders as "ไม่ทราบชื่อ". uploadedBy cycles through the
// small front-of-house staff roster who actually snap and upload each slip.
//
// `items` is the structured breakdown the order-detail page
// (/home/order/[orderId]) reads — each dish's quantity, unit price (from
// this shop's own price list, never invented), and any toppings/modifiers
// attached to it. `amount` is deliberately *not* typed in by hand below —
// see `withAmount` — it's always Σ qty × unitPrice, so the list total and
// the detail page's line items can never drift apart.
function withAmount(order: Omit<ExpenseItem, "amount">): ExpenseItem {
  const amount = order.items.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0,
  );
  return { ...order, amount };
}

const RAW_ORDERS: Omit<ExpenseItem, "amount">[] = [
  // Week of 6–12 Apr
  {
    id: "ord-001",
    date: "2026-04-06",
    customerName: "คุณสมชาย",
    description: "โต๊ะ 2 - ข้าวต้มหมูสับ 2 ที่, ไข่ลวก 1 ฟอง",
    uploadedAt: "06:45",
    uploadedBy: "แม่ครัวใหญ่ สมศรี",
    orderNumber: "OR-001",
    orderType: "ทานที่ร้าน",
    items: [
      {
        menuName: "ข้าวต้มหมูสับ",
        qty: 2,
        unitPrice: 40,
        toppings: [{ name: "ไข่ลวก", qty: 1 }],
      },
    ],
  },
  {
    id: "ord-002",
    date: "2026-04-06",
    customerName: "คุณสุภาพร",
    description: "เดลิเวอรี่ #Grab1042 - โจ๊กไก่ฉีก 1, น้ำเปล่า 1",
    uploadedAt: "07:10",
    uploadedBy: "พนักงานเสิร์ฟ นภา",
    orderNumber: "OR-002",
    orderType: "เดลิเวอรี่",
    items: [
      { menuName: "โจ๊กไก่ฉีก", qty: 1, unitPrice: 45, toppings: [] },
      { menuName: "น้ำเปล่า", qty: 1, unitPrice: 10, toppings: [] },
    ],
  },
  {
    id: "ord-003",
    date: "2026-04-07",
    customerName: "คุณธนกร",
    description: "โต๊ะ 5 - ก๋วยจั๊บน้ำข้น หมูกรอบ 1 ที่",
    uploadedAt: "07:30",
    uploadedBy: "ผู้จัดการร้าน อนัญญา",
    orderNumber: "OR-003",
    orderType: "ทานที่ร้าน",
    items: [
      {
        menuName: "ก๋วยจั๊บน้ำข้น",
        qty: 1,
        unitPrice: 45,
        toppings: [{ name: "หมูกรอบ", qty: 1 }],
      },
    ],
  },
  {
    id: "ord-004",
    date: "2026-04-07",
    customerName: "คุณสมชาย",
    description: "ข้าวต้มปลากะพง 1 ที่",
    uploadedAt: "08:05",
    uploadedBy: "แม่ครัวใหญ่ สมศรี",
    orderNumber: "OR-004",
    orderType: "กลับบ้าน",
    items: [{ menuName: "ข้าวต้มปลากะพง", qty: 1, unitPrice: 60, toppings: [] }],
  },
  {
    id: "ord-005",
    date: "2026-04-08",
    customerName: "คุณมานี",
    description: "โต๊ะ 1 - โจ๊กหมูใส่ไข่, ไข่ต้ม 1 ฟอง",
    uploadedAt: "06:55",
    uploadedBy: "พนักงานเสิร์ฟ นภา",
    orderNumber: "OR-005",
    orderType: "ทานที่ร้าน",
    items: [
      {
        menuName: "โจ๊กหมู",
        qty: 1,
        unitPrice: 40,
        toppings: [
          { name: "ใส่ไข่", qty: 1 },
          { name: "ไข่ต้ม", qty: 1 },
        ],
      },
    ],
  },
  {
    id: "ord-006",
    date: "2026-04-08",
    customerName: "คุณกิตติ",
    description: "เดลิเวอรี่ #LINEMAN0098 - ปาท่องโก๋ 4 ชิ้น, น้ำเต้าหู้ 1",
    uploadedAt: "07:40",
    uploadedBy: "ผู้จัดการร้าน อนัญญา",
    orderNumber: "OR-006",
    orderType: "เดลิเวอรี่",
    items: [
      { menuName: "ปาท่องโก๋", qty: 4, unitPrice: 5, toppings: [] },
      { menuName: "น้ำเต้าหู้", qty: 1, unitPrice: 15, toppings: [] },
    ],
  },
  {
    id: "ord-007",
    date: "2026-04-08",
    customerName: "คุณพิมพ์ชนก",
    description: "โต๊ะ 6 - ก๋วยจั๊บรวม หมู+เครื่องใน 1 ที่",
    uploadedAt: "08:20",
    uploadedBy: "แม่ครัวใหญ่ สมศรี",
    orderNumber: "OR-007",
    orderType: "ทานที่ร้าน",
    items: [
      { menuName: "ก๋วยจั๊บรวม หมู+เครื่องใน", qty: 1, unitPrice: 65, toppings: [] },
    ],
  },
  {
    id: "ord-008",
    date: "2026-04-09",
    description: "โต๊ะ 3 - ข้าวต้มไก่ 2 ที่, ไข่เจียว 1",
    uploadedAt: "07:00",
    uploadedBy: "พนักงานเสิร์ฟ นภา",
    orderNumber: "OR-008",
    orderType: "ทานที่ร้าน",
    items: [
      {
        menuName: "ข้าวต้มไก่",
        qty: 2,
        unitPrice: 45,
        toppings: [{ name: "ไข่เจียว", qty: 1 }],
      },
    ],
  },
  {
    id: "ord-009",
    date: "2026-04-09",
    customerName: "คุณมานี",
    description: "โจ๊กไข่เยี่ยวม้า พิเศษ 1 ที่",
    uploadedAt: "07:50",
    uploadedBy: "ผู้จัดการร้าน อนัญญา",
    orderNumber: "OR-009",
    orderType: "กลับบ้าน",
    items: [
      {
        menuName: "โจ๊กไข่เยี่ยวม้า",
        qty: 1,
        unitPrice: 50,
        toppings: [{ name: "พิเศษ", qty: 1 }],
      },
    ],
  },
  {
    id: "ord-010",
    date: "2026-04-10",
    customerName: "คุณณัฐวุฒิ",
    description: "เดลิเวอรี่ #Grab1187 - กาแฟเย็น 2, ขนมปังปิ้ง 1",
    uploadedAt: "08:10",
    uploadedBy: "แม่ครัวใหญ่ สมศรี",
    orderNumber: "OR-010",
    orderType: "เดลิเวอรี่",
    items: [
      { menuName: "กาแฟเย็น", qty: 2, unitPrice: 25, toppings: [] },
      { menuName: "ขนมปังปิ้ง", qty: 1, unitPrice: 20, toppings: [] },
    ],
  },
  {
    id: "ord-011",
    date: "2026-04-11",
    customerName: "คุณศิริพร",
    description: "โต๊ะ 4 - ก๋วยจั๊บน้ำใส หมู 1 ที่",
    uploadedAt: "06:50",
    uploadedBy: "พนักงานเสิร์ฟ นภา",
    orderNumber: "OR-011",
    orderType: "ทานที่ร้าน",
    items: [
      {
        menuName: "ก๋วยจั๊บน้ำใส",
        qty: 1,
        unitPrice: 45,
        toppings: [{ name: "หมู", qty: 1 }],
      },
    ],
  },
  {
    id: "ord-012",
    date: "2026-04-12",
    customerName: "คุณวราภรณ์",
    description: "โต๊ะ 8 - ข้าวต้มทะเล 1, ก๋วยจั๊บ 1 ที่",
    uploadedAt: "09:15",
    uploadedBy: "ผู้จัดการร้าน อนัญญา",
    orderNumber: "OR-012",
    orderType: "ทานที่ร้าน",
    items: [
      { menuName: "ข้าวต้มทะเล", qty: 1, unitPrice: 60, toppings: [] },
      { menuName: "ก๋วยจั๊บ", qty: 1, unitPrice: 45, toppings: [] },
    ],
  },

  // Week of 13–19 Apr
  {
    id: "ord-013",
    date: "2026-04-13",
    customerName: "คุณอนุชา",
    description: "โต๊ะ 2 - โจ๊กหมู 2 ที่",
    uploadedAt: "06:40",
    uploadedBy: "แม่ครัวใหญ่ สมศรี",
    orderNumber: "OR-013",
    orderType: "ทานที่ร้าน",
    items: [{ menuName: "โจ๊กหมู", qty: 2, unitPrice: 40, toppings: [] }],
  },
  {
    id: "ord-014",
    date: "2026-04-13",
    customerName: "คุณสุภาวดี",
    description: "เดลิเวอรี่ #Grab1233 - ข้าวต้มหมูสับ 1, น้ำเปล่า 1",
    uploadedAt: "07:25",
    uploadedBy: "พนักงานเสิร์ฟ นภา",
    orderNumber: "OR-014",
    orderType: "เดลิเวอรี่",
    items: [
      { menuName: "ข้าวต้มหมูสับ", qty: 1, unitPrice: 40, toppings: [] },
      { menuName: "น้ำเปล่า", qty: 1, unitPrice: 10, toppings: [] },
    ],
  },
  {
    id: "ord-015",
    date: "2026-04-14",
    customerName: "คุณชาญชัย",
    description: "โต๊ะ 7 - ก๋วยจั๊บใส่ไข่ 1 ที่",
    uploadedAt: "07:55",
    uploadedBy: "ผู้จัดการร้าน อนัญญา",
    orderNumber: "OR-015",
    orderType: "ทานที่ร้าน",
    items: [
      {
        menuName: "ก๋วยจั๊บ",
        qty: 1,
        unitPrice: 45,
        toppings: [{ name: "ใส่ไข่", qty: 1 }],
      },
    ],
  },
  {
    id: "ord-016",
    date: "2026-04-14",
    customerName: "คุณวิภา",
    description: "ชุดเช้า - กาแฟร้อน 1, ปาท่องโก๋ 3",
    uploadedAt: "08:30",
    uploadedBy: "แม่ครัวใหญ่ สมศรี",
    orderNumber: "OR-016",
    orderType: "กลับบ้าน",
    items: [
      { menuName: "กาแฟร้อน", qty: 1, unitPrice: 20, toppings: [] },
      { menuName: "ปาท่องโก๋", qty: 3, unitPrice: 5, toppings: [] },
    ],
  },
  {
    id: "ord-017",
    date: "2026-04-15",
    customerName: "คุณเอกชัย",
    description: "โต๊ะ 1 - ข้าวต้มรวมทะเล 1 ที่",
    uploadedAt: "07:05",
    uploadedBy: "พนักงานเสิร์ฟ นภา",
    orderNumber: "OR-017",
    orderType: "ทานที่ร้าน",
    items: [{ menuName: "ข้าวต้มรวมทะเล", qty: 1, unitPrice: 100, toppings: [] }],
  },
  {
    id: "ord-018",
    date: "2026-04-15",
    customerName: "คุณรัตนา",
    description: "โต๊ะ 3 - โจ๊กหมู, ไข่ลวก 1",
    uploadedAt: "07:35",
    uploadedBy: "ผู้จัดการร้าน อนัญญา",
    orderNumber: "OR-018",
    orderType: "ทานที่ร้าน",
    items: [
      {
        menuName: "โจ๊กหมู",
        qty: 1,
        unitPrice: 40,
        toppings: [{ name: "ไข่ลวก", qty: 1 }],
      },
    ],
  },
  {
    id: "ord-019",
    date: "2026-04-16",
    customerName: "คุณปรีชา",
    description: "เดลิเวอรี่ #LINEMAN0155 - ก๋วยจั๊บหมูกรอบ 2 ที่",
    uploadedAt: "06:45",
    uploadedBy: "แม่ครัวใหญ่ สมศรี",
    orderNumber: "OR-019",
    orderType: "เดลิเวอรี่",
    items: [{ menuName: "ก๋วยจั๊บหมูกรอบ", qty: 2, unitPrice: 55, toppings: [] }],
  },
  {
    id: "ord-020",
    date: "2026-04-16",
    customerName: "คุณกมลวรรณ",
    description: "โต๊ะ 5 - ข้าวต้มไก่ 1 ที่",
    uploadedAt: "08:00",
    uploadedBy: "พนักงานเสิร์ฟ นภา",
    orderNumber: "OR-020",
    orderType: "ทานที่ร้าน",
    items: [{ menuName: "ข้าวต้มไก่", qty: 1, unitPrice: 45, toppings: [] }],
  },
  {
    id: "ord-021",
    date: "2026-04-17",
    customerName: "คุณอนันต์",
    description: "โจ๊กพิเศษ 2 ที่",
    uploadedAt: "07:15",
    uploadedBy: "ผู้จัดการร้าน อนัญญา",
    orderNumber: "OR-021",
    orderType: "กลับบ้าน",
    items: [{ menuName: "โจ๊กพิเศษ", qty: 2, unitPrice: 70, toppings: [] }],
  },
  {
    id: "ord-022",
    date: "2026-04-18",
    customerName: "คุณจิราพร",
    description: "โต๊ะ 9 - ชุดเครื่องดื่ม น้ำเต้าหู้ 2, ปาท่องโก๋ 2",
    uploadedAt: "08:45",
    uploadedBy: "แม่ครัวใหญ่ สมศรี",
    orderNumber: "OR-022",
    orderType: "ทานที่ร้าน",
    items: [
      { menuName: "น้ำเต้าหู้", qty: 2, unitPrice: 15, toppings: [] },
      { menuName: "ปาท่องโก๋", qty: 2, unitPrice: 5, toppings: [] },
    ],
  },
  {
    id: "ord-023",
    date: "2026-04-19",
    customerName: "คุณธีรภัทร",
    description: "โต๊ะ 2 - ก๋วยจั๊บ 1, โจ๊ก 1 ที่",
    uploadedAt: "07:20",
    uploadedBy: "พนักงานเสิร์ฟ นภา",
    orderNumber: "OR-023",
    orderType: "ทานที่ร้าน",
    items: [
      { menuName: "ก๋วยจั๊บ", qty: 1, unitPrice: 45, toppings: [] },
      { menuName: "โจ๊ก", qty: 1, unitPrice: 40, toppings: [] },
    ],
  },
  {
    id: "ord-024",
    date: "2026-04-19",
    customerName: "คุณนฤมล",
    description: "เดลิเวอรี่ #Grab1301 - ข้าวต้มปลา 1 ที่",
    uploadedAt: "09:05",
    uploadedBy: "ผู้จัดการร้าน อนัญญา",
    orderNumber: "OR-024",
    orderType: "เดลิเวอรี่",
    items: [{ menuName: "ข้าวต้มปลา", qty: 1, unitPrice: 55, toppings: [] }],
  },
];

export const MOCK_EXPENSES: ExpenseItem[] = RAW_ORDERS.map(withAmount);

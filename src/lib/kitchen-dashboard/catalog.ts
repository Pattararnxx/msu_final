import type { Ingredient, MenuItem } from "./types";

// Sample price list and standard recipes for "โจ๊กป้าแดง" — stand-ins for the
// shop-maintained data AGENTS.md requires (prices and recipes must come from
// the shop, never be invented by AI at order time). Quantities are per
// serving; unit costs are what feeds the cost/profit math throughout this
// dashboard.
export const INGREDIENTS: Ingredient[] = [
  // เนื้อสัตว์
  { id: "pork-minced", name: "หมูสับ", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 15000, lowStockThreshold: 3000, initialUnitCost: 0.18 },
  { id: "pork-offal", name: "เครื่องในหมู", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 8000, lowStockThreshold: 1500, initialUnitCost: 0.15 },
  { id: "egg", name: "ไข่ไก่", category: "เนื้อสัตว์", unit: "ฟอง", initialStock: 300, lowStockThreshold: 50, initialUnitCost: 4.5 },
  { id: "chicken-minced", name: "เนื้อไก่สับ", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 10000, lowStockThreshold: 2000, initialUnitCost: 0.14 },

  // ผัก
  { id: "scallion-coriander", name: "ต้นหอม-ผักชี", category: "ผัก", unit: "กรัม", initialStock: 3000, lowStockThreshold: 500, initialUnitCost: 0.08 },
  { id: "pickled-mustard", name: "ผักกาดดอง", category: "ผัก", unit: "กรัม", initialStock: 4000, lowStockThreshold: 600, initialUnitCost: 0.06 },
  { id: "garlic", name: "กระเทียม", category: "ผัก", unit: "กรัม", initialStock: 2000, lowStockThreshold: 400, initialUnitCost: 0.1 },

  // เครื่องปรุง
  { id: "rice", name: "ข้าวสาร", category: "เครื่องปรุง", unit: "กรัม", initialStock: 40000, lowStockThreshold: 6000, initialUnitCost: 0.035 },
  { id: "kuaijab-noodle", name: "เส้นก๋วยจั๊บ", category: "เครื่องปรุง", unit: "กรัม", initialStock: 10000, lowStockThreshold: 1500, initialUnitCost: 0.05 },
  { id: "soy-seasoning", name: "ซีอิ๊ว-เครื่องปรุงรส", category: "เครื่องปรุง", unit: "มิลลิลิตร", initialStock: 8000, lowStockThreshold: 1000, initialUnitCost: 0.05 },
  { id: "pepper-spice", name: "พริกไทย-เครื่องเทศ", category: "เครื่องปรุง", unit: "กรัม", initialStock: 1500, lowStockThreshold: 200, initialUnitCost: 0.3 },

  // บรรจุภัณฑ์ — ถุงร้อน/ช้อนพลาสติก are on every single main-dish order
  // (see MENU_ITEMS below), so their stock is deliberately kept tight
  // relative to a morning session: this shop really is running low on
  // takeout bags by mid-morning, which is exactly what the stock-alert
  // panel exists to catch — not padded out just to avoid an empty state.
  { id: "hot-bag", name: "ถุงร้อน", category: "บรรจุภัณฑ์", unit: "ใบ", initialStock: 65, lowStockThreshold: 55, initialUnitCost: 1.2 },
  { id: "paper-box", name: "กล่องกระดาษ", category: "บรรจุภัณฑ์", unit: "ใบ", initialStock: 500, lowStockThreshold: 80, initialUnitCost: 3.5 },
  { id: "plastic-spoon", name: "ช้อนพลาสติก", category: "บรรจุภัณฑ์", unit: "คัน", initialStock: 70, lowStockThreshold: 60, initialUnitCost: 0.5 },
  { id: "cup-straw", name: "แก้ว+หลอด", category: "บรรจุภัณฑ์", unit: "ชุด", initialStock: 600, lowStockThreshold: 100, initialUnitCost: 2 },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "congee-pork",
    name: "โจ๊กหมู",
    category: "โจ๊ก",
    price: 40,
    recipe: [
      { ingredientId: "rice", qtyPerServing: 150 },
      { ingredientId: "pork-minced", qtyPerServing: 80 },
      { ingredientId: "egg", qtyPerServing: 1 },
      { ingredientId: "scallion-coriander", qtyPerServing: 10 },
      { ingredientId: "soy-seasoning", qtyPerServing: 15 },
      { ingredientId: "hot-bag", qtyPerServing: 1 },
      { ingredientId: "plastic-spoon", qtyPerServing: 1 },
    ],
  },
  {
    id: "congee-preserved-egg",
    name: "โจ๊กไข่เยี่ยวม้า",
    category: "โจ๊ก",
    price: 45,
    recipe: [
      { ingredientId: "rice", qtyPerServing: 150 },
      { ingredientId: "pork-minced", qtyPerServing: 60 },
      { ingredientId: "egg", qtyPerServing: 2 },
      { ingredientId: "scallion-coriander", qtyPerServing: 10 },
      { ingredientId: "soy-seasoning", qtyPerServing: 15 },
      { ingredientId: "hot-bag", qtyPerServing: 1 },
      { ingredientId: "plastic-spoon", qtyPerServing: 1 },
    ],
  },
  {
    id: "riceporridge-pork",
    name: "ข้าวต้มหมู",
    category: "ข้าวต้ม",
    price: 40,
    recipe: [
      { ingredientId: "rice", qtyPerServing: 180 },
      { ingredientId: "pork-minced", qtyPerServing: 90 },
      { ingredientId: "garlic", qtyPerServing: 5 },
      { ingredientId: "scallion-coriander", qtyPerServing: 10 },
      { ingredientId: "soy-seasoning", qtyPerServing: 15 },
      { ingredientId: "hot-bag", qtyPerServing: 1 },
      { ingredientId: "plastic-spoon", qtyPerServing: 1 },
    ],
  },
  {
    id: "riceporridge-chicken",
    name: "ข้าวต้มไก่",
    category: "ข้าวต้ม",
    price: 40,
    recipe: [
      { ingredientId: "rice", qtyPerServing: 180 },
      { ingredientId: "chicken-minced", qtyPerServing: 90 },
      { ingredientId: "garlic", qtyPerServing: 5 },
      { ingredientId: "scallion-coriander", qtyPerServing: 10 },
      { ingredientId: "soy-seasoning", qtyPerServing: 15 },
      { ingredientId: "hot-bag", qtyPerServing: 1 },
      { ingredientId: "plastic-spoon", qtyPerServing: 1 },
    ],
  },
  {
    id: "kuaijab-thick",
    name: "ก๋วยจั๊บน้ำข้น",
    category: "ก๋วยจั๊บ",
    price: 45,
    recipe: [
      { ingredientId: "kuaijab-noodle", qtyPerServing: 120 },
      { ingredientId: "pork-offal", qtyPerServing: 100 },
      { ingredientId: "pepper-spice", qtyPerServing: 5 },
      { ingredientId: "garlic", qtyPerServing: 8 },
      { ingredientId: "hot-bag", qtyPerServing: 1 },
      { ingredientId: "plastic-spoon", qtyPerServing: 1 },
    ],
  },
  {
    id: "kuaijab-clear",
    name: "ก๋วยจั๊บน้ำใส",
    category: "ก๋วยจั๊บ",
    price: 45,
    recipe: [
      { ingredientId: "kuaijab-noodle", qtyPerServing: 120 },
      { ingredientId: "pork-offal", qtyPerServing: 90 },
      { ingredientId: "scallion-coriander", qtyPerServing: 10 },
      { ingredientId: "garlic", qtyPerServing: 8 },
      { ingredientId: "hot-bag", qtyPerServing: 1 },
      { ingredientId: "plastic-spoon", qtyPerServing: 1 },
    ],
  },
  {
    id: "side-boiled-egg",
    name: "ไข่ลวก",
    category: "เครื่องเคียง/เครื่องดื่ม",
    price: 10,
    recipe: [{ ingredientId: "egg", qtyPerServing: 1 }],
  },
  {
    id: "side-pickled-mustard",
    name: "ผักกาดดองเสริม",
    category: "เครื่องเคียง/เครื่องดื่ม",
    price: 10,
    recipe: [{ ingredientId: "pickled-mustard", qtyPerServing: 40 }],
  },
  {
    id: "drink-water",
    name: "น้ำเปล่า/น้ำอัดลม",
    category: "เครื่องเคียง/เครื่องดื่ม",
    price: 15,
    recipe: [{ ingredientId: "cup-straw", qtyPerServing: 1 }],
  },
];

export const MENU_BY_ID = new Map(MENU_ITEMS.map((m) => [m.id, m]));
export const INGREDIENT_BY_ID = new Map(INGREDIENTS.map((i) => [i.id, i]));

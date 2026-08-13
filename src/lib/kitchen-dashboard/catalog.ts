import { MOCK_MENU_ITEMS } from "@/lib/menu/mock-data";
import type { FoodType } from "@/lib/menu/types";
import type { Ingredient, MenuCategory, MenuItem, RecipeLine } from "./types";

// Mock shop-maintained stock and recipes. Sale-facing identity and pricing are
// intentionally not duplicated here: MOCK_MENU_ITEMS is the prototype's price
// list, while this file owns only kitchen quantities and ingredient costs.
export const INGREDIENTS: Ingredient[] = [
  // เนื้อสัตว์
  { id: "pork-minced", name: "หมูสับ", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 15000, lowStockThreshold: 3000, initialUnitCost: 0.18 },
  { id: "pork-sliced", name: "หมูชิ้น", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 9000, lowStockThreshold: 1800, initialUnitCost: 0.19 },
  { id: "crispy-pork", name: "หมูกรอบ", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 6000, lowStockThreshold: 1200, initialUnitCost: 0.28 },
  { id: "pork-offal", name: "เครื่องในหมู", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 8000, lowStockThreshold: 1500, initialUnitCost: 0.15 },
  { id: "chicken", name: "เนื้อไก่", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 10000, lowStockThreshold: 2000, initialUnitCost: 0.14 },
  { id: "sea-bass", name: "ปลากะพง", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 5000, lowStockThreshold: 1000, initialUnitCost: 0.32 },
  { id: "shrimp", name: "กุ้ง", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 4000, lowStockThreshold: 800, initialUnitCost: 0.38 },
  { id: "squid", name: "ปลาหมึก", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 4000, lowStockThreshold: 800, initialUnitCost: 0.3 },
  { id: "clam", name: "หอยลาย", category: "เนื้อสัตว์", unit: "กรัม", initialStock: 3500, lowStockThreshold: 700, initialUnitCost: 0.22 },
  { id: "preserved-egg", name: "ไข่เยี่ยวม้า", category: "เนื้อสัตว์", unit: "ฟอง", initialStock: 180, lowStockThreshold: 30, initialUnitCost: 7 },

  // ผัก
  { id: "scallion-coriander", name: "ต้นหอม-ผักชี", category: "ผัก", unit: "กรัม", initialStock: 3000, lowStockThreshold: 500, initialUnitCost: 0.08 },
  { id: "celery", name: "ขึ้นฉ่าย", category: "ผัก", unit: "กรัม", initialStock: 1800, lowStockThreshold: 300, initialUnitCost: 0.1 },
  { id: "ginger", name: "ขิงซอย", category: "ผัก", unit: "กรัม", initialStock: 2500, lowStockThreshold: 400, initialUnitCost: 0.09 },
  { id: "garlic", name: "กระเทียม", category: "ผัก", unit: "กรัม", initialStock: 2000, lowStockThreshold: 400, initialUnitCost: 0.1 },

  // เครื่องปรุงและเครื่องดื่ม
  { id: "rice", name: "ข้าวสาร", category: "เครื่องปรุง", unit: "กรัม", initialStock: 40000, lowStockThreshold: 6000, initialUnitCost: 0.035 },
  { id: "kuaijab-noodle", name: "เส้นก๋วยจั๊บ", category: "เครื่องปรุง", unit: "กรัม", initialStock: 10000, lowStockThreshold: 1500, initialUnitCost: 0.05 },
  { id: "soy-seasoning", name: "ซีอิ๊ว-เครื่องปรุงรส", category: "เครื่องปรุง", unit: "มิลลิลิตร", initialStock: 8000, lowStockThreshold: 1000, initialUnitCost: 0.05 },
  { id: "pepper-spice", name: "พริกไทย-เครื่องเทศ", category: "เครื่องปรุง", unit: "กรัม", initialStock: 1500, lowStockThreshold: 200, initialUnitCost: 0.3 },
  { id: "fried-dough", name: "แป้งปาท่องโก๋", category: "เครื่องปรุง", unit: "กรัม", initialStock: 7000, lowStockThreshold: 1200, initialUnitCost: 0.04 },
  { id: "frying-oil", name: "น้ำมันทอด", category: "เครื่องปรุง", unit: "มิลลิลิตร", initialStock: 8000, lowStockThreshold: 1500, initialUnitCost: 0.055 },
  { id: "soy-milk", name: "น้ำเต้าหู้", category: "เครื่องปรุง", unit: "มิลลิลิตร", initialStock: 12000, lowStockThreshold: 2000, initialUnitCost: 0.025 },
  { id: "sugar", name: "น้ำตาล", category: "เครื่องปรุง", unit: "กรัม", initialStock: 5000, lowStockThreshold: 800, initialUnitCost: 0.03 },
  { id: "coffee", name: "กาแฟคั่ว", category: "เครื่องปรุง", unit: "กรัม", initialStock: 3000, lowStockThreshold: 500, initialUnitCost: 0.45 },
  { id: "condensed-milk", name: "นมข้น", category: "เครื่องปรุง", unit: "มิลลิลิตร", initialStock: 6000, lowStockThreshold: 1000, initialUnitCost: 0.08 },
  { id: "ice", name: "น้ำแข็ง", category: "เครื่องปรุง", unit: "กรัม", initialStock: 30000, lowStockThreshold: 5000, initialUnitCost: 0.005 },

  // บรรจุภัณฑ์
  { id: "hot-bag", name: "ถุงร้อน", category: "บรรจุภัณฑ์", unit: "ใบ", initialStock: 65, lowStockThreshold: 55, initialUnitCost: 1.2 },
  { id: "paper-box", name: "กล่องกระดาษ", category: "บรรจุภัณฑ์", unit: "ใบ", initialStock: 500, lowStockThreshold: 80, initialUnitCost: 3.5 },
  { id: "plastic-spoon", name: "ช้อนพลาสติก", category: "บรรจุภัณฑ์", unit: "คัน", initialStock: 70, lowStockThreshold: 60, initialUnitCost: 0.5 },
  { id: "cup-straw", name: "แก้ว+หลอด", category: "บรรจุภัณฑ์", unit: "ชุด", initialStock: 600, lowStockThreshold: 100, initialUnitCost: 2 },
];

/** Shop-standard recipe quantities, keyed by the shared sale menu ID. */
export const KITCHEN_RECIPE_BY_MENU_ID: Readonly<Record<string, readonly RecipeLine[]>> = {
  "menu-001": [
    { ingredientId: "rice", qtyPerServing: 180 },
    { ingredientId: "pork-minced", qtyPerServing: 90 },
    { ingredientId: "ginger", qtyPerServing: 5 },
    { ingredientId: "scallion-coriander", qtyPerServing: 10 },
    { ingredientId: "garlic", qtyPerServing: 5 },
    { ingredientId: "soy-seasoning", qtyPerServing: 15 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-002": [
    { ingredientId: "rice", qtyPerServing: 180 },
    { ingredientId: "chicken", qtyPerServing: 90 },
    { ingredientId: "ginger", qtyPerServing: 5 },
    { ingredientId: "scallion-coriander", qtyPerServing: 10 },
    { ingredientId: "garlic", qtyPerServing: 5 },
    { ingredientId: "soy-seasoning", qtyPerServing: 15 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-003": [
    { ingredientId: "rice", qtyPerServing: 180 },
    { ingredientId: "sea-bass", qtyPerServing: 120 },
    { ingredientId: "ginger", qtyPerServing: 6 },
    { ingredientId: "scallion-coriander", qtyPerServing: 10 },
    { ingredientId: "pepper-spice", qtyPerServing: 3 },
    { ingredientId: "soy-seasoning", qtyPerServing: 15 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-004": [
    { ingredientId: "rice", qtyPerServing: 180 },
    { ingredientId: "shrimp", qtyPerServing: 50 },
    { ingredientId: "squid", qtyPerServing: 50 },
    { ingredientId: "clam", qtyPerServing: 50 },
    { ingredientId: "celery", qtyPerServing: 10 },
    { ingredientId: "soy-seasoning", qtyPerServing: 15 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-005": [
    { ingredientId: "rice", qtyPerServing: 150 },
    { ingredientId: "pork-minced", qtyPerServing: 80 },
    { ingredientId: "ginger", qtyPerServing: 5 },
    { ingredientId: "scallion-coriander", qtyPerServing: 10 },
    { ingredientId: "garlic", qtyPerServing: 5 },
    { ingredientId: "soy-seasoning", qtyPerServing: 15 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-006": [
    { ingredientId: "rice", qtyPerServing: 150 },
    { ingredientId: "chicken", qtyPerServing: 80 },
    { ingredientId: "ginger", qtyPerServing: 5 },
    { ingredientId: "scallion-coriander", qtyPerServing: 10 },
    { ingredientId: "soy-seasoning", qtyPerServing: 15 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-007": [
    { ingredientId: "rice", qtyPerServing: 150 },
    { ingredientId: "pork-minced", qtyPerServing: 60 },
    { ingredientId: "preserved-egg", qtyPerServing: 1 },
    { ingredientId: "ginger", qtyPerServing: 5 },
    { ingredientId: "garlic", qtyPerServing: 5 },
    { ingredientId: "soy-seasoning", qtyPerServing: 15 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-008": [
    { ingredientId: "kuaijab-noodle", qtyPerServing: 120 },
    { ingredientId: "crispy-pork", qtyPerServing: 70 },
    { ingredientId: "pork-offal", qtyPerServing: 40 },
    { ingredientId: "pepper-spice", qtyPerServing: 5 },
    { ingredientId: "scallion-coriander", qtyPerServing: 8 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-009": [
    { ingredientId: "kuaijab-noodle", qtyPerServing: 120 },
    { ingredientId: "pork-sliced", qtyPerServing: 90 },
    { ingredientId: "pepper-spice", qtyPerServing: 4 },
    { ingredientId: "scallion-coriander", qtyPerServing: 10 },
    { ingredientId: "garlic", qtyPerServing: 8 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-010": [
    { ingredientId: "kuaijab-noodle", qtyPerServing: 120 },
    { ingredientId: "pork-sliced", qtyPerServing: 50 },
    { ingredientId: "pork-offal", qtyPerServing: 50 },
    { ingredientId: "crispy-pork", qtyPerServing: 40 },
    { ingredientId: "pepper-spice", qtyPerServing: 5 },
    { ingredientId: "hot-bag", qtyPerServing: 1 },
    { ingredientId: "plastic-spoon", qtyPerServing: 1 },
  ],
  "menu-011": [
    { ingredientId: "fried-dough", qtyPerServing: 180 },
    { ingredientId: "frying-oil", qtyPerServing: 30 },
    { ingredientId: "paper-box", qtyPerServing: 1 },
  ],
  "menu-012": [
    { ingredientId: "soy-milk", qtyPerServing: 250 },
    { ingredientId: "sugar", qtyPerServing: 15 },
    { ingredientId: "cup-straw", qtyPerServing: 1 },
  ],
  "menu-013": [
    { ingredientId: "coffee", qtyPerServing: 15 },
    { ingredientId: "condensed-milk", qtyPerServing: 30 },
    { ingredientId: "ice", qtyPerServing: 150 },
    { ingredientId: "cup-straw", qtyPerServing: 1 },
  ],
  "menu-014": [
    { ingredientId: "coffee", qtyPerServing: 15 },
    { ingredientId: "condensed-milk", qtyPerServing: 30 },
    { ingredientId: "cup-straw", qtyPerServing: 1 },
  ],
};

const MENU_CATEGORY_ADAPTER: Record<FoodType, MenuCategory> = {
  ข้าวต้ม: "ข้าวต้ม",
  โจ๊ก: "โจ๊ก",
  ก๋วยจั๊บ: "ก๋วยจั๊บ",
  "อื่นๆ": "เครื่องเคียง/เครื่องดื่ม",
};

const INGREDIENT_IDS = new Set(INGREDIENTS.map((ingredient) => ingredient.id));

function getKitchenRecipe(menuItemId: string): RecipeLine[] {
  const recipe = KITCHEN_RECIPE_BY_MENU_ID[menuItemId];
  if (!recipe) {
    throw new Error(`Missing kitchen recipe for shared menu item: ${menuItemId}`);
  }

  for (const recipeLine of recipe) {
    if (!INGREDIENT_IDS.has(recipeLine.ingredientId)) {
      throw new Error(
        `Unknown ingredient ${recipeLine.ingredientId} in kitchen recipe ${menuItemId}`,
      );
    }
  }

  return recipe.map((recipeLine) => ({ ...recipeLine }));
}

const KITCHEN_PHOTO_BY_MENU_ID: Readonly<Record<string, string>> = {
  "menu-001": "/thai_food/011_0wn-DdavPa4.jpg",
  "menu-002": "/thai_food/015_otLqpb9LK70.jpg",
  "menu-005": "/thai_food/020_mVZ_gjm_TOk.jpg",
  "menu-007": "/thai_food/001_rAyCBQTH7ws.jpg",
  "menu-008": "/thai_food/014_YpfRCe5lda0.jpg",
  "menu-009": "/thai_food/018_zOlQ7lF-3vs.jpg",
};

/**
 * Kitchen view of the shared menu. IDs, names and prices come from the menu
 * mock; recipes remain owned by the shop's kitchen catalog above.
 */
export const MENU_ITEMS: MenuItem[] = MOCK_MENU_ITEMS.map((menuItem) => ({
  id: menuItem.id,
  name: menuItem.name,
  category: MENU_CATEGORY_ADAPTER[menuItem.category],
  price: menuItem.price,
  recipe: getKitchenRecipe(menuItem.id),
  imageUrl: KITCHEN_PHOTO_BY_MENU_ID[menuItem.id],
}));

export const MENU_BY_ID = new Map(MENU_ITEMS.map((menuItem) => [menuItem.id, menuItem]));
export const INGREDIENT_BY_ID = new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]));

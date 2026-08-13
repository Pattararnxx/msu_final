import type { MenuItem, MenuOptionGroup } from "./types";

// Shared across every rice-soup/congee/noodle dish — "ปกติ/พิเศษ" bumps the
// portion up, "ปรับส่วนผสม" are free flags plus a couple of priced add-ons.
function dishOptionGroups(): MenuOptionGroup[] {
  return [
    {
      id: "opt-portion",
      label: "ขนาด",
      selectionType: "single",
      choices: [
        { id: "portion-regular", label: "ปกติ", priceDelta: 0 },
        { id: "portion-special", label: "พิเศษ", priceDelta: 15 },
      ],
    },
    {
      id: "opt-adjust",
      label: "ปรับส่วนผสม",
      selectionType: "multiple",
      choices: [
        { id: "adjust-no-veg", label: "ไม่ผัก", priceDelta: 0 },
        { id: "adjust-no-msg", label: "ไม่ใส่ผงชูรส", priceDelta: 0 },
        { id: "adjust-egg", label: "เพิ่มไข่ลวก", priceDelta: 10 },
      ],
    },
  ];
}

function drinkOptionGroups(): MenuOptionGroup[] {
  return [
    {
      id: "opt-size",
      label: "ขนาด",
      selectionType: "single",
      choices: [
        { id: "size-regular", label: "ปกติ", priceDelta: 0 },
        { id: "size-large", label: "แก้วใหญ่", priceDelta: 10 },
      ],
    },
    {
      id: "opt-adjust",
      label: "ปรับส่วนผสม",
      selectionType: "multiple",
      choices: [
        { id: "adjust-less-sweet", label: "หวานน้อย", priceDelta: 0 },
        { id: "adjust-no-milk", label: "ไม่ใส่นม", priceDelta: 0 },
      ],
    },
  ];
}

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: "menu-001",
    name: "ข้าวต้มหมูสับ",
    category: "ข้าวต้ม",
    image: "/icon/regular/bowl-steam.svg",
    price: 40,
    ingredients: ["ข้าวต้ม", "หมูสับ", "ขิงซอย", "ต้นหอม", "กระเทียมเจียว"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-002",
    name: "ข้าวต้มไก่",
    category: "ข้าวต้ม",
    image: "/icon/regular/bowl-steam.svg",
    price: 40,
    ingredients: ["ข้าวต้ม", "ไก่ฉีก", "ขิงซอย", "ต้นหอม", "กระเทียมเจียว"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-003",
    name: "ข้าวต้มปลากะพง",
    category: "ข้าวต้ม",
    image: "/icon/regular/fish.svg",
    price: 60,
    ingredients: ["ข้าวต้ม", "ปลากะพง", "ขิงซอย", "ต้นหอม", "พริกไทย"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-004",
    name: "ข้าวต้มรวมทะเล",
    category: "ข้าวต้ม",
    image: "/icon/regular/fish.svg",
    price: 70,
    ingredients: ["ข้าวต้ม", "กุ้ง", "ปลาหมึก", "หอยลาย", "ขึ้นฉ่าย"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-005",
    name: "โจ๊กหมู",
    category: "โจ๊ก",
    image: "/icon/regular/bowl-food.svg",
    price: 35,
    ingredients: ["ข้าวโจ๊ก", "หมูสับ", "ขิงซอย", "ต้นหอม", "กระเทียมเจียว"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-006",
    name: "โจ๊กไก่ฉีก",
    category: "โจ๊ก",
    image: "/icon/regular/bowl-food.svg",
    price: 40,
    ingredients: ["ข้าวโจ๊ก", "ไก่ฉีก", "ขิงซอย", "ต้นหอม"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-007",
    name: "โจ๊กไข่เยี่ยวม้า",
    category: "โจ๊ก",
    image: "/icon/regular/egg.svg",
    price: 45,
    ingredients: ["ข้าวโจ๊ก", "หมูสับ", "ไข่เยี่ยวม้า", "ขิงซอย", "กระเทียมเจียว"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-008",
    name: "ก๋วยจั๊บน้ำข้น หมูกรอบ",
    category: "ก๋วยจั๊บ",
    image: "/icon/regular/cooking-pot.svg",
    price: 50,
    ingredients: ["เส้นก๋วยจั๊บ", "หมูกรอบ", "เครื่องในหมู", "พริกไทยดำ", "ต้นหอม"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-009",
    name: "ก๋วยจั๊บน้ำใส หมู",
    category: "ก๋วยจั๊บ",
    image: "/icon/regular/cooking-pot.svg",
    price: 45,
    ingredients: ["เส้นก๋วยจั๊บ", "หมูชิ้น", "พริกไทยดำ", "ต้นหอม", "ผักชี"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-010",
    name: "ก๋วยจั๊บรวม หมู+เครื่องใน",
    category: "ก๋วยจั๊บ",
    image: "/icon/regular/cooking-pot.svg",
    price: 55,
    ingredients: ["เส้นก๋วยจั๊บ", "หมูชิ้น", "เครื่องในหมู", "หมูกรอบ", "พริกไทยดำ"],
    optionGroups: dishOptionGroups(),
  },
  {
    id: "menu-011",
    name: "ปาท่องโก๋ (4 ชิ้น)",
    category: "อื่นๆ",
    image: "/icon/regular/bread.svg",
    price: 20,
    ingredients: ["แป้งปาท่องโก๋", "น้ำมันทอด"],
    optionGroups: [
      {
        id: "opt-adjust",
        label: "ปรับส่วนผสม",
        selectionType: "multiple",
        choices: [
          { id: "adjust-custard", label: "เพิ่มสังขยา", priceDelta: 5 },
          { id: "adjust-condensed-milk", label: "เพิ่มนมข้น", priceDelta: 5 },
        ],
      },
    ],
  },
  {
    id: "menu-012",
    name: "น้ำเต้าหู้",
    category: "อื่นๆ",
    image: "/icon/regular/coffee.svg",
    price: 15,
    ingredients: ["น้ำเต้าหู้", "น้ำตาล"],
    optionGroups: drinkOptionGroups(),
  },
  {
    id: "menu-013",
    name: "กาแฟเย็น",
    category: "อื่นๆ",
    image: "/icon/regular/coffee.svg",
    price: 25,
    ingredients: ["กาแฟคั่ว", "นมข้น", "น้ำแข็ง"],
    optionGroups: drinkOptionGroups(),
  },
  {
    id: "menu-014",
    name: "กาแฟร้อน",
    category: "อื่นๆ",
    image: "/icon/regular/coffee.svg",
    price: 20,
    ingredients: ["กาแฟคั่ว", "นมข้น"],
    optionGroups: drinkOptionGroups(),
  },
];

export function getMenuItem(id: string): MenuItem | undefined {
  return MOCK_MENU_ITEMS.find((item) => item.id === id);
}

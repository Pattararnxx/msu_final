export interface MarketingMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  ingredients: string[];
  options: Array<{
    group: string;
    name: string;
    priceDelta: number;
  }>;
}

export interface MarketingSalesItem {
  menuItemId: string;
  name: string;
  category: string;
  price: number;
  quantitySold: number;
  revenue: number;
  orderCount: number;
}

export interface MarketingMenuCardItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface MarketingSalesCardItem {
  menuItemId: string;
  name: string;
  category: string;
  price: number;
  quantitySold: number;
}

export type MarketingUiBlock =
  | {
      type: "menu_catalog";
      title: string;
      asOf: string;
      items: MarketingMenuCardItem[];
    }
  | {
      type: "sales_insight";
      title: string;
      asOf: string;
      note: string;
      items: MarketingSalesCardItem[];
      recommendedAction: string;
    }
  | {
      type: "bundle_draft";
      title: string;
      asOf: string;
      items: Array<{
        id: string;
        name: string;
        price: number;
      }>;
      regularPrice: number;
      discountPercent: number;
      discountAmount: number;
      proposedPrice: number;
      status: string;
    };

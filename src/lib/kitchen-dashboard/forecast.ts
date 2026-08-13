import { computeRemainingStockValue } from "./engine";
import { INGREDIENTS } from "./catalog";
import type { ComputedOrder, UnitPricePoint } from "./types";

export const FORECAST_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
const HALF_HOUR_MS = 30 * 60 * 1000;

// A small, deterministic lift keeps this demo predictable while making the
// forecast visibly different from the live snapshot. Replace these factors
// with the restaurant's historical weekday model when real data is available.
const DAILY_ORDER_FACTORS = [0.98, 1, 1.02, 1.04, 1.06, 1.08, 1.03];

export interface ForecastStockPoint {
  t: number;
  value: number;
}

export interface ForecastSnapshot {
  orders: ComputedOrder[];
  stockHistory: ForecastStockPoint[];
  stockRemaining: Map<string, number>;
  unitCosts: Map<string, number>;
  unitPriceHistory: Map<string, UnitPricePoint[]>;
}

interface ForecastInput {
  orders: ComputedOrder[];
  stockRemaining: ReadonlyMap<string, number>;
  unitCosts: ReadonlyMap<string, number>;
  unitPriceHistory: ReadonlyMap<string, UnitPricePoint[]>;
  anchor: number;
}

function scale(value: number, factor: number): number {
  return Number((value * factor).toFixed(2));
}

function projectOrder(
  order: ComputedOrder,
  day: number,
  index: number,
  factor: number,
  anchor: number,
): ComputedOrder {
  const itemBreakdown = order.itemBreakdown.map((item) => {
    const qty = Math.max(1, Math.round(item.qty * factor));
    const revenue = scale(item.revenue, factor);
    const cost = scale(item.cost, factor);

    return {
      ...item,
      qty,
      revenue,
      cost,
      profit: revenue - cost,
    };
  });

  const ingredientUsage = order.ingredientUsage.map((usage) => ({
    ...usage,
    qty: scale(usage.qty, factor),
    cost: scale(usage.cost, factor),
  }));

  const revenue = itemBreakdown.reduce((sum, item) => sum + item.revenue, 0);
  const cost = itemBreakdown.reduce((sum, item) => sum + item.cost, 0);

  return {
    ...order,
    id: `FC-${day + 1}-${order.id}`,
    createdAt: anchor + day * DAY_MS + (index % 12) * HALF_HOUR_MS,
    lines: order.lines.map((line) => ({
      ...line,
      qty: Math.max(1, Math.round(line.qty * factor)),
    })),
    menuLabel: itemBreakdown
      .map((item) => (item.qty > 1 ? `${item.menuItemName} x${item.qty}` : item.menuItemName))
      .join(", "),
    itemBreakdown,
    ingredientUsage,
    revenue,
    cost,
    profit: revenue - cost,
  };
}

export function buildForecast({
  orders,
  stockRemaining,
  unitCosts,
  unitPriceHistory,
  anchor,
}: ForecastInput): ForecastSnapshot {
  const forecastOrders = orders.flatMap((order, index) =>
    DAILY_ORDER_FACTORS.map((factor, day) =>
      projectOrder(order, day, index, factor, anchor),
    ),
  );

  const dailyOrderCount = Math.max(1, orders.length);
  const averageUsage = new Map<string, number>();
  for (const order of orders) {
    for (const usage of order.ingredientUsage) {
      averageUsage.set(
        usage.ingredientId,
        (averageUsage.get(usage.ingredientId) ?? 0) + usage.qty,
      );
    }
  }
  for (const [ingredientId, quantity] of averageUsage) {
    averageUsage.set(ingredientId, quantity / dailyOrderCount);
  }

  const forecastStock = new Map(stockRemaining);
  const forecastCosts = new Map(unitCosts);
  const stockHistory: ForecastStockPoint[] = [
    {
      t: anchor,
      value: computeRemainingStockValue(forecastStock, forecastCosts),
    },
  ];

  for (let day = 0; day < FORECAST_DAYS; day++) {
    const demandFactor = DAILY_ORDER_FACTORS[day];
    for (const ingredient of INGREDIENTS) {
      const usage = averageUsage.get(ingredient.id) ?? 0;
      const remaining = forecastStock.get(ingredient.id) ?? ingredient.initialStock;
      const currentCost = forecastCosts.get(ingredient.id) ?? ingredient.initialUnitCost;

      forecastStock.set(
        ingredient.id,
        Math.max(0, remaining - usage * dailyOrderCount * demandFactor),
      );
      forecastCosts.set(ingredient.id, currentCost * (1 + 0.004 * (day + 1)));
    }

    stockHistory.push({
      t: anchor + (day + 1) * DAY_MS,
      value: computeRemainingStockValue(forecastStock, forecastCosts),
    });
  }

  const forecastPrices = new Map<string, UnitPricePoint[]>();
  for (const ingredient of INGREDIENTS) {
    const currentPrice =
      unitCosts.get(ingredient.id) ??
      unitPriceHistory.get(ingredient.id)?.at(-1)?.price ??
      ingredient.initialUnitCost;

    forecastPrices.set(
      ingredient.id,
      Array.from({ length: FORECAST_DAYS + 1 }, (_, day) => ({
        t: anchor + day * DAY_MS,
        price: currentPrice * (1 + 0.004 * day),
      })),
    );
  }

  return {
    orders: forecastOrders,
    stockHistory,
    stockRemaining: forecastStock,
    unitCosts: forecastCosts,
    unitPriceHistory: forecastPrices,
  };
}

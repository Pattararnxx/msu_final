"use client";

import { useEffect, useReducer, useRef } from "react";
import { MOCK_EXPENSES } from "@/lib/expense/mock-data";
import { INGREDIENTS } from "./catalog";
import { computeOrder, generateOrderLines } from "./engine";
import type {
  ComputedOrder,
  Ingredient,
  RawOrder,
  SupplierPriceUpdateEvent,
  UnitPricePoint,
} from "./types";

export interface StockValuePoint {
  t: number;
  value: number;
}

export interface DashboardState {
  /** Chronological, oldest first — trend/stock charts read this order. */
  orders: ComputedOrder[];
  unitCosts: Map<string, number>;
  unitPriceHistory: Map<string, UnitPricePoint[]>;
  priceUpdateEvents: SupplierPriceUpdateEvent[];
  stockRemaining: Map<string, number>;
  stockValueHistory: StockValuePoint[];
  orderSeq: number;
  randomSeed: number;
}

const MOCK_SEED_ORDER_COUNT = 42;
const PRICE_HISTORY_SPAN_MS = 5 * 60 * 60 * 1000;
const DEMO_RANDOM_SEED = 20260813;

function mockOrderTimestamp(order: (typeof MOCK_EXPENSES)[number]): number {
  const timestamp = new Date(order.orderedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : new Date(`${order.date}T${order.uploadedAt}:00`).getTime();
}

/** Latest confirmed mock orders, adapted from expense `quantity` to kitchen `qty`. */
export const CONFIRMED_MOCK_KITCHEN_ORDERS: RawOrder[] = MOCK_EXPENSES.flatMap((order) => {
  if (!order.lineItems || order.lineItems.length === 0) return [];
  return [{
    id: order.id,
    createdAt: mockOrderTimestamp(order),
    lines: order.lineItems.map((line) => ({
      menuItemId: line.menuItemId,
      qty: line.quantity,
    })),
  }];
})
  .sort((a, b) => a.createdAt - b.createdAt)
  .slice(-MOCK_SEED_ORDER_COUNT);

function initialState(): DashboardState {
  const sessionStart = Date.now();
  return {
    orders: [],
    unitCosts: new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient.initialUnitCost])),
    unitPriceHistory: new Map(
      INGREDIENTS.map((ingredient) => [
        ingredient.id,
        [{ t: sessionStart, price: ingredient.initialUnitCost }],
      ]),
    ),
    priceUpdateEvents: [],
    stockRemaining: new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient.initialStock])),
    stockValueHistory: [],
    orderSeq: 0,
    randomSeed: DEMO_RANDOM_SEED,
  };
}

type Action =
  | { type: "SEED"; now: number }
  | { type: "TICK"; at: number };

function nextRandom(seed: number): { seed: number; value: number } {
  const nextSeed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
  return { seed: nextSeed, value: nextSeed / 4_294_967_296 };
}

function applyRawOrder(state: DashboardState, raw: RawOrder): DashboardState {
  const computed = computeOrder(raw, state.unitCosts);
  const stockRemaining = new Map(state.stockRemaining);

  for (const usage of computed.ingredientUsage) {
    const remaining = (stockRemaining.get(usage.ingredientId) ?? 0) - usage.qty;
    stockRemaining.set(usage.ingredientId, Math.max(0, remaining));
  }

  const stockValue = INGREDIENTS.reduce((total, ingredient) => {
    const remaining = stockRemaining.get(ingredient.id) ?? 0;
    const unitCost = state.unitCosts.get(ingredient.id) ?? ingredient.initialUnitCost;
    return total + remaining * unitCost;
  }, 0);

  return {
    ...state,
    orders: [...state.orders, computed],
    stockRemaining,
    stockValueHistory: [...state.stockValueHistory, { t: raw.createdAt, value: stockValue }],
    orderSeq: state.orderSeq + 1,
  };
}

function applyGeneratedOrder(state: DashboardState, at: number): DashboardState {
  let randomSeed = state.randomSeed;
  const rng = () => {
    const next = nextRandom(randomSeed);
    randomSeed = next.seed;
    return next.value;
  };
  const orderSeq = state.orderSeq + 1;
  const raw: RawOrder = {
    id: `KJ-${String(orderSeq).padStart(4, "0")}`,
    createdAt: at,
    lines: generateOrderLines(rng),
  };

  return applyRawOrder({ ...state, randomSeed }, raw);
}

function nudgePrice(
  state: DashboardState,
  ingredient: Ingredient,
  at: number,
): { state: DashboardState; event: SupplierPriceUpdateEvent } {
  const directionRoll = nextRandom(state.randomSeed);
  const magnitudeRoll = nextRandom(directionRoll.seed);
  const fromPrice = state.unitCosts.get(ingredient.id) ?? ingredient.initialUnitCost;
  const direction = directionRoll.value < 0.5 ? -1 : 1;
  const magnitude = 0.04 + magnitudeRoll.value * 0.1;
  const toPrice = Math.max(0.001, Number((fromPrice * (1 + direction * magnitude)).toFixed(4)));

  const unitCosts = new Map(state.unitCosts);
  unitCosts.set(ingredient.id, toPrice);

  const unitPriceHistory = new Map(state.unitPriceHistory);
  const history = unitPriceHistory.get(ingredient.id) ?? [{ t: at - 1, price: fromPrice }];
  unitPriceHistory.set(ingredient.id, [...history, { t: at, price: toPrice }]);

  const event: SupplierPriceUpdateEvent = {
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    at,
    fromPrice,
    toPrice,
  };

  return {
    state: {
      ...state,
      unitCosts,
      unitPriceHistory,
      randomSeed: magnitudeRoll.seed,
    },
    event,
  };
}

function applySupplierUpdate(state: DashboardState, at: number): DashboardState {
  const eligible = INGREDIENTS.filter(
    (ingredient) => (state.stockRemaining.get(ingredient.id) ?? 0) > 0,
  );
  if (eligible.length === 0) return state;

  const selection = nextRandom(state.randomSeed);
  const ingredient = eligible[Math.floor(selection.value * eligible.length)];
  const { state: next, event } = nudgePrice(
    { ...state, randomSeed: selection.seed },
    ingredient,
    at,
  );

  return {
    ...next,
    priceUpdateEvents: [event, ...state.priceUpdateEvents].slice(0, 20),
  };
}

function seedDashboard(state: DashboardState, now: number): DashboardState {
  const slotMs = PRICE_HISTORY_SPAN_MS / Math.max(CONFIRMED_MOCK_KITCHEN_ORDERS.length, 1);
  let next = CONFIRMED_MOCK_KITCHEN_ORDERS.reduce(
    (current, order, index) => applyRawOrder(current, {
      ...order,
      // Keep source IDs and lines, but place the historical mock samples in
      // today's five-hour demo window so "วันนี้" charts remain truthful.
      createdAt: now - PRICE_HISTORY_SPAN_MS + Math.floor(slotMs * (index + 1)),
    }),
    state,
  );
  const events: SupplierPriceUpdateEvent[] = [];

  for (const ingredient of INGREDIENTS) {
    const timestampRoll = nextRandom(next.randomSeed);
    const at = Math.max(
      now - PRICE_HISTORY_SPAN_MS + 60_000,
      now - Math.floor(timestampRoll.value * PRICE_HISTORY_SPAN_MS),
    );
    const result = nudgePrice(
      { ...next, randomSeed: timestampRoll.seed },
      ingredient,
      at,
    );
    next = result.state;
    events.push(result.event);
  }

  return {
    ...next,
    priceUpdateEvents: [...events].reverse().slice(0, 20),
  };
}

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case "SEED":
      return seedDashboard(state, action.now);
    case "TICK": {
      const next = applyGeneratedOrder(state, action.at);
      // A predictable cadence keeps the prototype repeatable while still
      // showing the live supplier-price interaction.
      return next.orderSeq % 8 === 0
        ? applySupplierUpdate(next, action.at)
        : next;
    }
    default:
      return state;
  }
}

const ORDER_INTERVAL_MS = 6000;

/**
 * Seeds from confirmed mock expense orders, then continues with a deterministic
 * local simulation. No API key, external service, or environment variable is
 * needed for the prototype dashboard.
 */
export function useLiveKitchenDashboard(): DashboardState {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    dispatch({ type: "SEED", now: Date.now() });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "TICK", at: Date.now() });
    }, ORDER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return state;
}

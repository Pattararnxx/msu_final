"use client";

import { useEffect, useReducer, useRef } from "react";
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
}

function initialState(): DashboardState {
  const sessionStart = Date.now();
  return {
    orders: [],
    unitCosts: new Map(INGREDIENTS.map((i) => [i.id, i.initialUnitCost])),
    // Seeded with a baseline point per ingredient so the unit-price trend
    // chart always has something to draw, even before any supplier update
    // has fired.
    unitPriceHistory: new Map(
      INGREDIENTS.map((i) => [i.id, [{ t: sessionStart, price: i.initialUnitCost }]]),
    ),
    priceUpdateEvents: [],
    stockRemaining: new Map(INGREDIENTS.map((i) => [i.id, i.initialStock])),
    stockValueHistory: [],
    orderSeq: 0,
  };
}

type Action =
  | { type: "ADD_ORDER"; at: number }
  | { type: "SEED"; count: number; spanMs: number; now: number }
  | { type: "SUPPLIER_UPDATE"; at: number };

function applyOneOrder(state: DashboardState, at: number): DashboardState {
  const orderSeq = state.orderSeq + 1;
  const raw: RawOrder = {
    id: `KJ-${String(orderSeq).padStart(4, "0")}`,
    createdAt: at,
    lines: generateOrderLines(),
  };
  const computed = computeOrder(raw, state.unitCosts);

  const stockRemaining = new Map(state.stockRemaining);
  for (const usage of computed.ingredientUsage) {
    const remaining = (stockRemaining.get(usage.ingredientId) ?? 0) - usage.qty;
    stockRemaining.set(usage.ingredientId, Math.max(0, remaining));
  }

  let stockValue = 0;
  for (const ingredient of INGREDIENTS) {
    const remaining = stockRemaining.get(ingredient.id) ?? 0;
    const unitCost = state.unitCosts.get(ingredient.id) ?? ingredient.initialUnitCost;
    stockValue += remaining * unitCost;
  }

  return {
    ...state,
    orders: [...state.orders, computed],
    stockRemaining,
    stockValueHistory: [...state.stockValueHistory, { t: at, value: stockValue }],
    orderSeq,
  };
}

/** Nudges one ingredient's price and records the point — shared by the
 *  random live "a supplier just texted" event and by seeding (below),
 *  which forces one nudge per ingredient so the unit-price chart is never
 *  empty regardless of which ingredient the viewer picks. */
function nudgePrice(
  state: DashboardState,
  ingredient: Ingredient,
  at: number,
): { state: DashboardState; event: SupplierPriceUpdateEvent } {
  const fromPrice = state.unitCosts.get(ingredient.id) ?? ingredient.initialUnitCost;
  const direction = Math.random() < 0.5 ? -1 : 1;
  const magnitude = 0.04 + Math.random() * 0.1; // 4–14% supplier price move
  const toPrice = Math.max(0.001, Number((fromPrice * (1 + direction * magnitude)).toFixed(4)));

  const unitCosts = new Map(state.unitCosts);
  unitCosts.set(ingredient.id, toPrice);

  const unitPriceHistory = new Map(state.unitPriceHistory);
  const history = unitPriceHistory.get(ingredient.id) ?? [
    { t: at - 1, price: fromPrice },
  ];
  unitPriceHistory.set(ingredient.id, [...history, { t: at, price: toPrice }]);

  const event: SupplierPriceUpdateEvent = {
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    at,
    fromPrice,
    toPrice,
  };

  return { state: { ...state, unitCosts, unitPriceHistory }, event };
}

function applySupplierUpdate(state: DashboardState, at: number): DashboardState {
  const eligible = INGREDIENTS.filter((i) => (state.stockRemaining.get(i.id) ?? 0) > 0);
  if (eligible.length === 0) return state;

  const ingredient = eligible[Math.floor(Math.random() * eligible.length)];
  const { state: next, event } = nudgePrice(state, ingredient, at);

  return {
    ...next,
    priceUpdateEvents: [event, ...state.priceUpdateEvents].slice(0, 20),
  };
}

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case "ADD_ORDER":
      return applyOneOrder(state, action.at);
    case "SUPPLIER_UPDATE":
      return applySupplierUpdate(state, action.at);
    case "SEED": {
      let next = state;
      for (let i = 0; i < action.count; i++) {
        const slot = action.spanMs / action.count;
        const jitter = Math.floor(Math.random() * slot);
        const t = Math.min(
          action.now - action.spanMs + Math.floor(slot * i) + jitter,
          action.now - 1000,
        );
        next = applyOneOrder(next, t);
      }
      // One guaranteed nudge per ingredient — so the unit-price chart has
      // real history no matter which ingredient the viewer selects,
      // instead of showing "no update yet" until the live 12%-per-tick
      // chance happens to land on that one.
      const events: SupplierPriceUpdateEvent[] = [];
      for (const ingredient of INGREDIENTS) {
        const t = Math.max(
          action.now - action.spanMs + 60_000,
          action.now - Math.floor(Math.random() * action.spanMs),
        );
        const result = nudgePrice(next, ingredient, t);
        next = result.state;
        events.push(result.event);
      }
      next = {
        ...next,
        priceUpdateEvents: [...events].reverse().slice(0, 20),
      };
      return next;
    }
    default:
      return state;
  }
}

const ORDER_INTERVAL_MS = 6000;
const SUPPLIER_UPDATE_CHANCE = 0.12;
const SEED_ORDER_COUNT = 42;
const SEED_SPAN_MS = 5 * 60 * 60 * 1000; // pretend the shop opened 5h ago

/**
 * Drives the whole live dashboard. Stands in for a real order-ingestion
 * feed (e.g. an SSE/WebSocket stream off the till) — every order here is
 * already a *confirmed* sale (see the scope note in types.ts), so arrival
 * is what updates every number: no refresh, no "mark as done" click.
 * Orders tick in automatically on an interval, occasionally paired with a
 * simulated supplier price update.
 */
export function useLiveKitchenDashboard(): DashboardState {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    dispatch({ type: "SEED", count: SEED_ORDER_COUNT, spanMs: SEED_SPAN_MS, now: Date.now() });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "ADD_ORDER", at: Date.now() });
      if (Math.random() < SUPPLIER_UPDATE_CHANCE) {
        dispatch({ type: "SUPPLIER_UPDATE", at: Date.now() });
      }
    }, ORDER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return state;
}

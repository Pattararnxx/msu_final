"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";

// Lazy state initialization creates one store per mounted provider without
// reading or mutating a ref during render (which React Compiler rejects).
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}

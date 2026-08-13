"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";

// Lazy initialization keeps one store instance for this provider lifetime
// without reading a ref during render (which React Compiler rejects).
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}

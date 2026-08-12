import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./features/sidebar-slice";

// A factory instead of a module-level singleton — Next.js can run this
// module on the server, and a shared singleton there would leak state
// across requests. StoreProvider (below) calls this once per client tree.
export const makeStore = () =>
  configureStore({
    reducer: {
      sidebar: sidebarReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

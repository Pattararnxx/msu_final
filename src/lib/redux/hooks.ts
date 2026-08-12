import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Typed wrappers so components never need to annotate `state`/`dispatch`
// manually — use these instead of the plain react-redux hooks everywhere.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

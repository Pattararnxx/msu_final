import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Only tracks open/closed — the actual panel content is passed in by
// whoever renders <Sidebar> (as a prop/children), never stored here, since
// React elements aren't serializable and don't belong in the Redux store.
interface SidebarState {
  opened: boolean;
}

const initialState: SidebarState = {
  opened: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    open(state) {
      state.opened = true;
    },
    close(state) {
      state.opened = false;
    },
    toggle(state) {
      state.opened = !state.opened;
    },
    setOpened(state, action: PayloadAction<boolean>) {
      state.opened = action.payload;
    },
  },
});

export const { open, close, toggle, setOpened } = sidebarSlice.actions;
export default sidebarSlice.reducer;

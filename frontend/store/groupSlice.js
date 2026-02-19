import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  refreshKey: 0,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    triggerRefresh: (state) => {
      state.refreshKey += 1;
    },
  },
});

export const { triggerRefresh } = groupSlice.actions;

export default groupSlice.reducer;

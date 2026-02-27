import { configureStore } from "@reduxjs/toolkit";
import groupReducer from "./groupSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    group: groupReducer,
  },
});

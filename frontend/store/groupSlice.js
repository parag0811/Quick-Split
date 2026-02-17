import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  expenses: [],
  settlements: [],
  members: [],
  loading: false,
  error: null,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setExpenses: (state, action) => {
      state.expenses = action.payload;
    },

    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
    },

    removeExpense: (state, action) => {
      state.expenses = state.expenses.filter(
        (exp) => exp._id !== action.payload,
      );
    },
    setSettlements: (state, action) => {
      state.settlements = action.payload;
    },

    addSettlement: (state, action) => {
      state.settlements.unshift(action.payload);
    },

    updateSettlementStatus: (state, action) => {
      const settlement = state.settlements.find(
        (s) => s._id === action.payload,
      );
      if (settlement) {
        settlement.isSettled = true;
      }
    },

    setMembers: (state, action) => {
      state.members = action.payload;
    },

    addMember: (state, action) => {
      state.members.push(action.payload);
    },

    removeMember: (state, action) => {
      state.members = state.members.filter((m) => m._id !== action.payload);
    },
  },
});

export const {
  setExpenses,
  addExpense,
  removeExpense,
  setSettlements,
  addSettlement,
  updateSettlementStatus,
  setMembers,
  addMember,
  removeMember,
} = groupSlice.actions;

export default groupSlice.reducer;
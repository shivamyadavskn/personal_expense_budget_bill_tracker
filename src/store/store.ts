import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slice/authSlice";
import dashboardReducer from "./Slice/dashBoardSlice";
import expenseReducer from "./Slice/ExpenseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    expense: expenseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

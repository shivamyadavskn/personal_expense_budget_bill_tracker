import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboardDataThunk } from "./dashBoardThunks";

const initialState = {
  overview: null as any | null,
  loading: false,
  error: null as string | null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardDataThunk.fulfilled, (state, action) => {
        state.overview = action.payload;
        state.loading = false;
      })
      .addCase(fetchDashboardDataThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export default dashboardSlice.reducer;

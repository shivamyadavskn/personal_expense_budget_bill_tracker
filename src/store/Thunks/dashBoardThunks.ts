import { createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "../../service/dashboard.service";



export const fetchDashboardDataThunk = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardService.getDashboardOverview({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch dashboard data",
      );
    }
  },
);

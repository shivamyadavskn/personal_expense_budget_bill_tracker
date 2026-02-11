import { createSlice } from "@reduxjs/toolkit";
import { loginThunk, checkAuthThunk, logoutThunk } from "../Thunks/authThunks";
import type { User } from "../../types/auth";

interface AuthState {
  user?: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // 🔴 IMPORTANT: start as true
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ================= LOGIN =================
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // ================= CHECK AUTH =================
      .addCase(checkAuthThunk.pending, (state) => {
        state.loading = true; // 🔴 REQUIRED
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false; // 🔴 REQUIRED
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false; // 🔴 REQUIRED
      })

      // ================= LOGOUT =================
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export default authSlice.reducer;

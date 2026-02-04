import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../service/auth.service";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await authService.login({ email, password });
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const checkAuthThunk = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.me();
      return res.data.user;
    } catch {
      return rejectWithValue("Unauthorized");
    }
  },
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

export const userRegistrationThunk = createAsyncThunk<
  any,
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/register", async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const res = await authService.register({
      name, 
      email,
      password,
    });
    return res.data.user;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Registration failed",
    );
  }
});

export const userResetPasswordThunk = createAsyncThunk<
  any,
  { email: string },
  { rejectValue: string }
>("auth/reset-password", async ({ email }, { rejectWithValue }) => {
  try {
    const res = await authService.resetpassword(email);
    return res.data.user;
  } catch (error: any) {
    return rejectWithValue(
      error.response.data.message || "Reset-password Failed",
    );
  }
});

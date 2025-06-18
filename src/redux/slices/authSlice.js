import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../../supabase-client";
import {
  loginUser as loginUserService,
  signUp as signUpService,
} from "../../services/UserListAPI";

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return null;
      }

      const { data: userData, error } = await supabase
        .from("Users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !userData || userData.isDisabled) {
        return null;
      }

      return userData;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUserService({
        email: credentials.email,
        password: credentials.password,
      });

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await signUpService({
        email: userData.email,
        password: userData.password,
        username: userData.username,
        name: userData.name,
      });

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.clear();
      sessionStorage.clear();

      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: null,
    loading: true,
    error: null,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.currentUser = null;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.currentUser = action.payload.userData;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(signOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.currentUser = null;
        state.loading = false;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { setCurrentUser } = authSlice.actions;

export default authSlice.reducer;

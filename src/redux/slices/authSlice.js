import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../../supabase-client";

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

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (error) {
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
      .addCase(signOut.fulfilled, (state) => {
        state.currentUser = null;
      });
  },
});

export const { setCurrentUser } = authSlice.actions;

export default authSlice.reducer;

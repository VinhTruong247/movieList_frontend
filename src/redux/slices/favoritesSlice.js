import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../../supabase-client";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (userId, { rejectWithValue }) => {
    if (!userId) return { favorites: [], syncedFavorites: [] };

    try {
      const { data, error } = await supabase
        .from("Favorites")
        .select(
          `
          movie_id,
          Movies(*)
        `
        )
        .eq("user_id", userId);

      if (error) throw error;

      const formattedFavorites = (data || []).map((item) => ({
        id: item.movie_id,
        ...item.Movies,
      }));

      return formattedFavorites;
    } catch (error) {
      console.error("Error loading favorites:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async ({ movieId, userId }, { rejectWithValue, getState }) => {
    if (!userId) return rejectWithValue("No user logged in");

    try {
      const { data, error } = await supabase.rpc("toggle_favorite", {
        p_user_id: userId,
        p_movie_id: movieId,
      });

      if (error) throw error;

      const state = getState();
      const movieToToggle = state.movies.items.find((m) => m.id === movieId);

      return {
        action: data.action,
        movie: movieToToggle,
        isAdmin: state.auth.currentUser?.role === "admin",
      };
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return rejectWithValue(error.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
    syncedItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.syncedItems = action.payload || [];
        if (!state.items) state.items = [];
        if (!state.syncedItems) state.syncedItems = [];
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { action: toggleAction, movie, isAdmin } = action.payload;

        if (toggleAction === "added" && movie) {
          state.items.push(movie);
        } else if (toggleAction === "removed") {
          state.items = state.items.filter((fav) => fav.id !== movie.id);
        }

        state.syncedItems = isAdmin
          ? [...state.items]
          : state.items.filter((movie) => !movie.isDisabled);
      });
  },
});

export default favoritesSlice.reducer;

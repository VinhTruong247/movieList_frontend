import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../../supabase-client";

export const fetchMovies = createAsyncThunk(
  "movies/fetchMovies",
  async (isAdmin = false, { rejectWithValue }) => {
    try {
      const queryKey = `movies_${isAdmin ? "admin" : "user"}`;
      const query = supabase.from("Movies").select(`
        *,
        MovieGenres!inner(
          genre_id,
          Genres(id, name)
        ),
        MovieDirectors!inner(
          director_id,
          Directors(id, name)
        )
      `);

      if (!isAdmin) {
        query.eq("isDisabled", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading movies:", error);
      return rejectWithValue("Failed to load movies");
    }
  }
);

const moviesSlice = createSlice({
  name: "movies",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setMovies: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { setMovies } = moviesSlice.actions;

export default moviesSlice.reducer;

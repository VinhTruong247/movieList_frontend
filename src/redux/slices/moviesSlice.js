import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../../supabase-client";

export const fetchMovies = createAsyncThunk(
  "movies/fetchMovies",
  async (isAdmin = false, { rejectWithValue }) => {
    try {
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
    filteredItems: [],
    loading: false,
    error: null,
    filters: {
      search: "",
      genre: "all",
      movieType: "all",
      sortType: "all",
    },
    viewMode: "grid",
  },
  reducers: {
    setMovies: (state, action) => {
      state.items = action.payload;
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setGenre: (state, action) => {
      state.filters.genre = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setMovieType: (state, action) => {
      state.filters.movieType = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setSortType: (state, action) => {
      state.filters.sortType = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: "",
        genre: "all",
        movieType: "all",
        sortType: "all",
      };
      state.filteredItems = applyFilters(state);
    },
    applyAllFilters: (state) => {
      state.filteredItems = applyFilters(state);
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
        state.filteredItems = applyFilters(state);
        state.loading = false;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

const applyFilters = (state) => {
  let results = [...state.items];

  if (state.filters.search) {
    const searchText = state.filters.search.toLowerCase();
    results = results.filter((movie) =>
      movie.title?.toLowerCase().includes(searchText)
    );
  }

  if (state.filters.genre !== "all") {
    results = results.filter((movie) => {
      if (!movie.MovieGenres || !Array.isArray(movie.MovieGenres)) {
        return false;
      }
      return movie.MovieGenres.some(
        (genreItem) =>
          genreItem.Genres &&
          genreItem.Genres.name === state.filters.genre &&
          !genreItem.Genres.isDisabled
      );
    });
  }

  if (state.filters.movieType === "Movie") {
    results = results.filter((movie) => movie.type === "Movie");
  } else if (state.filters.movieType === "TV Series") {
    results = results.filter((movie) => movie.type === "TV Series");
  }

  if (state.filters.sortType === "all") {
    results.sort((a, b) => {
      const idA = parseInt(a.id.replace(/-/g, ""), 16) || 0;
      const idB = parseInt(b.id.replace(/-/g, ""), 16) || 0;
      return idA - idB;
    });
  } else if (state.filters.sortType === "top-rated") {
    results.sort((a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0));
  } else if (state.filters.sortType === "latest") {
    results.sort((a, b) => (b.year || 0) - (a.year || 0));
  }

  return results;
};

export const {
  setSearch,
  setGenre,
  setMovieType,
  setSortType,
  setViewMode,
  resetFilters,
  applyAllFilters,
} = moviesSlice.actions;

export default moviesSlice.reducer;

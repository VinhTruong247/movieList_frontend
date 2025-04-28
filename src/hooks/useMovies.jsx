import { useContext, useCallback } from "react";
import { MovieContext } from "../context/MovieContext";
import { fetchMovies } from "../utils/MovieListAPI";

export const useMovies = () => {
  const context = useContext(MovieContext);

  if (!context) {
    throw new Error("useMovies must be used within a MovieProvider");
  }

  const refreshMovies = useCallback(async () => {
    try {
      const movies = await fetchMovies();
      context.setMovies(movies);
      return movies;
    } catch (error) {
      console.error("Error refreshing movies:", error);
      throw error;
    }
  }, [context]);

  return {
    movies: context.movies,
    loading: context.loading,
    error: context.error,
    refreshMovies,
  };
};

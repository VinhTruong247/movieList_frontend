import { useState, useEffect } from "react";
import { getMovies } from "../utils/MovieListAPI";

export const useMovies = (filters = {}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getMovies(filters);
        setMovies(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [filters.title, filters.year, filters.genre]);

  return { movies, loading, error };
};

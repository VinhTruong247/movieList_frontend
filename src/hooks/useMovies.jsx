import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMovies,
  setSearch,
  setGenre,
  setMovieType,
  setSortType,
  setViewMode,
  resetFilters,
} from "../redux/slices/moviesSlice";

export const useMovies = () => {
  const dispatch = useDispatch();

  const allMovies = useSelector((state) => state.movies.items);
  const filteredMovies = useSelector((state) => state.movies.filteredItems);
  const loading = useSelector((state) => state.movies.loading);
  const error = useSelector((state) => state.movies.error);
  const filters = useSelector((state) => state.movies.filters);
  const viewMode = useSelector((state) => state.movies.viewMode);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    dispatch(fetchMovies(isAdmin));
  }, [dispatch, isAdmin]);

  const setSearchQuery = (query) => dispatch(setSearch(query));
  const selectGenre = (genre) => dispatch(setGenre(genre));
  const selectMovieType = (type) => dispatch(setMovieType(type));
  const selectSortType = (sortType) => dispatch(setSortType(sortType));
  const changeViewMode = (mode) => dispatch(setViewMode(mode));
  const clearFilters = () => dispatch(resetFilters());

  return {
    allMovies,
    movies: filteredMovies,
    loading,
    error,
    filters,
    viewMode,
    setSearchQuery,
    selectGenre,
    selectMovieType,
    selectSortType,
    changeViewMode,
    clearFilters,
  };
};

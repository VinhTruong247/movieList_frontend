import { createContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../redux/slices/authSlice";
import { fetchMovies } from "../redux/slices/moviesSlice";
import { fetchFavorites, toggleFavorite } from "../redux/slices/favoritesSlice";
import supabase from "../supabase-client";

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const authLoading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);

  const movies = useSelector((state) => state.movies.items);
  const moviesLoading = useSelector((state) => state.movies.loading);
  const moviesError = useSelector((state) => state.movies.error);

  const favorites = useSelector((state) => state.favorites.items);
  const syncedFavorites = useSelector((state) => state.favorites.syncedItems);
  const favoritesLoading = useSelector((state) => state.favorites.loading);

  useEffect(() => {
    dispatch(fetchCurrentUser());

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          setTimeout(() => {
            dispatch(fetchCurrentUser());
          }, 300);
        }
      }
    );

    return () => {
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      const isAdmin = currentUser?.role === "admin";
      dispatch(fetchMovies(isAdmin));
    }
  }, [currentUser?.role, dispatch]);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchFavorites(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  const handleToggleFavorite = async (movieId) => {
    if (!currentUser) return false;

    const result = await dispatch(
      toggleFavorite({
        movieId,
        userId: currentUser.id,
      })
    );

    return !result.error;
  };

  const refreshMovies = () => {
    if (currentUser) {
      const isAdmin = currentUser?.role === "admin";
      dispatch(fetchMovies(isAdmin));
    }
  };

  const value = {
    movies,
    loading: authLoading || moviesLoading || favoritesLoading,
    error: authError || moviesError,
    currentUser,
    favorites,
    syncedFavorites,
    toggleFavorite: handleToggleFavorite,
    refreshMovies,
  };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};

export default MovieProvider;

import { useSelector, useDispatch } from "react-redux";
import { toggleFavorite } from "../redux/slices/favoritesSlice";
import { useToast } from "./useToast";
import { useState } from "react";

export const useFavorites = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [loadingMovieIds, setLoadingMovieIds] = useState([]);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const favorites = useSelector((state) => state.favorites.items);
  const syncedFavorites = useSelector((state) => state.favorites.syncedItems);
  const loading = useSelector((state) => state.favorites.loading);
  const isLoggedIn = !!currentUser;

  const handleToggleFavorite = async (movieId) => {
    if (!currentUser) return false;

    try {
      setLoadingMovieIds((prev) => [...prev, movieId]);

      const result = await dispatch(
        toggleFavorite({
          movieId,
          userId: currentUser.id,
        })
      ).unwrap();
      if (result.action === "added") {
        toast.success("Movie added to favorites!");
      } else if (result.action === "removed") {
        toast.info("Movie removed from favorites");
      }

      return true;
    } catch (error) {
      toast.error("Error updating favorites");
      return false;
    } finally {
      setLoadingMovieIds((prev) => prev.filter((id) => id !== movieId));
    }
  };

  const isFavorite = (movieId) => {
    return favorites.some((fav) => fav.id === movieId);
  };

  const isTogglingFavorite = (movieId) => {
    return loadingMovieIds.includes(movieId);
  };

  return {
    favorites,
    syncedFavorites,
    toggleFavorite: handleToggleFavorite,
    isFavorite,
    isTogglingFavorite,
    isLoggedIn,
    loadingFavorites: loading,
  };
};

export default useFavorites;

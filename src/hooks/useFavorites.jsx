import { useContext, useState } from "react";
import { MovieContext } from "../context/MovieContext";

export const useFavorites = () => {
  const {
    currentUser,
    toggleFavorite: ctxToggleFavorite,
    favorites,
    syncedFavorites: contextSyncedFavorites,
    loading: contextLoading,
  } = useContext(MovieContext);

  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const isLoggedIn = !!currentUser;

  const isFavorite = (movieId) => {
    return favorites.some((fav) => fav.id === movieId);
  };

  return {
    favorites: contextSyncedFavorites,
    syncedFavorites: contextSyncedFavorites,
    toggleFavorite: ctxToggleFavorite,
    isFavorite,
    isLoggedIn,
    loadingFavorites: contextLoading || loadingFavorites,
  };
};

export default useFavorites;

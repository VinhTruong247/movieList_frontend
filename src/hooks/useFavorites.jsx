import { useContext, useState, useEffect } from "react";
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

  return {
    favorites: contextSyncedFavorites,
    syncedFavorites: contextSyncedFavorites,
    toggleFavorite: ctxToggleFavorite,
    isLoggedIn,
    loadingFavorites: contextLoading || loadingFavorites,
  };
};

export default useFavorites;

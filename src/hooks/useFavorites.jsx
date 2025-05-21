import { useContext, useCallback } from "react";
import { MovieContext } from "../context/MovieContext";

export const useFavorites = () => {
  const {
    currentUser,
    toggleFavorite: ctxToggleFavorite,
    favorites,
  } = useContext(MovieContext);

  const isLoggedIn = !!currentUser;

  const isFavorite = useCallback(
    (movieId) => {
      if (!isLoggedIn) return false;
      return favorites.some((fav) => fav.id === movieId);
    },
    [favorites, isLoggedIn]
  );

  return {
    toggleFavorite: ctxToggleFavorite,
    isFavorite,
    isLoggedIn,
  };
};

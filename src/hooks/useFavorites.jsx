import { useContext } from "react";
import { MovieContext } from "../context/MovieContext";

export const useFavorites = () => {
  const context = useContext(MovieContext);

  if (!context) {
    throw new Error("useFavorites must be used within a MovieProvider");
  }

  const isFavorite = (movieId) => {
    return context.favorites.some((movie) => movie.id === movieId);
  };

  return {
    favorites: context.favorites,
    syncedFavorites: context.syncedFavorites,
    currentUser: context.currentUser,
    addToFavorites: context.addToFavorites,
    removeFromFavorites: context.removeFromFavorites,
    isFavorite,
  };
};

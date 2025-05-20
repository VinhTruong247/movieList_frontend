import { useContext, useCallback } from "react";
import { MovieContext } from "../context/MovieContext";

export const useFavorites = () => {
  const { 
    favorites, 
    currentUser, 
    toggleFavorite, 
    isFavorite 
  } = useContext(MovieContext);

  const handleToggleFavorite = useCallback(async (movieId) => {
    if (!currentUser) {
      return false;
    }
    
    try {
      return await toggleFavorite(movieId);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  }, [currentUser, toggleFavorite]);

  return { 
    favorites, 
    isLoggedIn: !!currentUser, 
    isFavorite, 
    toggleFavorite: handleToggleFavorite 
  };
};

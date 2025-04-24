import { useContext } from 'react';
import { MovieContext } from '../context/MovieContext';

export const useFavorites = () => {
  const context = useContext(MovieContext);

  if (!context) {
    throw new Error('useFavorites must be used within a MovieProvider');
  }

  return {
    favorites: context.favorites,
    addToFavorites: context.addToFavorites,
    removeFromFavorites: context.removeFromFavorites,
    isFavorite: (id) => context.favorites.some((movie) => movie.id === id),
  };
};

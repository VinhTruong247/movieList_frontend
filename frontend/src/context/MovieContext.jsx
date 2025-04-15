import React, { createContext, useState, useEffect, useCallback } from 'react';
import { fetchMovies } from '../utils/MovieListAPI';
import { getCurrentUser, updateUserFavorites } from '../utils/UserListAPI';

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Watch for user changes
  useEffect(() => {
    const handleUserChange = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setFavorites(user?.favorites || []);
    };

    // Listen for auth changes
    window.addEventListener('auth-change', handleUserChange);
    return () => window.removeEventListener('auth-change', handleUserChange);
  }, []);

  // Load movies
  useEffect(() => {
    const getMovies = async () => {
      try {
        const data = await fetchMovies();
        setMovies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getMovies();
  }, []);

  const addToFavorites = useCallback(async (movie) => {
    if (!currentUser) return;

    try {
      const newFavorites = [...favorites, movie];
      await updateUserFavorites(currentUser.id, {
        ...currentUser,
        favorites: newFavorites
      });
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }, [favorites, currentUser]);

  const removeFromFavorites = useCallback(async (movieId) => {
    if (!currentUser) return;

    try {
      const newFavorites = favorites.filter(movie => movie.id !== movieId);
      await updateUserFavorites(currentUser.id, {
        ...currentUser,
        favorites: newFavorites
      });
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }, [favorites, currentUser]);

  return (
    <MovieContext.Provider
      value={{
        movies,
        loading,
        error,
        favorites,
        currentUser,
        addToFavorites,
        removeFromFavorites
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;
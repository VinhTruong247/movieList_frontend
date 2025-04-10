import React, { createContext, useState, useEffect } from 'react';
import { fetchMovies } from '../utils/MovieListAPI';
import { getCurrentUser, updateUserFavorites } from '../utils/UserListAPI';

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const currentUser = getCurrentUser();
  // const [favorites, setFavorites] = useState(() => {
  //   const savedFavorites = localStorage.getItem('favorites');
  //   return savedFavorites ? JSON.parse(savedFavorites) : [];
  // });

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

  useEffect(() => {
    if (currentUser) {
      setFavorites(currentUser.favorites || []);
    }
  }, [currentUser]);

  //This sectiom is commented out to avoid local storage issues with API calls

  // useEffect(() => {
  //   localStorage.setItem('favorites', JSON.stringify(favorites));
  // }, [favorites]);

  // const addToFavorites = (movie) => {
  //   setFavorites(prevFavorites => {
  //     if (!prevFavorites.some(fav => fav.id === movie.id)) {
  //       return [...prevFavorites, movie];
  //     }
  //     return prevFavorites;
  //   });
  // };

  // const removeFromFavorites = (id) => {
  //   setFavorites(prevFavorites =>
  //     prevFavorites.filter(movie => movie.id !== id)
  //   );
  // };

  const addToFavorites = async (movie) => {
    if (!currentUser) return;
    
    try {
      const newFavorites = [...favorites, movie];
      await updateUserFavorites(currentUser.id, {
        ...currentUser,
        favorites: newFavorites
      });
      
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        favorites: newFavorites
      }));
      
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (movieId) => {
    if (!currentUser) return;

    try {
      const newFavorites = favorites.filter(movie => movie.id !== movieId);
      await updateUserFavorites(currentUser.id, {
        ...currentUser,
        favorites: newFavorites
      });
      
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        favorites: newFavorites
      }));
      
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        loading,
        error,
        favorites,
        addToFavorites,
        removeFromFavorites
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
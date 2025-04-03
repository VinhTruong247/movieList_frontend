import React, { createContext, useState, useEffect } from 'react';
import { fetchMovies } from '../utils/MovieListAPI';

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

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
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (movie) => {
    setFavorites(prevFavorites => {
      if (!prevFavorites.some(fav => fav.id === movie.id)) {
        return [...prevFavorites, movie];
      }
      return prevFavorites;
    });
  };

  const removeFromFavorites = (id) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(movie => movie.id !== id)
    );
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
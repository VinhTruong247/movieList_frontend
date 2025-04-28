import React, { createContext, useState, useEffect, useCallback } from "react";
import { fetchMovies } from "../utils/MovieListAPI";
import { getCurrentUser, updateUserFavorites } from "../utils/UserListAPI";

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [favorites, setFavorites] = useState(getCurrentUser()?.favorites || []);
  const [userUpdate, setUserUpdate] = useState(0);

  useEffect(() => {
    const handleUserChange = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      if (user && user.favorites) {
        setFavorites(user.favorites);
      } else {
        setFavorites([]);
      }
    };
    handleUserChange();

    window.addEventListener("auth-change", handleUserChange);
    return () => window.removeEventListener("auth-change", handleUserChange);
  }, []);

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
    if (currentUser && favorites.length >= 0) {
      const updatedUser = { ...currentUser, favorites };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [favorites, currentUser]);

  const addToFavorites = useCallback(
    async (movie) => {
      if (!currentUser) return;

      try {
        const newFavorites = [...favorites, movie];
        await updateUserFavorites(currentUser.id, {
          ...currentUser,
          favorites: newFavorites,
        });
        setFavorites(newFavorites);
      } catch (error) {
        console.error("Error adding to favorites:", error);
        throw error;
      }
    },
    [favorites, currentUser]
  );

  const removeFromFavorites = useCallback(
    async (movieId) => {
      if (!currentUser) return;

      try {
        const newFavorites = favorites.filter((movie) => movie.id !== movieId);
        await updateUserFavorites(currentUser.id, {
          ...currentUser,
          favorites: newFavorites,
        });
        setFavorites(newFavorites);
      } catch (error) {
        console.error("Error removing from favorites:", error);
        throw error;
      }
    },
    [favorites, currentUser]
  );

  const refreshUserData = useCallback(() => {
    const freshUser = getCurrentUser();
    setCurrentUser(freshUser);
    setUserUpdate((prev) => prev + 1);
  }, []);

  return (
    <MovieContext.Provider
      value={{
        movies,
        loading,
        error,
        favorites,
        currentUser,
        addToFavorites,
        removeFromFavorites,
        refreshUserData,
        userUpdate,
        setMovies,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;

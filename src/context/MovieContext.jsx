import React, { createContext, useState, useEffect, useCallback } from "react";
import { fetchMovies, fetchAllMoviesForAdmin } from "../utils/MovieListAPI";
import { getCurrentUser, updateUserFavorites } from "../utils/UserListAPI";

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [favorites, setFavorites] = useState(getCurrentUser()?.favorites || []);
  const [userUpdate, setUserUpdate] = useState(0);
  const [syncedFavorites, setSyncedFavorites] = useState([]);

  useEffect(() => {
    const handleUserChange = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      if (user && user.favorites) {
        setFavorites(user.favorites);
      } else {
        setFavorites([]);
      }
      loadMoviesBasedOnUserRole(user);
    };

    handleUserChange();

    window.addEventListener("auth-change", handleUserChange);
    return () => window.removeEventListener("auth-change", handleUserChange);
  }, []);

  const loadMoviesBasedOnUserRole = async (user) => {
    setLoading(true);
    try {
      let data;
      if (user && user.role === "admin") {
        data = await fetchAllMoviesForAdmin();
      } else {
        data = await fetchMovies(false);
      }
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoviesBasedOnUserRole(currentUser);
  }, []);

  useEffect(() => {
    if (favorites.length > 0 && movies.length > 0) {
      const updated = favorites.map((favorite) => {
        const currentMovie = movies.find((m) => m.id === favorite.id);
        return currentMovie || favorite;
      });
      const filtered =
        currentUser?.role === "admin"
          ? updated
          : updated.filter((movie) => !movie.isDisable);

      setSyncedFavorites(filtered);
    } else {
      setSyncedFavorites([]);
    }
  }, [favorites, movies, currentUser]);

  const syncFavoritesWithCompleteData = useCallback(async () => {
    if (!currentUser || favorites.length === 0) return;

    try {
      const allMovies = await fetchAllMoviesForAdmin();

      const updatedFavorites = favorites.map((favorite) => {
        const currentMovie = allMovies.find((m) => m.id === favorite.id);
        return currentMovie || favorite;
      });

      setFavorites(updatedFavorites);

      const updatedUser = { ...currentUser, favorites: updatedFavorites };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      const filtered =
        currentUser.role === "admin"
          ? updatedFavorites
          : updatedFavorites.filter((movie) => !movie.isDisable);

      setSyncedFavorites(filtered);

      await updateUserFavorites(currentUser.id, updatedUser);
    } catch (error) {
      console.error("Error syncing favorites:", error);
    }
  }, [currentUser, favorites]);

  const refreshMovies = useCallback(async () => {
    try {
      await loadMoviesBasedOnUserRole(currentUser);
      await syncFavoritesWithCompleteData();
      return movies;
    } catch (error) {
      console.error("Error refreshing movies:", error);
      throw error;
    }
  }, [currentUser, loadMoviesBasedOnUserRole, syncFavoritesWithCompleteData]);

  useEffect(() => {
    syncFavoritesWithCompleteData();
  }, [syncFavoritesWithCompleteData, userUpdate]);

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
    loadMoviesBasedOnUserRole(freshUser);
  }, []);

  return (
    <MovieContext.Provider
      value={{
        movies,
        loading,
        error,
        favorites,
        syncedFavorites,
        currentUser,
        addToFavorites,
        removeFromFavorites,
        refreshUserData,
        refreshMovies,
        userUpdate,
        setMovies,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;

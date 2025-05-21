import { createContext, useState, useEffect, useCallback } from "react";
import supabase from "../supabase-client";
import { getCurrentUser } from "../utils/UserListAPI";

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [syncedFavorites, setSyncedFavorites] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const userData = await getCurrentUser();

        if (isMounted) {
          setCurrentUser(userData?.userData || null);
          if (userData?.userData?.id) {
            await loadUserFavorites(userData.userData.id);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        if (isMounted) setLoading(false);
      }
    };

    loadUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          loadUserData();
        } else if (event === "SIGNED_OUT") {
          if (isMounted) {
            setCurrentUser(null);
            setFavorites([]);
            setSyncedFavorites([]);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserFavorites = async (userId) => {
    try {
      const { data, error: favError } = await supabase
        .from("Favorites")
        .select(
          `
          movie_id,
          Movies (
            id, 
            title, 
            poster_url, 
            year, 
            imdb_rating,
            isDisabled
          )
        `
        )
        .eq("user_id", userId);

      if (favError) throw favError;
      const formattedFavorites = data.map((item) => ({
        id: item.movie_id,
        ...item.Movies,
      }));

      setFavorites(formattedFavorites);
      const filteredForDisplay =
        currentUser?.role === "admin"
          ? formattedFavorites
          : formattedFavorites.filter((movie) => !movie.isDisabled);

      setSyncedFavorites(filteredForDisplay);
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  const loadMoviesBasedOnUserRole = async (user) => {
    try {
      let query = supabase.from("Movies").select("*");

      if (!user || user.role !== "admin") {
        query = query.eq("isDisabled", false);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMovies(data);
      setError(null);
    } catch (err) {
      console.error("Error loading movies:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadMoviesBasedOnUserRole(currentUser);
    } else {
      loadMoviesBasedOnUserRole(null);
    }
  }, [currentUser]);

  const toggleFavorite = useCallback(
    async (movieId) => {
      if (!currentUser) return;

      try {
        const { data: existingFav, error: checkError } = await supabase
          .from("Favorites")
          .select("*")
          .eq("movie_id", movieId)
          .eq("user_id", currentUser.id);
        if (checkError) throw checkError;
        if (existingFav && existingFav.length > 0) {
          const { error: deleteError } = await supabase
            .from("Favorites")
            .delete()
            .eq("movie_id", movieId)
            .eq("user_id", currentUser.id);

          if (deleteError) throw deleteError;

          const newFavorites = favorites.filter((fav) => fav.id !== movieId);
          setFavorites(newFavorites);
          setSyncedFavorites(
            currentUser.role === "admin"
              ? newFavorites
              : newFavorites.filter((movie) => !movie.isDisabled)
          );
          return false;
        } else {
          const { error: insertError } = await supabase
            .from("Favorites")
            .insert([
              {
                movie_id: movieId,
                user_id: currentUser.id,
              },
            ]);

          if (insertError) throw insertError;
          const { data: movieData, error: movieError } = await supabase
            .from("Movies")
            .select("*")
            .eq("id", movieId)
            .single();

          if (movieError) throw movieError;
          const newFavorites = [...favorites, movieData];
          setFavorites(newFavorites);

          if (currentUser.role === "admin" || !movieData.isDisabled) {
            setSyncedFavorites([...syncedFavorites, movieData]);
          }
          return true;
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        throw error;
      }
    },
    [currentUser, favorites, syncedFavorites]
  );

  const isFavorite = useCallback(
    (movieId) => {
      return favorites.some((fav) => fav.id === movieId);
    },
    [favorites]
  );

  const refreshMovies = useCallback(async () => {
    if (currentUser) {
      await loadMoviesBasedOnUserRole(currentUser);
      await loadUserFavorites(currentUser.id);
    } else {
      await loadMoviesBasedOnUserRole(null);
    }
  }, [currentUser]);

  const checkSessionValidity = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session && currentUser) {
      setCurrentUser(null);
      setFavorites([]);
      setSyncedFavorites([]);
      window.location.href = "/login";
    }
  }, [currentUser]);

  return (
    <MovieContext.Provider
      value={{
        movies,
        loading,
        error,
        favorites: syncedFavorites,
        currentUser,
        toggleFavorite,
        isFavorite,
        refreshMovies,
        checkSessionValidity,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;

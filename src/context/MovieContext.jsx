import { createContext, useState, useEffect, useCallback, useRef } from "react";
import supabase from "../supabase-client";

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [syncedFavorites, setSyncedFavorites] = useState([]);

  const pendingRequests = useRef({});
  const fetchData = useCallback(async (key, fetcher) => {
    if (pendingRequests.current[key]) {
      return pendingRequests.current[key];
    }
    pendingRequests.current[key] = fetcher();

    try {
      const result = await pendingRequests.current[key];
      return result;
    } finally {
      delete pendingRequests.current[key];
    }
  }, []);

  const loadMoviesBasedOnUserRole = useCallback(
    async (user) => {
      setLoading(true);
      try {
        const isAdmin = user?.role === "admin";
        const queryKey = `movies_${isAdmin ? "admin" : "user"}`;
        const data = await fetchData(queryKey, async () => {
          const query = supabase.from("Movies").select(
            `
            *,
            MovieGenres!inner(
              genre_id,
              Genres(id, name)
            ),
            MovieDirectors!inner(
              director_id,
              Directors(id, name)
            )
          `
          );
          if (!isAdmin) {
            query.eq("isDisabled", false);
          }

          const { data, error } = await query;
          if (error) throw error;
          return data;
        });

        setMovies(data || []);
      } catch (err) {
        console.error("Error loading movies:", err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    },
    [fetchData]
  );

  const loadUserFavorites = useCallback(
    async (userId) => {
      if (!userId) return;

      try {
        const queryKey = `favorites_${userId}`;
        const data = await fetchData(queryKey, async () => {
          const { data, error } = await supabase
            .from("Favorites")
            .select(
              `
            movie_id,
            Movies(*)
          `
            )
            .eq("user_id", userId);

          if (error) throw error;
          return data;
        });

        if (data) {
          const formattedFavorites = data.map((item) => ({
            id: item.movie_id,
            ...item.Movies,
          }));

          setFavorites(formattedFavorites);
          setSyncedFavorites(
            currentUser?.role === "admin"
              ? formattedFavorites
              : formattedFavorites.filter((movie) => !movie.isDisabled)
          );
        }
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    },
    [fetchData, currentUser?.role]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            setCurrentUser(null);
            setLoading(false);
          }
          return;
        }

        const { data: userData, error } = await supabase
          .from("Users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!error && userData && !userData.isDisabled) {
          if (isMounted) {
            setCurrentUser(userData);
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);

        if (event === "SIGNED_IN" && session) {
          setTimeout(() => {
            if (isMounted) {
              fetchCurrentUser();
            }
          }, 300);
        } else if (event === "SIGNED_OUT") {
          if (isMounted) {
            setCurrentUser(null);
            setFavorites([]);
            setSyncedFavorites([]);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMoviesBasedOnUserRole(currentUser);
    }
  }, [currentUser?.role, loadMoviesBasedOnUserRole]);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserFavorites(currentUser.id);
    } else {
      setFavorites([]);
      setSyncedFavorites([]);
    }
  }, [currentUser?.id, loadUserFavorites]);

  const toggleFavorite = useCallback(
    async (movieId) => {
      if (!currentUser) return false;

      try {
        const { data, error } = await supabase.rpc("toggle_favorite", {
          p_user_id: currentUser.id,
          p_movie_id: movieId,
        });

        if (error) throw error;

        if (data.action === "added") {
          const movieToAdd = movies.find((m) => m.id === movieId);
          if (movieToAdd) {
            const newFavorites = [...favorites, movieToAdd];
            setFavorites(newFavorites);

            if (currentUser.role === "admin" || !movieToAdd.isDisabled) {
              setSyncedFavorites([...syncedFavorites, movieToAdd]);
            }
          }
          return true;
        } else {
          const newFavorites = favorites.filter((fav) => fav.id !== movieId);
          setFavorites(newFavorites);
          setSyncedFavorites(
            syncedFavorites.filter((fav) => fav.id !== movieId)
          );
          return false;
        }
      } catch (err) {
        console.error("Error toggling favorite:", err);
        return null;
      }
    },
    [currentUser, movies, favorites, syncedFavorites]
  );

  const refreshMovies = useCallback(async () => {
    if (currentUser) {
      await loadMoviesBasedOnUserRole(currentUser);
    }
  }, [currentUser, loadMoviesBasedOnUserRole]);

  const value = {
    movies,
    loading,
    error,
    currentUser,
    favorites,
    syncedFavorites,
    toggleFavorite,
    setCurrentUser,
    setMovies,
    refreshMovies,
  };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};

export default MovieProvider;

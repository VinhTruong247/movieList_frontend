import { useContext, useCallback, useEffect, useState } from "react";
import { MovieContext } from "../context/MovieContext";
import { getUserFavorites } from "../utils/FarvoritesAPI";
import { getMovieById } from "../utils/MovieListAPI";

export const useFavorites = () => {
  const {
    currentUser,
    toggleFavorite: ctxToggleFavorite,
    favorites,
    loading,
  } = useContext(MovieContext);

  const [syncedFavorites, setSyncedFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const isLoggedIn = !!currentUser;

  useEffect(() => {
    const syncFavorites = async () => {
      if (isLoggedIn && currentUser?.id) {
        setLoadingFavorites(true);
        try {
          let favoritesToProcess = [];

          if (!favorites || favorites.length === 0) {
            const userFavorites = await getUserFavorites(currentUser.id);
            favoritesToProcess = userFavorites
              .map((fav) => {
                return fav.Movies || { id: fav.movie_id };
              })
              .filter(Boolean);
          } else {
            favoritesToProcess = favorites;
          }
          const needDetailsMovies = favoritesToProcess.filter(
            (movie) => !movie.overview || !movie.genres
          );
          const completeMovies = favoritesToProcess.filter(
            (movie) => movie.overview && movie.genres
          );
          const fetchedDetails = await Promise.all(
            needDetailsMovies.map(async (movie) => {
              try {
                const details = await getMovieById(movie.id);
                return { ...movie, ...details };
              } catch (error) {
                console.error(
                  `Error fetching details for movie ${movie.id}:`,
                  error
                );
                return movie;
              }
            })
          );

          setSyncedFavorites([...completeMovies, ...fetchedDetails]);
        } catch (error) {
          console.error("Error syncing favorites:", error);
        } finally {
          setLoadingFavorites(false);
        }
      } else {
        setSyncedFavorites([]);
      }
    };

    if (!loading) {
      syncFavorites();
    }
  }, [currentUser, favorites, isLoggedIn, loading]);

  const isFavorite = useCallback(
    (movieId) => {
      if (!isLoggedIn) return false;
      return syncedFavorites.some((fav) => fav.id === movieId);
    },
    [syncedFavorites, isLoggedIn]
  );

  return {
    toggleFavorite: ctxToggleFavorite,
    isFavorite,
    isLoggedIn,
    syncedFavorites,
    loadingFavorites,
  };
};

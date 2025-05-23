import { useContext, useCallback, useEffect, useState } from "react";
import { MovieContext } from "../context/MovieContext";
import { getUserFavorites } from "../services/FarvoritesAPI";

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
    if (
      !loading &&
      isLoggedIn &&
      currentUser?.id &&
      (!favorites || favorites.length === 0)
    ) {
      const syncFavorites = async () => {
        setLoadingFavorites(true);
        try {
          const userFavorites = await getUserFavorites(currentUser.id);
          if (userFavorites && userFavorites.length > 0) {
            const formattedFavorites = userFavorites.map((item) => ({
              id: item.movie_id,
              ...item.Movies,
            }));
            setSyncedFavorites(formattedFavorites);
          }
        } catch (error) {
          console.error("Error syncing favorites:", error);
        } finally {
          setLoadingFavorites(false);
        }
      };

      syncFavorites();
    } else {
      setSyncedFavorites(favorites);
    }
  }, [loading, isLoggedIn, currentUser?.id, favorites]);

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

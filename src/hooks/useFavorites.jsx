import { useSelector, useDispatch } from "react-redux";
import { toggleFavorite } from "../redux/slices/favoritesSlice";
import { useToast } from "./useToast";

export const useFavorites = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const favorites = useSelector((state) => state.favorites.items);
  const syncedFavorites = useSelector((state) => state.favorites.syncedItems);
  const loading = useSelector((state) => state.favorites.loading);
  const isLoggedIn = !!currentUser;

  const handleToggleFavorite = async (movieId) => {
    if (!currentUser) return false;

    try {
      const result = await dispatch(
        toggleFavorite({
          movieId,
          userId: currentUser.id,
        })
      ).unwrap();
      if (result.action === "added") {
        toast.success("Movie added to favorites!");
      } else if (result.action === "removed") {
        toast.info("Movie removed from favorites");
      }

      return true;
    } catch (error) {
      toast.error("Error updating favorites");
      return false;
    }
  };

  const isFavorite = (movieId) => {
    return favorites.some((fav) => fav.id === movieId);
  };

  return {
    favorites,
    syncedFavorites,
    toggleFavorite: handleToggleFavorite,
    isFavorite,
    isLoggedIn,
    loadingFavorites: loading,
  };
};

export default useFavorites;

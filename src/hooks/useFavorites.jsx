import { useSelector, useDispatch } from "react-redux";
import { toggleFavorite } from "../redux/slices/favoritesSlice";

export const useFavorites = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const favorites = useSelector((state) => state.favorites.items);
  const syncedFavorites = useSelector((state) => state.favorites.syncedItems);
  const loading = useSelector((state) => state.favorites.loading);
  const isLoggedIn = !!currentUser;

  const handleToggleFavorite = async (movieId) => {
    if (!currentUser) return false;

    const result = await dispatch(
      toggleFavorite({
        movieId,
        userId: currentUser.id,
      })
    );

    return !result.error;
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

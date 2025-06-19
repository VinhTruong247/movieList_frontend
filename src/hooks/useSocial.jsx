import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  followUser,
  unfollowUser,
  fetchFollowers,
  fetchFollowing,
  checkFollowingStatus,
  createSharedList,
  fetchSharedLists,
  addMovieToList,
  removeMovieFromList,
  deleteSharedList,
  fetchPublicLists,
  clearError,
  clearSuccessMessage,
  optimisticFollow,
  optimisticUnfollow,
} from "../redux/slices/socialSlice";
import { useToast } from "./useToast";

export const useSocial = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const {
    followers,
    following,
    followingStatus,
    followersLoading,
    followingLoading,
    followActionLoading,
    userLists,
    publicLists,
    listsLoading,
    listActionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.social);

  const handleFollowUser = useCallback(
    async (followeeId, followeeData) => {
      if (!currentUser) {
        toast.error("Please log in to follow users");
        return false;
      }

      try {
        dispatch(optimisticFollow({ followeeId, followeeData }));
        const result = await dispatch(
          followUser({
            followerId: currentUser.id,
            followeeId,
            followeeData,
          })
        ).unwrap();

        toast.success(
          `Now following ${followeeData?.name || followeeData?.username}`
        );
        return true;
      } catch (error) {
        dispatch(optimisticUnfollow({ followeeId }));
        toast.error("Failed to follow user");
        return false;
      }
    },
    [currentUser, dispatch, toast]
  );

  const handleUnfollowUser = useCallback(
    async (followeeId) => {
      if (!currentUser) return false;

      try {
        dispatch(optimisticUnfollow({ followeeId }));
        await dispatch(
          unfollowUser({
            followerId: currentUser.id,
            followeeId,
          })
        ).unwrap();

        toast.success("Unfollowed successfully");
        return true;
      } catch (error) {
        toast.error("Failed to unfollow user");
        return false;
      }
    },
    [currentUser, dispatch, toast]
  );

  const isFollowing = useCallback(
    (userId) => {
      return followingStatus[userId] || false;
    },
    [followingStatus]
  );

  const handleCreateList = useCallback(
    async (title, description = "", isPublic = true) => {
      if (!currentUser) {
        toast.error("Please log in to create lists");
        return null;
      }

      try {
        const result = await dispatch(
          createSharedList({
            userId: currentUser.id,
            title,
            description,
            isPublic,
          })
        ).unwrap();

        toast.success("List created successfully!");
        return result;
      } catch (error) {
        toast.error("Failed to create list");
        return null;
      }
    },
    [currentUser, dispatch, toast]
  );

  const handleAddMovieToList = useCallback(
    async (listId, movieId, movieData) => {
      try {
        await dispatch(
          addMovieToList({
            listId,
            movieId,
            movieData,
          })
        ).unwrap();

        toast.success("Movie added to list!");
        return true;
      } catch (error) {
        toast.error("Failed to add movie to list");
        return false;
      }
    },
    [dispatch, toast]
  );

  const handleRemoveMovieFromList = useCallback(
    async (listId, movieId) => {
      try {
        await dispatch(
          removeMovieFromList({
            listId,
            movieId,
          })
        ).unwrap();

        toast.success("Movie removed from list!");
        return true;
      } catch (error) {
        toast.error("Failed to remove movie from list");
        return false;
      }
    },
    [dispatch, toast]
  );

  const handleDeleteList = useCallback(
    async (listId) => {
      try {
        await dispatch(deleteSharedList(listId)).unwrap();
        toast.success("List deleted successfully!");
        return true;
      } catch (error) {
        toast.error("Failed to delete list");
        return false;
      }
    },
    [dispatch, toast]
  );

  const loadUserSocialData = useCallback(
    async (userId) => {
      if (!userId) return;

      try {
        await Promise.all([
          dispatch(fetchFollowers(userId)),
          dispatch(fetchFollowing(userId)),
          dispatch(
            fetchSharedLists({
              userId,
              includePrivate: currentUser?.id === userId,
            })
          ),
        ]);
      } catch (error) {
        console.error("Error loading social data:", error);
      }
    },
    [currentUser, dispatch]
  );

  const loadPublicLists = useCallback(
    async (limit = 20) => {
      try {
        await dispatch(fetchPublicLists(limit));
      } catch (error) {
        console.error("Error loading public lists:", error);
      }
    },
    [dispatch]
  );

  const checkUserFollowingStatus = useCallback(
    async (followeeId) => {
      if (!currentUser || !followeeId) return;

      try {
        await dispatch(
          checkFollowingStatus({
            followerId: currentUser.id,
            followeeId,
          })
        );
      } catch (error) {
        console.error("Error checking following status:", error);
      }
    },
    [currentUser, dispatch]
  );

  return {
    followers,
    following,
    userLists,
    publicLists,
    followersLoading,
    followingLoading,
    followActionLoading,
    listsLoading,
    listActionLoading,
    error,
    successMessage,
    handleFollowUser,
    handleUnfollowUser,
    isFollowing,
    handleCreateList,
    handleAddMovieToList,
    handleRemoveMovieFromList,
    handleDeleteList,
    loadUserSocialData,
    loadPublicLists,
    checkUserFollowingStatus,

    clearError: () => dispatch(clearError()),
    clearSuccessMessage: () => dispatch(clearSuccessMessage()),
  };
};

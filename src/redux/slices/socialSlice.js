import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  followUser as followUserAPI,
  unfollowUser as unfollowUserAPI,
  getFollowers as getFollowersAPI,
  getFollowing as getFollowingAPI,
  checkIfFollowing as checkIfFollowingAPI,
  createSharedList as createSharedListAPI,
  getSharedLists as getSharedListsAPI,
  addMovieToSharedList as addMovieToSharedListAPI,
  removeMovieFromSharedList as removeMovieFromSharedListAPI,
  deleteSharedList as deleteSharedListAPI,
} from "../../services/SocialAPI";

export const followUser = createAsyncThunk(
  "social/followUser",
  async ({ followerId, followeeId, followeeData }, { rejectWithValue }) => {
    try {
      await followUserAPI(followerId, followeeId);
      return { followeeId, followeeData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "social/unfollowUser",
  async ({ followerId, followeeId }, { rejectWithValue }) => {
    try {
      await unfollowUserAPI(followerId, followeeId);
      return { followeeId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  "social/fetchFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const followers = await getFollowersAPI(userId);
      return followers;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  "social/fetchFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const following = await getFollowingAPI(userId);
      return following;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkFollowingStatus = createAsyncThunk(
  "social/checkFollowingStatus",
  async ({ followerId, followeeId }, { rejectWithValue }) => {
    try {
      const isFollowing = await checkIfFollowingAPI(followerId, followeeId);
      return { followeeId, isFollowing };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSharedList = createAsyncThunk(
  "social/createSharedList",
  async ({ userId, title, description, isPublic }, { rejectWithValue }) => {
    try {
      const newList = await createSharedListAPI(
        userId,
        title,
        description,
        isPublic
      );
      return newList;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSharedLists = createAsyncThunk(
  "social/fetchSharedLists",
  async ({ userId, includePrivate }, { rejectWithValue }) => {
    try {
      const lists = await getSharedListsAPI(userId, includePrivate);
      return { userId, lists };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMovieToList = createAsyncThunk(
  "social/addMovieToList",
  async ({ listId, movieId, movieData }, { rejectWithValue }) => {
    try {
      await addMovieToSharedListAPI(listId, movieId);
      return { listId, movieId, movieData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeMovieFromList = createAsyncThunk(
  "social/removeMovieFromList",
  async ({ listId, movieId }, { rejectWithValue }) => {
    try {
      await removeMovieFromSharedListAPI(listId, movieId);
      return { listId, movieId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSharedList = createAsyncThunk(
  "social/deleteSharedList",
  async (listId, { rejectWithValue }) => {
    try {
      await deleteSharedListAPI(listId);
      return listId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicLists = createAsyncThunk(
  "social/fetchPublicLists",
  async (limit = 20, { rejectWithValue }) => {
    try {
      const lists = await getSharedListsAPI(null, true);
      return lists.slice(0, limit);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const socialSlice = createSlice({
  name: "social",
  initialState: {
    followers: [],
    following: [],
    followingStatus: {},
    followersLoading: false,
    followingLoading: false,
    followActionLoading: false,
    userLists: [],
    publicLists: [],
    listsLoading: false,
    listActionLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setFollowingStatus: (state, action) => {
      const { userId, isFollowing } = action.payload;
      state.followingStatus[userId] = isFollowing;
    },
    resetSocialState: (state) => {
      state.followers = [];
      state.following = [];
      state.followingStatus = {};
      state.userLists = [];
      state.error = null;
      state.successMessage = null;
    },
    optimisticFollow: (state, action) => {
      const { followeeId, followeeData } = action.payload;
      state.followingStatus[followeeId] = true;
      state.following.push({
        followee_id: followeeId,
        Users: followeeData,
        followed_at: new Date().toISOString(),
      });
    },
    optimisticUnfollow: (state, action) => {
      const { followeeId } = action.payload;
      state.followingStatus[followeeId] = false;
      state.following = state.following.filter(
        (follow) => follow.followee_id !== followeeId
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(followUser.pending, (state) => {
        state.followActionLoading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followActionLoading = false;
        const { followeeId, followeeData } = action.payload;
        state.followingStatus[followeeId] = true;

        const existingFollow = state.following.find(
          (follow) => follow.followee_id === followeeId
        );
        if (!existingFollow) {
          state.following.push({
            followee_id: followeeId,
            Users: followeeData,
            followed_at: new Date().toISOString(),
          });
        }

        state.successMessage = `Now following ${followeeData?.name || followeeData?.username}`;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.followActionLoading = false;
        state.error = action.payload;
      })
      .addCase(unfollowUser.pending, (state) => {
        state.followActionLoading = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followActionLoading = false;
        const { followeeId } = action.payload;
        state.followingStatus[followeeId] = false;
        state.following = state.following.filter(
          (follow) => follow.followee_id !== followeeId
        );
        state.successMessage = "Unfollowed successfully";
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.followActionLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFollowers.pending, (state) => {
        state.followersLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followersLoading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.followersLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFollowing.pending, (state) => {
        state.followingLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.followingLoading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.followingLoading = false;
        state.error = action.payload;
      })
      .addCase(checkFollowingStatus.fulfilled, (state, action) => {
        const { followeeId, isFollowing } = action.payload;
        state.followingStatus[followeeId] = isFollowing;
      })
      .addCase(createSharedList.pending, (state) => {
        state.listActionLoading = true;
        state.error = null;
      })
      .addCase(createSharedList.fulfilled, (state, action) => {
        state.listActionLoading = false;
        state.userLists.unshift(action.payload);
        state.successMessage = "List created successfully!";
      })
      .addCase(createSharedList.rejected, (state, action) => {
        state.listActionLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSharedLists.pending, (state) => {
        state.listsLoading = true;
        state.error = null;
      })
      .addCase(fetchSharedLists.fulfilled, (state, action) => {
        state.listsLoading = false;
        const { userId, lists } = action.payload;
        state.userLists = lists;
      })
      .addCase(fetchSharedLists.rejected, (state, action) => {
        state.listsLoading = false;
        state.error = action.payload;
      })
      .addCase(addMovieToList.pending, (state) => {
        state.listActionLoading = true;
        state.error = null;
      })
      .addCase(addMovieToList.fulfilled, (state, action) => {
        state.listActionLoading = false;
        const { listId, movieId, movieData } = action.payload;
        const listIndex = state.userLists.findIndex(
          (list) => list.id === listId
        );
        if (listIndex !== -1) {
          if (!state.userLists[listIndex].SharedListMovies) {
            state.userLists[listIndex].SharedListMovies = [];
          }
          state.userLists[listIndex].SharedListMovies.push({
            movie_id: movieId,
            Movies: movieData,
          });
        }

        state.successMessage = "Movie added to list!";
      })
      .addCase(addMovieToList.rejected, (state, action) => {
        state.listActionLoading = false;
        state.error = action.payload;
      })
      .addCase(removeMovieFromList.pending, (state) => {
        state.listActionLoading = true;
        state.error = null;
      })
      .addCase(removeMovieFromList.fulfilled, (state, action) => {
        state.listActionLoading = false;
        const { listId, movieId } = action.payload;
        const listIndex = state.userLists.findIndex(
          (list) => list.id === listId
        );
        if (listIndex !== -1 && state.userLists[listIndex].SharedListMovies) {
          state.userLists[listIndex].SharedListMovies = state.userLists[
            listIndex
          ].SharedListMovies.filter((item) => item.movie_id !== movieId);
        }

        state.successMessage = "Movie removed from list!";
      })
      .addCase(removeMovieFromList.rejected, (state, action) => {
        state.listActionLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteSharedList.pending, (state) => {
        state.listActionLoading = true;
        state.error = null;
      })
      .addCase(deleteSharedList.fulfilled, (state, action) => {
        state.listActionLoading = false;
        const listId = action.payload;
        state.userLists = state.userLists.filter((list) => list.id !== listId);
        state.successMessage = "List deleted successfully!";
      })
      .addCase(deleteSharedList.rejected, (state, action) => {
        state.listActionLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPublicLists.pending, (state) => {
        state.listsLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicLists.fulfilled, (state, action) => {
        state.listsLoading = false;
        state.publicLists = action.payload;
      })
      .addCase(fetchPublicLists.rejected, (state, action) => {
        state.listsLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  setFollowingStatus,
  resetSocialState,
  optimisticFollow,
  optimisticUnfollow,
} = socialSlice.actions;

export default socialSlice.reducer;

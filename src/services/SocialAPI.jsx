import supabase from "../supabase-client";

export const followUser = async (followerId, followeeId) => {
  const { data, error } = await supabase
    .from("Followers")
    .insert([
      {
        follower_id: followerId,
        followee_id: followeeId,
        followed_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

export const unfollowUser = async (followerId, followeeId) => {
  const { error } = await supabase
    .from("Followers")
    .delete()
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId);

  if (error) throw error;
  return true;
};

export const getFollowers = async (userId) => {
  const { data, error } = await supabase
    .from("Followers")
    .select(
      `
      follower_id,
      followed_at,
      user_public_profiles!Followers_follower_id_fkey (
        id,
        username,
        name,
        avatar_url
      )
    `
    )
    .eq("followee_id", userId);

  if (error) throw error;
  return data || [];
};

export const getFollowing = async (userId) => {
  const { data, error } = await supabase
    .from("Followers")
    .select(
      `
      followee_id,
      followed_at,
      user_public_profiles!Followers_followee_id_fkey (
        id,
        username,
        name,
        avatar_url
      )
    `
    )
    .eq("follower_id", userId);

  if (error) throw error;
  return data || [];
};

export const checkIfFollowing = async (followerId, followeeId) => {
  const { data, error } = await supabase
    .from("Followers")
    .select("*")
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
};

export const createSharedList = async (
  userId,
  title,
  description = null,
  isPublic = true
) => {
  const { data, error } = await supabase
    .from("SharedList")
    .insert([
      {
        user_id: userId,
        title,
        description,
        isPublic: isPublic,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSharedListById = async (listId) => {
  try {
    const { data, error } = await supabase
      .from("SharedList")
      .select(`
        *,
        user_public_profiles!SharedList_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        ),
        SharedListMovies (
          movie_id,
          Movies (
            id,
            title,
            description,
            year,
            country,
            language,
            imdb_rating,
            runtime,
            poster_url,
            banner_url,
            trailer_url,
            type,
            MovieGenres (
              Genres (
                id,
                name
              )
            )
          )
        )
      `)
      .eq("id", listId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching shared list:", error);
      throw error;
    }

    if (data && data.SharedListMovies) {
      data.SharedListMovies = data.SharedListMovies.map((item) => ({
        ...item,
        Movies: {
          ...item.Movies,
          genres: item.Movies.MovieGenres?.map((mg) => mg.Genres) || [],
        },
      }));
    }

    return data;
  } catch (error) {
    console.error("Error in getSharedListById:", error);
    throw error;
  }
};

export const getSharedLists = async (userId, publicOnly = false) => {
  try {
    let query = supabase
      .from("SharedList")
      .select(`
        *,
        user_public_profiles!SharedList_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        ),
        SharedListMovies (
          movie_id,
          Movies (
            id,
            title,
            poster_url,
            year,
            imdb_rating,
            MovieGenres (
              Genres (
                id,
                name
              )
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (publicOnly) {
      query = query.eq("isPublic", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching shared lists:", error);
      throw error;
    }

    const transformedData = (data || []).map((list) => ({
      ...list,
      SharedListMovies:
        list.SharedListMovies?.map((item) => ({
          ...item,
          Movies: {
            ...item.Movies,
            genres: item.Movies.MovieGenres?.map((mg) => mg.Genres) || [],
          },
        })) || [],
    }));

    return transformedData;
  } catch (error) {
    console.error("Error in getSharedLists:", error);
    throw error;
  }
};

export const updateSharedList = async (listId, updateData) => {
  try {
    const { data, error } = await supabase
      .from("SharedList")
      .update({
        title: updateData.title,
        description: updateData.description,
        is_public: updateData.isPublic,
      })
      .eq("id", listId)
      .select()
      .single();

    if (error) {
      console.error("Error updating shared list:", error);
      throw error;
    }

    if (data) {
      data.isPublic = data.is_public;
      delete data.is_public;
    }

    return data;
  } catch (error) {
    console.error("Error in updateSharedList:", error);
    throw error;
  }
};

export const addMovieToSharedList = async (listId, movieId) => {
  try {
    const { data, error } = await supabase
      .from("SharedListMovies")
      .insert({
        list_id: listId,
        movie_id: movieId,
      })
      .select();

    if (error) {
      console.error("Error adding movie to shared list:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in addMovieToSharedList:", error);
    throw error;
  }
};

export const removeMovieFromSharedList = async (listId, movieId) => {
  try {
    const { error } = await supabase
      .from("SharedListMovies")
      .delete()
      .eq("list_id", listId)
      .eq("movie_id", movieId);

    if (error) {
      console.error("Error removing movie from shared list:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in removeMovieFromSharedList:", error);
    throw error;
  }
};

export const deleteSharedList = async (listId) => {
  try {
    const { error: moviesError } = await supabase
      .from("SharedListMovies")
      .delete()
      .eq("list_id", listId);

    if (moviesError) {
      console.error("Error deleting shared list movies:", moviesError);
      throw moviesError;
    }

    const { error: listError } = await supabase
      .from("SharedList")
      .delete()
      .eq("id", listId);

    if (listError) {
      console.error("Error deleting shared list:", listError);
      throw listError;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteSharedList:", error);
    throw error;
  }
};

export const searchUsers = async (options = {}) => {
  try {
    const { query, userIds, followeeId, sortBy, limit = 20 } = options;

    let queryBuilder = supabase
      .from("user_public_profiles")
      .select("id, username, name, avatar_url");
    if (query) {
      const searchTerm = `%${query.toLowerCase().trim()}%`;

      queryBuilder = queryBuilder.or(
        `name.ilike.${searchTerm},username.ilike.${searchTerm}`
      );
    }

    if (userIds && userIds.length > 0) {
      queryBuilder = queryBuilder.in("id", userIds);
    }

    if (followeeId) {
      const { data: followerIds } = await supabase
        .from("Followers")
        .select("follower_id")
        .eq("followee_id", followeeId);

      if (followerIds && followerIds.length > 0) {
        const ids = followerIds.map((item) => item.follower_id);
        queryBuilder = queryBuilder.in("id", ids);
      } else {
        return [];
      }
    }

    if (sortBy === "followers") {
      const { data: popularUsers } = await supabase
        .from("user_public_profiles")
        .select("id, username, name, avatar_url")
        .order("id", { ascending: false })
        .limit(limit);

      return popularUsers || [];
    }

    queryBuilder = queryBuilder.limit(limit);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Search error details:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

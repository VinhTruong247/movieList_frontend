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
        isPublic,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSharedLists = async (userId = null, isPublic = null) => {
  let query = supabase.from("SharedList").select(`
      *,
      Users (
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
          poster_url
        )
      )
    `);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (isPublic !== null) {
    query = query.eq("isPublic", isPublic);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const addMovieToSharedList = async (listId, movieId) => {
  const { data, error } = await supabase
    .from("SharedListMovies")
    .insert([
      {
        list_id: listId,
        movie_id: movieId,
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

export const removeMovieFromSharedList = async (listId, movieId) => {
  const { error } = await supabase
    .from("SharedListMovies")
    .delete()
    .eq("list_id", listId)
    .eq("movie_id", movieId);

  if (error) throw error;
  return true;
};

export const deleteSharedList = async (listId) => {
  await supabase.from("SharedListMovies").delete().eq("list_id", listId);

  const { error } = await supabase.from("SharedList").delete().eq("id", listId);

  if (error) throw error;
  return true;
};

export const updateSharedList = async (listId, updates) => {
  const { data, error } = await supabase
    .from("SharedList")
    .update(updates)
    .eq("id", listId)
    .select()
    .single();

  if (error) throw error;
  return data;
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

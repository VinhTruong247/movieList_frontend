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
    .select(`
      follower_id,
      followed_at,
      Users!Followers_follower_id_fkey (
        id,
        username,
        name,
        avatar_url
      )
    `)
    .eq("followee_id", userId);

  if (error) throw error;
  return data || [];
};

export const getFollowing = async (userId) => {
  const { data, error } = await supabase
    .from("Followers")
    .select(`
      followee_id,
      followed_at,
      Users!Followers_followee_id_fkey (
        id,
        username,
        name,
        avatar_url
      )
    `)
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

export const createSharedList = async (userId, title, description = null, isPublic = true) => {
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
  let query = supabase
    .from("SharedList")
    .select(`
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
  await supabase
    .from("SharedListMovies")
    .delete()
    .eq("list_id", listId);

  const { error } = await supabase
    .from("SharedList")
    .delete()
    .eq("id", listId);

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
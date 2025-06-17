import supabase from "../supabase-client";

export const toggleFavorite = async (movieId, userId) => {
  const { data: existing, error: checkError } = await supabase
    .from("Favorites")
    .select("*")
    .eq("movie_id", movieId)
    .eq("user_id", userId);
  if (checkError) throw checkError;
  if (existing && existing.length > 0) {
    const { error: deleteError } = await supabase
      .from("Favorites")
      .delete()
      .eq("movie_id", movieId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;
    return { favorited: false };
  }
  const { error: insertError } = await supabase
    .from("Favorites")
    .insert([{ movie_id: movieId, user_id: userId }]);

  if (insertError) throw insertError;
  return { favorited: true };
};

export const getUserFavorites = async (userId) => {
  const { data, error } = await supabase
    .from("Favorites")
    .select(
      `
      movie_id,
      Movies (
        id, 
        title, 
        poster_url, 
        year, 
        imdb_rating,
        type
      )
    `
    )
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};

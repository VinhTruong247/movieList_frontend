import supabase from "../supabase-client";

export const addReview = async (movieId, userId, rating, comment) => {
  const { data, error } = await supabase
    .from("Reviews")
    .insert([
      {
        movie_id: movieId,
        user_id: userId,
        rating,
        comment,
        created_at: new Date(),
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

export const updateReview = async (reviewId, rating, comment) => {
  const { data, error } = await supabase
    .from("Reviews")
    .update({
      rating,
      comment,
    })
    .eq("id", reviewId)
    .select();

  if (error) throw error;
  return data;
};

export const deleteReview = async (reviewId) => {
  const { error } = await supabase.from("Reviews").delete().eq("id", reviewId);

  if (error) throw error;
  return true;
};

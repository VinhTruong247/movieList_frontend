import supabase from "../supabase-client";

export const getAllGenres = async (includeDisabled = false) => {
  let query = supabase.from("Genres").select("*").order("name");

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const getAdminGenres = async () => {
  return getAllGenres(true);
};

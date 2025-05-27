import supabase from "../supabase-client";

export const getAllActors = async (includeDisabled = false) => {
  let query = supabase.from("Actors").select("*").order("name");

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const getAdminActors = async () => {
  return getAllActors(true);
};

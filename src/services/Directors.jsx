import supabase from "../supabase-client";

export const getAllDirectors = async (includeDisabled = false) => {
  let query = supabase.from("Directors").select("*").order("name");

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const getAdminDirectors = async () => {
  return getAllDirectors(true);
};

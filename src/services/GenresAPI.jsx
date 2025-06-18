import supabase from "../supabase-client";

export const getAllGenres = async (includeDisabled = false) => {
  try {
    let query = supabase.from("Genres").select("*").order("name");
    if (!includeDisabled) {
      query = query.eq("isDisabled", false);
    }
    const { data, error } = await query;

    if (error) {
      console.error("GenresAPI error:", error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error("GenresAPI catch block:", err);
    throw err;
  }
};
export const getAdminGenres = async () => {
  return getAllGenres(true);
};

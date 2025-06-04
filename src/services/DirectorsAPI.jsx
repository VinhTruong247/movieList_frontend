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

export const getDirectorById = async (id) => {
  const { data, error } = await supabase
    .from("Directors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Director not found");
    }
    throw error;
  }

  return data;
};

export const createDirector = async (directorData) => {
  const { data, error } = await supabase
    .from("Directors")
    .insert([
      {
        name: directorData.name,
        biography: directorData.biography || null,
        nationality: directorData.nationality || null,
        image_url: directorData.imageUrl || null,
        isDisabled: directorData.isDisabled || false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDirector = async (id, directorData) => {
  const { data, error } = await supabase
    .from("Directors")
    .update({
      name: directorData.name,
      biography: directorData.biography || null,
      nationality: directorData.nationality || null,
      image_url: directorData.imageUrl || null,
      isDisabled: directorData.isDisabled || false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDirector = async (id) => {
  const { data: movieDirectors, error: checkError } = await supabase
    .from("MovieDirectors")
    .select("id")
    .eq("director_id", id)
    .limit(1);

  if (checkError) throw checkError;

  if (movieDirectors && movieDirectors.length > 0) {
    throw new Error(
      "Cannot delete director. This director is associated with movies. Please remove the director from all movies first or disable the director instead."
    );
  }

  const { error } = await supabase.from("Directors").delete().eq("id", id);

  if (error) throw error;
  return true;
};

export const toggleDirectorStatus = async (id, isDisabled) => {
  const { data, error } = await supabase
    .from("Directors")
    .update({
      isDisabled: isDisabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const searchDirectors = async (searchTerm, includeDisabled = false) => {
  let query = supabase
    .from("Directors")
    .select("*")
    .ilike("name", `%${searchTerm}%`)
    .order("name");

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const getDirectorsWithMovieCount = async (includeDisabled = false) => {
  let query = supabase
    .from("Directors")
    .select(
      `
      *,
      MovieDirectors(count)
    `
    )
    .order("name");

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((director) => ({
    ...director,
    movieCount: director.MovieDirectors?.[0]?.count || 0,
  }));
};

export const getDirectorMovies = async (
  directorId,
  includeDisabled = false
) => {
  let query = supabase
    .from("MovieDirectors")
    .select(
      `
      Movies(
        id,
        title,
        year,
        poster_url,
        imdb_rating,
        type,
        runtime,
        MovieGenres(
          Genres(*)
        )
      )
    `
    )
    .eq("director_id", directorId);

  const { data, error } = await query;

  if (error) throw error;

  const movies = (data || [])
    .map((item) => item.Movies)
    .filter((movie) => movie !== null);

  if (!includeDisabled) {
    return movies.filter((movie) => !movie.isDisabled);
  }

  return movies;
};

export const checkDirectorNameExists = async (name, excludeId = null) => {
  let query = supabase.from("Directors").select("id, name").ilike("name", name);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data && data.length > 0;
};

export const getDirectorsByNationality = async (
  nationality,
  includeDisabled = false
) => {
  let query = supabase
    .from("Directors")
    .select("*")
    .ilike("nationality", nationality)
    .order("name");

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const getDirectorsStats = async () => {
  const { data: totalDirectors, error: totalError } = await supabase
    .from("Directors")
    .select("id", { count: "exact" });

  const { data: activeDirectors, error: activeError } = await supabase
    .from("Directors")
    .select("id", { count: "exact" })
    .eq("isDisabled", false);

  const { data: disabledDirectors, error: disabledError } = await supabase
    .from("Directors")
    .select("id", { count: "exact" })
    .eq("isDisabled", true);

  if (totalError || activeError || disabledError) {
    throw totalError || activeError || disabledError;
  }

  return {
    total: totalDirectors?.length || 0,
    active: activeDirectors?.length || 0,
    disabled: disabledDirectors?.length || 0,
  };
};

export const batchUpdateDirectors = async (directorIds, updateData) => {
  const { data, error } = await supabase
    .from("Directors")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .in("id", directorIds)
    .select();

  if (error) throw error;
  return data;
};

export const getMostProlificDirectors = async (
  limit = 10,
  includeDisabled = false
) => {
  let query = supabase.from("Directors").select(`
      *,
      MovieDirectors(count)
    `);

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || [])
    .map((director) => ({
      ...director,
      movieCount: director.MovieDirectors?.[0]?.count || 0,
    }))
    .sort((a, b) => b.movieCount - a.movieCount)
    .slice(0, limit);
};

export default {
  getAllDirectors,
  getAdminDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
  toggleDirectorStatus,
  searchDirectors,
  getDirectorsWithMovieCount,
  getDirectorMovies,
  checkDirectorNameExists,
  getDirectorsByNationality,
  getDirectorsStats,
  getMostProlificDirectors,
};

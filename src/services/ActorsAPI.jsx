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

export const getActorById = async (id) => {
  const { data, error } = await supabase
    .from("Actors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Actor not found");
    }
    throw error;
  }

  return data;
};

export const createActor = async (actorData) => {
  const { data, error } = await supabase
    .from("Actors")
    .insert([
      {
        name: actorData.name,
        biography: actorData.biography || null,
        nationality: actorData.nationality || null,
        image_url: actorData.imageUrl || null,
        isDisabled: actorData.isDisabled || false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateActor = async (id, actorData) => {
  const { data, error } = await supabase
    .from("Actors")
    .update({
      name: actorData.name,
      biography: actorData.biography || null,
      nationality: actorData.nationality || null,
      image_url: actorData.imageUrl || null,
      isDisabled: actorData.isDisabled || false,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteActor = async (id) => {
  const { data: movieActors, error: checkError } = await supabase
    .from("MovieActors")
    .select("id")
    .eq("actor_id", id)
    .limit(1);

  if (checkError) throw checkError;

  if (movieActors && movieActors.length > 0) {
    throw new Error(
      "Cannot delete actor. This actor is associated with movies. Please remove the actor from all movies first or disable the actor instead."
    );
  }

  const { error } = await supabase.from("Actors").delete().eq("id", id);

  if (error) throw error;
  return true;
};

export const toggleActorStatus = async (id, isDisabled) => {
  const { data, error } = await supabase
    .from("Actors")
    .update({
      isDisabled: isDisabled,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const searchActors = async (searchTerm, includeDisabled = false) => {
  let query = supabase
    .from("Actors")
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

export const getActorsWithMovieCount = async (includeDisabled = false) => {
  let query = supabase
    .from("Actors")
    .select(
      `
      *,
      MovieActors(count)
    `
    )
    .order("name");

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((actor) => ({
    ...actor,
    movieCount: actor.MovieActors?.[0]?.count || 0,
  }));
};

export const getActorMovies = async (actorId, includeDisabled = false) => {
  let query = supabase
    .from("MovieActors")
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
    .eq("actor_id", actorId);
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

export const checkActorNameExists = async (name, excludeId = null) => {
  let query = supabase.from("Actors").select("id, name").ilike("name", name);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data && data.length > 0;
};

export const getActorsByNationality = async (
  nationality,
  includeDisabled = false
) => {
  let query = supabase
    .from("Actors")
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

export const getActorsStats = async () => {
  const { data: totalActors, error: totalError } = await supabase
    .from("Actors")
    .select("id", { count: "exact" });

  const { data: activeActors, error: activeError } = await supabase
    .from("Actors")
    .select("id", { count: "exact" })
    .eq("isDisabled", false);

  const { data: disabledActors, error: disabledError } = await supabase
    .from("Actors")
    .select("id", { count: "exact" })
    .eq("isDisabled", true);

  if (totalError || activeError || disabledError) {
    throw totalError || activeError || disabledError;
  }

  return {
    total: totalActors?.length || 0,
    active: activeActors?.length || 0,
    disabled: disabledActors?.length || 0,
  };
};

export const getMostProlificActors = async (
  limit = 10,
  includeDisabled = false
) => {
  let query = supabase.from("Actors").select(`
      *,
      MovieActors(count)
    `);

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || [])
    .map((actor) => ({
      ...actor,
      movieCount: actor.MovieActors?.[0]?.count || 0,
    }))
    .sort((a, b) => b.movieCount - a.movieCount)
    .slice(0, limit);
};

export const getActorsByGenre = async (genreId, includeDisabled = false) => {
  let query = supabase
    .from("MovieActors")
    .select(
      `
      Actors(*),
      Movies!inner(
        MovieGenres!inner(
          genre_id
        )
      )
    `
    )
    .eq("Movies.MovieGenres.genre_id", genreId);

  const { data, error } = await query;

  if (error) throw error;

  const actorsMap = new Map();

  (data || []).forEach((item) => {
    if (item.Actors) {
      const actor = item.Actors;
      if (!includeDisabled && actor.isDisabled) return;

      if (!actorsMap.has(actor.id)) {
        actorsMap.set(actor.id, actor);
      }
    }
  });

  return Array.from(actorsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

export const getCoStars = async (actorId, limit = 10) => {
  const { data, error } = await supabase
    .from("MovieActors")
    .select(
      `
      movie_id,
      Movies(
        MovieActors(
          Actors(*)
        )
      )
    `
    )
    .eq("actor_id", actorId);

  if (error) throw error;

  const coStarsMap = new Map();

  (data || []).forEach((movieData) => {
    if (movieData.Movies?.MovieActors) {
      movieData.Movies.MovieActors.forEach((ma) => {
        if (ma.Actors && ma.Actors.id !== actorId && !ma.Actors.isDisabled) {
          const coStarId = ma.Actors.id;
          if (coStarsMap.has(coStarId)) {
            coStarsMap.get(coStarId).collaborations++;
          } else {
            coStarsMap.set(coStarId, {
              ...ma.Actors,
              collaborations: 1,
            });
          }
        }
      });
    }
  });

  return Array.from(coStarsMap.values())
    .sort((a, b) => b.collaborations - a.collaborations)
    .slice(0, limit);
};

export const getRecentActors = async (limit = 5, includeDisabled = false) => {
  let query = supabase
    .from("Actors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!includeDisabled) {
    query = query.eq("isDisabled", false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export default {
  getAllActors,
  getAdminActors,
  getActorById,
  createActor,
  updateActor,
  deleteActor,
  toggleActorStatus,
  searchActors,
  getActorsWithMovieCount,
  getActorMovies,
  checkActorNameExists,
  getActorsByNationality,
  getActorsStats,
  getMostProlificActors,
  getActorsByGenre,
  getCoStars,
  getRecentActors,
};

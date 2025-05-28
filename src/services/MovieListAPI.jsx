import supabase from "../supabase-client";

const movieCache = new Map();

export const getMovies = async (filters = {}, isAdmin = false) => {
  let query = supabase.from("Movies").select(`
    *,
    MovieGenres (
      genre_id,
      Genres (id, name, isDisabled)
    ),
    MovieActors (
      actor_id,
      Actors (id, name)
    ),
    MovieDirectors (
      director_id, 
      Directors (id, name)
    ),
    Reviews (id, rating, comment, user_id)
  `);

  if (filters.title) query = query.ilike("title", `%${filters.title}%`);
  if (filters.year) query = query.eq("year", filters.year);

  if (filters.genre) {
    if (isAdmin) {
      query = query.filter("MovieGenres.Genres.name", "eq", filters.genre);
    } else {
      query = query
        .filter("MovieGenres.Genres.name", "eq", filters.genre)
        .filter("MovieGenres.Genres.isDisabled", "eq", false);
    }
  }

  if (!isAdmin) {
    query = query.eq("isDisabled", false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getMovieById = async (movieId, isAdmin = false) => {
  const cached = movieCache.get(movieId);
  if (cached) {
    return cached;
  }
  const { data, error } = await supabase
    .from("Movies")
    .select(
      `
      *,
      MovieGenres (
        Genres (id, name, isDisabled)
      ),
      MovieDirectors (
        Directors (id, name)
      ),
      Reviews (id, rating, comment, user_id, created_at,
        Users (username, avatar_url)
      )
    `
    )
    .eq("id", movieId)
    .single();

  if (error) throw error;
  movieCache.set(movieId, data);
  return data;
};

export const addMovie = async (movieData) => {
  const { data: movie, error } = await supabase
    .from("Movies")
    .insert([
      {
        title: movieData.title,
        description: movieData.description,
        year: movieData.year,
        country: movieData.country,
        language: movieData.language,
        imdb_rating: movieData.imdb_rating,
        runtime: movieData.runtime,
        poster_url: movieData.posterUrl,
        banner_url: movieData.bannerUrl,
        trailer_url: movieData.trailerUrl,
        isDisabled: movieData.isDisabled || false,
        type: movieData.type || "Movie",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  if (movieData.genreIds && movieData.genreIds.length > 0) {
    const uniqueGenreIds = [...new Set(movieData.genreIds)];
    const genreAssociations = uniqueGenreIds.map((genreId) => ({
      movie_id: movie.id,
      genre_id: genreId,
    }));

    const { error: genreError } = await supabase
      .from("MovieGenres")
      .insert(genreAssociations);

    if (genreError) throw genreError;
  }

  return movie;
};

export const updateMovie = async (movieId, movieData) => {
  try {
    const { error } = await supabase
      .from("Movies")
      .update({
        title: movieData.title,
        description: movieData.description,
        year: movieData.year,
        country: movieData.country,
        language: movieData.language,
        imdb_rating: movieData.imdb_rating,
        runtime: movieData.runtime,
        poster_url: movieData.posterUrl,
        banner_url: movieData.bannerUrl,
        trailer_url: movieData.trailerUrl,
        isDisabled: movieData.isDisabled,
        type: movieData.type || "Movie",
      })
      .eq("id", movieId);

    if (error) throw error;

    if (movieData.genreIds) {
      const { error: deleteGenreError } = await supabase
        .from("MovieGenres")
        .delete()
        .eq("movie_id", movieId);
      if (deleteGenreError) throw deleteGenreError;

      if (movieData.genreIds.length > 0) {
        const uniqueGenreIds = [...new Set(movieData.genreIds)];
        const genreAssociations = uniqueGenreIds.map((genreId) => ({
          movie_id: movieId,
          genre_id: genreId,
        }));
        const { error: genreError } = await supabase
          .from("MovieGenres")
          .upsert(genreAssociations);

        if (genreError) throw genreError;
      }
    }

    if (movieData.directorIds) {
      const { error: deleteDirectorError } = await supabase
        .from("MovieDirectors")
        .delete()
        .eq("movie_id", movieId);
      if (deleteDirectorError) throw deleteDirectorError;
      if (movieData.directorIds.length > 0) {
        const uniqueDirectorIds = [...new Set(movieData.directorIds)];

        const directorAssociations = uniqueDirectorIds.map((directorId) => ({
          movie_id: movieId,
          director_id: directorId,
        }));

        const { error: directorError } = await supabase
          .from("MovieDirectors")
          .upsert(directorAssociations);

        if (directorError) throw directorError;
      }
    }

    if (movieData.actors) {
      const { data: actorDeleteResult, error: deleteActorError } =
        await supabase.from("MovieActors").delete().eq("movie_id", movieId);
      if (deleteActorError) throw deleteActorError;
      console.log("Deleted actors:", actorDeleteResult);
      if (movieData.actors.length > 0) {
        const actorAssociations = movieData.actors.map((actor) => ({
          movie_id: movieId,
          actor_id: actor.actorId,
          character_name: actor.characterName || null,
        }));

        const { error: actorError } = await supabase
          .from("MovieActors")
          .upsert(actorAssociations);

        if (actorError) throw actorError;
      }
    }
    movieCache.delete(movieId);
    const { data: updatedMovie, error: fetchError } = await supabase
      .from("Movies")
      .select(
        `
      *,
      MovieGenres ( genre_id, Genres (id, name) ),
      MovieActors ( actor_id, character_name, Actors (id, name) ),
      MovieDirectors ( director_id, Directors (id, name) )
    `
      )
      .eq("id", movieId)
      .single();
    if (fetchError) throw fetchError;
    return updatedMovie;
  } catch (error) {
    console.error("Error updating movie:", error);
    throw error;
  }
};

import supabase from "../supabase-client";

const movieCache = new Map();

export const getMovies = async (filters = {}) => {
  let query = supabase.from("Movies").select(`
    *,
    MovieGenres (
      genre_id,
      Genres (id, name)
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
    query = query.filter("MovieGenres.Genres.name", "eq", filters.genre);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getMovieById = async (movieId) => {
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
        Genres (id, name)
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
      },
    ])
    .select()
    .single();

  if (error) throw error;

  if (movieData.genreIds && movieData.genreIds.length > 0) {
    const genreAssociations = movieData.genreIds.map((genreId) => ({
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
    })
    .eq("id", movieId);

  if (error) throw error;

  const { error: deleteGenreError } = await supabase
    .from("MovieGenres")
    .delete()
    .eq("movie_id", movieId);

  if (deleteGenreError) throw deleteGenreError;

  if (movieData.genreIds && movieData.genreIds.length > 0) {
    const genreAssociations = movieData.genreIds.map((genreId) => ({
      movie_id: movieId,
      genre_id: genreId,
    }));

    const { error: genreError } = await supabase
      .from("MovieGenres")
      .insert(genreAssociations);

    if (genreError) throw genreError;
  }

  const { data: updatedMovie, error: fetchError } = await supabase
    .from("Movies")
    .select("*")
    .eq("id", movieId)
    .single();

  if (fetchError) throw fetchError;
  return updatedMovie;
};

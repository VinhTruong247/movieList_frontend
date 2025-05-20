// import axios from "axios";
import supabase from '../supabase-client';

// const API_URL = "https://65f43205f54db27bc020c3ff.mockapi.io/api/v1/movieList";

// export const fetchMovies = async (includeDisabled = false) => {
//   try {
//     const response = await axios.get(API_URL);
//     if (!includeDisabled) {
//       return response.data.filter((movie) => !movie.isDisable);
//     }

//     return response.data;
//   } catch (error) {
//     // console.error(`Error fetching movie for normal user:`, error);
//     throw error;
//   }
// };

// export const fetchAllMoviesForAdmin = async () => {
//   try {
//     const response = await axios.get(API_URL);
//     return response.data;
//   } catch (error) {
//     // console.error(`Error fetching movie for admin:`, error);
//     throw error;
//   }
// };

// export const fetchMovieById = async (id) => {
//   try {
//     const response = await axios.get(`${API_URL}/${id}`);
//     return response.data;
//   } catch (error) {
//     // console.error(`Error fetching movie with id ${id}:`, error);
//     throw error;
//   }
// };

// export const createMovie = async (movieData) => {
//   try {
//     const response = await axios.post(API_URL, movieData);
//     return response.data;
//   } catch (error) {
//     // console.error('Error creating movie:', error);
//     throw error;
//   }
// };

// export const updateMovie = async (id, movieData) => {
//   try {
//     const response = await axios.put(`${API_URL}/${id}`, movieData);
//     return response.data;
//   } catch (error) {
//     // console.error('Error updating movie:', error);
//     throw error;
//   }
// };

export const getMovies = async (filters = {}) => {
  let query = supabase.from('Movies').select(`
    *,
    MovieGenres (
      genre_id,
      Genres (id, name)
    ),
    MovieDirectors (
      director_id,
      Director (id, name)
    ),
    Reviews (id, rating, comment, user_id)
  `);

  if (filters.title) query = query.ilike('title', `%${filters.title}%`);
  if (filters.year) query = query.eq('year', filters.year);
  if (filters.genre) {
    query = query.filter('MovieGenres.Genres.name', 'eq', filters.genre);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getMovieById = async (movieId) => {
  const { data, error } = await supabase
    .from('Movies')
    .select(`
      *,
      MovieGenres (
        Genres (id, name)
      ),
      MovieDirectors (
        Director (id, name, nationality, biography)
      ),
      Reviews (id, rating, comment, user_id, created_at,
        Users (username, avatar_url)
      )
    `)
    .eq('id', movieId)
    .single();

  if (error) throw error;
  return data;
};

export const addMovie = async (movieData) => {
  const { data: movie, error } = await supabase
    .from('Movies')
    .insert([{
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
      isDisabled: movieData.isDisabled || false
    }])
    .select()
    .single();

  if (error) throw error;

  if (movieData.genreIds && movieData.genreIds.length > 0) {
    const genreAssociations = movieData.genreIds.map(genreId => ({
      movie_id: movie.id,
      genre_id: genreId
    }));

    const { error: genreError } = await supabase
      .from('MovieGenres')
      .insert(genreAssociations);

    if (genreError) throw genreError;
  }

  if (movieData.directorIds && movieData.directorIds.length > 0) {
    const directorAssociations = movieData.directorIds.map(directorId => ({
      movie_id: movie.id,
      director_id: directorId
    }));

    const { error: directorError } = await supabase
      .from('MovieDirectors')
      .insert(directorAssociations);

    if (directorError) throw directorError;
  }

  return movie;
};

export const updateMovie = async (movieId, movieData) => {
  const { error } = await supabase
    .from('Movies')
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
      isDisabled: movieData.isDisabled
    })
    .eq('id', movieId);
    
  if (error) throw error;

  const { error: deleteGenreError } = await supabase
    .from('MovieGenres')
    .delete()
    .eq('movie_id', movieId);
    
  if (deleteGenreError) throw deleteGenreError;

  if (movieData.genreIds && movieData.genreIds.length > 0) {
    const genreAssociations = movieData.genreIds.map(genreId => ({
      movie_id: movieId,
      genre_id: genreId
    }));
    
    const { error: genreError } = await supabase
      .from('MovieGenres')
      .insert(genreAssociations);
      
    if (genreError) throw genreError;
  }
  
  const { error: deleteDirectorError } = await supabase
    .from('MovieDirectors')
    .delete()
    .eq('movie_id', movieId);
    
  if (deleteDirectorError) throw deleteDirectorError;

  if (movieData.directorIds && movieData.directorIds.length > 0) {
    const directorAssociations = movieData.directorIds.map(directorId => ({
      movie_id: movieId,
      director_id: directorId
    }));
    
    const { error: directorError } = await supabase
      .from('MovieDirectors')
      .insert(directorAssociations);
      
    if (directorError) throw directorError;
  }

  const { data: updatedMovie, error: fetchError } = await supabase
    .from('Movies')
    .select('*')
    .eq('id', movieId)
    .single();
    
  if (fetchError) throw fetchError;
  return updatedMovie;
};
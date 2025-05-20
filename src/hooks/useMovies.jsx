import { useState, useEffect } from "react";
import supabase from "../supabase-client";

export const useMovies = (filters = {}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('Movies')
          .select(`
            *,
            MovieGenres!inner (
              Genres (id, name)
            ),
            MovieDirectors!inner (
              Director (id, name)
            ),
            Reviews (id, rating, comment, user_id)
          `)
          .eq('isDisabled', false);
        if (filters.title) {
          query = query.ilike('title', `%${filters.title}%`);
        }
        
        if (filters.year) {
          query = query.eq('year', filters.year);
        }
        
        if (filters.genre) {
          query = query.filter('MovieGenres.Genres.name', 'eq', filters.genre);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setMovies(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, [
    filters.title, 
    filters.year, 
    filters.genre
  ]);
  
  return { movies, loading, error };
};

export const getMovies = async (filters = {}) => {
  let query = supabase.from('Movies').select(`
    *,
    MovieGenres!inner (
      Genres (id, name)
    ),
    MovieDirectors!inner (
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
      imdb_rating: movieData.imdbRating,
      runtime: movieData.runtime,
      poster_url: movieData.posterUrl,
      banner_url: movieData.bannerUrl,
      trailer_url: movieData.trailerUrl,
      isDisabled: false
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

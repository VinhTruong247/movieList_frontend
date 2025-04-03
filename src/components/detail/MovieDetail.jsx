import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieById } from '../../utils/MovieListAPI';
import Loader from '../common/Loader';
import { Button } from '@mui/material'
import { useFavorites } from '../../hooks/useFavorites';
import './MovieDetail.scss'

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    const getMovie = async () => {
      try {
        const data = await fetchMovieById(id);
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getMovie();
  }, [id]);

  const handleFavoriteToggle = () => {
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p>Error loading movie: {error}</p>;
  if (!movie) return <p>Movie not found</p>;

  const favorite = isFavorite(movie.id);

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back to Movies
      </button>
      
      <div className="movie-content">
        <img 
          className="movie-poster"
          src={movie.poster} 
          alt={movie.title} 
        />
        
        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1>
          
          <div className="movie-meta">
            <span>Year: {movie.year}</span>
            <span>Rating: {movie.imdb_rating}/10</span>
            <span>Genre: {movie.genre.join(",")}</span>
          </div>
          
          <p className="movie-description">{movie.description}</p>
          
          <div className="action-buttons">
            <Button primary onClick={handleFavoriteToggle}>
              {favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
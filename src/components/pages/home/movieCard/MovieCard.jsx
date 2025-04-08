import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../../../hooks/useFavorites';
import './MovieCard.scss';

const MovieCard = ({ movie }) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const favorite = isFavorite(movie.id);

  const handleFavorite = (e) => {
    e.preventDefault();
    if (favorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <div className="movie-poster">
          <img src={movie.poster} alt={movie.title} />
        </div>
        <div className="movie-content">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-rating">Rating: {movie.imdb_rating}/10</p>
          <p className="movie-year">{movie.year}</p>
        </div>
      </Link>
      <div className="movie-actions">
        <Link to={`/movie/${movie.id}`} className="view-button">
          View Details
        </Link>
        <button 
          className={`favorite-button ${favorite ? 'is-favorite' : ''}`}
          onClick={handleFavorite}
        >
          {favorite ? '❤️ Favorited' : '🤍 Favorite'}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
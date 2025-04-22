import React, { useContext } from 'react';
import { Link } from 'react-router';
import { useFavorites } from '../../../../hooks/useFavorites';
import { MovieContext } from '../../../../context/MovieContext';
import './MovieCard.scss';

const MovieCard = ({ movie }) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useContext(MovieContext);
  const favorite = isFavorite(movie.id);

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (favorite) {
        await removeFromFavorites(movie.id);
      } else {
        await addToFavorites(movie);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };
  console.log('a3');
  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <div className="movie-poster">
          <img src={movie.poster} alt={movie.title} />
          <div className="movie-type">{movie.type}</div>
        </div>
        <div className="movie-content">
          <h3 className="movie-title">{movie.title}</h3>
          <div className="movie-meta">
            <span className="movie-rating">⭐ {movie.imdb_rating}/10</span>
            <span className="movie-year">{movie.year}</span>
          </div>
          <div className="movie-genres">
            {movie.genre.map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre}
              </span>
            ))}
          </div>
          <p className="movie-runtime">{movie.runtime}</p>
        </div>
      </Link>
      <div className="movie-actions">
        <Link to={`/movie/${movie.id}`} className="view-button">
          View Details
        </Link>
        {currentUser && (
          <button
            className={`favorite-button ${favorite ? 'is-favorite' : ''}`}
            onClick={handleFavorite}
          >
            {favorite ? '❤️ Favorited' : '🤍 Favorite'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;

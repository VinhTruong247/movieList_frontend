import React from 'react';
import MovieCard from '../home/movieCard/MovieCard';
import { useFavorites } from '../../../hooks/useFavorites';
import { Link, useNavigate } from 'react-router-dom';
import './Favorites.scss';

const Favorites = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <div className="favorites-container">
      <button className="back-button" onClick={() => navigate('/')}>
        Back to Home Page
      </button>
      <h1 className="page-title">Your Favorite Movies</h1>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <h3>No favorite movies yet</h3>
          <p>Start adding movies to your favorites to see them here!</p>
          <Link to="/" className="browse-button">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((movie) => (
            <div key={movie.id} className="favorite-item">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieById } from '../../../utils/MovieListAPI';
import { getCurrentUser } from '../../../utils/UserListAPI';
import Loader from '../../common/Loader';
import { useFavorites } from '../../../hooks/useFavorites';
import TrailerPopup from './Trailer/TrailerPopup';
import './MovieDetail.scss';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToFavorites, removeFromFavorites, isFavorite, isUpdating } = useFavorites();
  const [showTrailer, setShowTrailer] = useState(false);
  const currentUser = getCurrentUser();

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

  const handleFavoriteToggle = useCallback(async () => {
    if (!currentUser || isUpdating) return;

    try {
      const isCurrentlyFavorite = isFavorite(movie.id);
      
      if (isCurrentlyFavorite) {
        await removeFromFavorites(movie.id);
      } else {
        await addToFavorites(movie);
      }

      if (window.location.pathname === '/favorites' && isCurrentlyFavorite) {
        navigate('/favorites', { replace: true });
      }
    } catch (error) {
      setError('Failed to update favorites');
    }
  }, [currentUser, isUpdating, movie, isFavorite, removeFromFavorites, addToFavorites, navigate]);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">Error loading movie: {error}</div>;
  if (!movie) return <div className="error-message">Movie not found</div>;

  // Cache the favorite status
  const favorite = movie ? isFavorite(movie.id) : false;

  return (
    <div className="movie-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      
      <div className="detail-content">
        <div className="poster-section">
          <div className="movie-poster">
            <img src={movie.poster} alt={movie.title} />
            <div className="movie-type">{movie.type}</div>
          </div>
          <button 
            className="trailer-button"
            onClick={() => setShowTrailer(true)}
          >
            Watch Trailer
          </button>
        </div>
        
        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1>
          
          <div className="movie-meta">
            <span className="year">📅 {movie.year}</span>
            <span className="rating">⭐ {movie.imdb_rating}/10</span>
            <span className="runtime">⏱️ {movie.runtime}</span>
          </div>

          <div className="genre-list">
            {movie.genre.map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
          
          <div className="movie-details">
            <p className="description">{movie.description}</p>
            
            <div className="additional-info">
              <div className="info-item">
                <span className="label">Director:</span>
                <span className="value">{movie.director}</span>
              </div>
              <div className="info-item">
                <span className="label">Language:</span>
                <span className="value">{movie.language}</span>
              </div>
              <div className="info-item">
                <span className="label">Country:</span>
                <span className="value">{movie.country}</span>
              </div>
            </div>
          </div>
          
          {currentUser && (
            <button 
              className={`favorite-button ${favorite ? 'is-favorite' : ''}`}
              onClick={handleFavoriteToggle}
            >
              {favorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
            </button>
          )}
        </div>
      </div>

      {showTrailer && (
        <TrailerPopup 
          trailerUrl={movie.trailer}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};

export default MovieDetail;
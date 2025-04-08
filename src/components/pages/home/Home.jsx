import React, { useState, useEffect } from 'react';
import MovieCard from './movieCard/MovieCard';
import Loader from '../../common/Loader';
import { useMovies } from '../../../hooks/useMovies';
import './Home.scss';

const Home = () => {
  const { movies, loading, error } = useMovies();
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    setFilteredMovies(movies);
  }, [movies]);

  const handleFilter = (filter) => {
    setActiveFilter(filter);

    if (filter === 'all') {
      setFilteredMovies(movies);
    } else if (filter === 'top-rated') {
      setFilteredMovies([...movies].sort((a, b) => b.imdb_rating - a.imdb_rating));
    } else if (filter === 'latest') {
      setFilteredMovies([...movies].sort((a, b) => b.year - a.year));
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="error-message">Error loading movies: {error}</div>;

  return (
    <div className="home-container">
      <h1 className="page-title">Popular Movies</h1>

      <div className="filter-buttons">
        <button
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilter('all')}
        >
          All Movies
        </button>
        <button
          className={`filter-button ${activeFilter === 'top-rated' ? 'active' : ''}`}
          onClick={() => handleFilter('top-rated')}
        >
          Top Rated
        </button>
        <button
          className={`filter-button ${activeFilter === 'latest' ? 'active' : ''}`}
          onClick={() => handleFilter('latest')}
        >
          Latest
        </button>
      </div>

      <div className="movies-grid">
        {filteredMovies.map(movie => (
          <div key={movie.id} className="movie-item">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
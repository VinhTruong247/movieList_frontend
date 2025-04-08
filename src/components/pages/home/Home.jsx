import React, { useState, useEffect } from 'react';
import { Container, Typography, ButtonGroup, Button, Grid } from '@mui/material';
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
  if (error) return <p>Error loading movies: {error}</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Popular Movies
      </Typography>
      
      <ButtonGroup 
        variant="contained" 
        sx={{ mb: 4 }}
      >
        <Button 
          onClick={() => handleFilter('all')}
          color={activeFilter === 'all' ? 'primary' : 'inherit'}
        >
          All Movies
        </Button>
        <Button 
          onClick={() => handleFilter('top-rated')}
          color={activeFilter === 'top-rated' ? 'primary' : 'inherit'}
        >
          Top Rated
        </Button>
        <Button 
          onClick={() => handleFilter('latest')}
          color={activeFilter === 'latest' ? 'primary' : 'inherit'}
        >
          Latest
        </Button>
      </ButtonGroup>
      
      <Grid container spacing={3}>
        {filteredMovies.map(movie => (
          <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
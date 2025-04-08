import React from 'react';
import { Container, Typography, Grid, Paper, Button } from '@mui/material';
import MovieCard from '../../pages/home/movieCard/MovieCard';
import { useFavorites } from '../../../hooks/useFavorites';
import { Link } from 'react-router-dom';
import './Favorites.scss';

const Favorites = () => {
  const { favorites } = useFavorites();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Your Favorite Movies
      </Typography>

      {favorites.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Typography variant="h5" gutterBottom>
            No favorite movies yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start adding movies to your favorites to see them here!
          </Typography>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            sx={{ backgroundColor: '#1a237e' }}
          >
            Browse Movies
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {favorites.map(movie => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
              <MovieCard movie={movie} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Favorites;
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
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
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: 3
        }
      }}
    >
      <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardMedia
          component="img"
          height="350"
          image={movie.poster}
          alt={movie.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {movie.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rating: {movie.imdb_rating}/10
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {movie.year}
          </Typography>
        </CardContent>
      </Link>
      <CardActions sx={{ marginTop: 'auto', justifyContent: 'space-between' }}>
        <Button 
          size="small" 
          variant="contained" 
          component={Link} 
          to={`/movie/${movie.id}`}
          sx={{ backgroundColor: '#1a237e' }}
        >
          View Details
        </Button>
        <Button
          size="small"
          onClick={handleFavorite}
          startIcon={favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        >
          {favorite ? 'Favorited' : 'Favorite'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default MovieCard;
import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a237e', marginBottom: '2rem' }}>
      <Container>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              🎬 Movie Collection
            </Typography>
          </Link>
          
          <Button
            component={Link}
            to="/favorites"
            startIcon={<FavoriteIcon />}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Favorites
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
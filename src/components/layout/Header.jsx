import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';

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
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
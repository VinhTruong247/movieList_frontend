import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: '#1a237e',
        color: 'white',
        py: 3,
        mt: 'auto'
      }}
    >
      <Container>
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Movie Collection. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
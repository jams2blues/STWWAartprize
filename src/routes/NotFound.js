// src/routes/NotFound.js

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        bgcolor: '#000000',
        color: '#FFFFFF',
        padding: 4,
        borderRadius: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" component={Link} to="/">
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;

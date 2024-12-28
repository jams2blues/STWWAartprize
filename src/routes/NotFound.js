// src/routes/NotFound.js

import React from 'react';
import { Container, Typography } from '@mui/material';

const NotFound = () => (
  <Container
    sx={{
      mt: 4,
      bgcolor: '#000000',
      color: '#FFFFFF',
      minHeight: '80vh',
      padding: 4,
      textAlign: 'center',
      borderRadius: 2,
    }}
  >
    <Typography variant="h2" gutterBottom>
      404 - Page Not Found
    </Typography>
    <Typography variant="body1">
      The page you're looking for doesn't exist.
    </Typography>
  </Container>
);

export default NotFound;
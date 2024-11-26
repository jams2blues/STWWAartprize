// src/App.js

import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { CircularProgress, Box } from '@mui/material';

// Lazy load the route components
const SubmitEntry = lazy(() => import('./routes/SubmitEntry'));
const VotingGallery = lazy(() => import('./routes/VotingGallery'));
const TopThree = lazy(() => import('./routes/TopThree'));
const NotFound = lazy(() => import('./routes/NotFound'));

function App() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh',
              bgcolor: '#000000',
            }}
          >
            <CircularProgress color="secondary" />
          </Box>
        }
      >
        <Routes>
          <Route path="/" element={<SubmitEntry />} />
          <Route path="/voting-gallery" element={<VotingGallery />} />
          <Route path="/top-three" element={<TopThree />} />
          {/* Add other routes as needed */}
          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

// src/App.js

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { CircularProgress, Box } from '@mui/material';
import Auth from './components/Auth';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Lazy load the route components
const SubmitEntry = lazy(() => import('./routes/SubmitEntry'));
const VotingGallery = lazy(() => import('./routes/VotingGallery'));
const TopThree = lazy(() => import('./routes/TopThree'));
const NotFound = lazy(() => import('./routes/NotFound'));

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
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
    );
  }

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
          <Route path="/" element={user ? <SubmitEntry /> : <Auth />} />
          <Route path="/voting-gallery" element={user ? <VotingGallery /> : <Auth />} />
          <Route path="/top-three" element={<TopThree />} />
          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

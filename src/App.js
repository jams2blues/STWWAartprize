// src/App.js

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SubmitEntry from './routes/SubmitEntry';
import Header from './components/Header';
import NotFound from './routes/NotFound';
import { CircularProgress, Box } from '@mui/material';

// Code splitting with React.lazy
const Vote = React.lazy(() => import('./routes/Vote'));

function App() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route path="/" element={<SubmitEntry />} />
          <Route path="/vote" element={<Vote />} />
          {/* Add more routes here if needed */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

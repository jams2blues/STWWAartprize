// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SubmitEntry from './routes/SubmitEntry';
import Header from './components/Header';
import NotFound from './routes/NotFound';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<SubmitEntry />} />
        {/* Add more routes here if needed */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SubmitEntry from './routes/SubmitEntry';
import VotingGallery from './routes/VotingGallery';
import TopThree from './routes/TopThree';
import Header from './components/Header';
import './App.css'; // Include default styles if needed

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<SubmitEntry />} />
        <Route path="/voting-gallery" element={<VotingGallery />} />
        <Route path="/top-three" element={<TopThree />} />
        {/* Add other routes as needed */}
      </Routes>
    </>
  );
}

export default App;

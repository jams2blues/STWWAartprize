// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SubmitEntry from './routes/SubmitEntry';
import VotingGallery from './routes/VotingGallery';
import TopThree from './routes/TopThree';
import Header from './components/Header';
import './App.css'; // Include custom styles if needed

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<SubmitEntry />} />
        <Route path="/voting-gallery" element={<VotingGallery />} />
        <Route path="/top-three" element={<TopThree />} />
        {/* Add other routes as needed */}
        {/* Optional: Add a 404 Not Found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#FFFFFF', backgroundColor: '#000000' }}>
    <h2>404 - Page Not Found</h2>
    <p>The page you're looking for doesn't exist.</p>
  </div>
);

export default App;

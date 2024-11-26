// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmitEntry from './routes/SubmitEntry';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<SubmitEntry />} />
        {/* Add more routes here if needed */}
      </Routes>
    </Router>
  );
}

export default App;

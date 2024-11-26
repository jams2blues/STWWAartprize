// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import theme from './theme';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import './index.css'; // Include default styles

import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer and process available globally
window.Buffer = Buffer;
window.process = process;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <WalletProvider>
        <Router>
          <App />
        </Router>
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>
);

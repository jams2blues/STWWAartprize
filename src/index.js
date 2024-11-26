// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import theme from './theme';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { initThinBackend } from 'thin-backend';
import { ThinBackend } from 'thin-backend-react';
import './index.css'; // Include default styles
import { GoogleReCaptchaProvider } from 'react-google-recaptcha'; // Remove this line

import { Buffer } from 'buffer';
import process from 'process';

// Initialize Thin Backend
initThinBackend({ host: process.env.REACT_APP_BACKEND_URL });

// Make Buffer and process available globally
window.Buffer = Buffer;
window.process = process;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* Remove GoogleReCaptchaProvider */}
      <WalletProvider>
        <ThinBackend>
          <Router>
            <App />
          </Router>
        </ThinBackend>
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>
);

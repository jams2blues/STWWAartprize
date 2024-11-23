// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import theme from './theme';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { initThinBackend } from 'thin-backend';
import { ThinBackend } from 'thin-backend-react';
import './index.css'; // Include default styles

initThinBackend({ host: process.env.REACT_APP_BACKEND_URL });

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <WalletProvider>
        <ThinBackend>
          <Router>
            <App />
          </Router>
        </ThinBackend>
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

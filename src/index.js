// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WalletProvider } from './contexts/WalletContext';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <WalletProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <App />
          </Router>
        </QueryClientProvider>
      </ThemeProvider>
    </WalletProvider>
  </React.StrictMode>
);
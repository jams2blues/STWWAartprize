// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { WalletProvider } from './contexts/WalletContext'; // Updated path
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <WalletProvider>
      <Router>
        <App />
      </Router>
    </WalletProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

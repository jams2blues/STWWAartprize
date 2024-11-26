// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { WalletProvider } from '@tezos-contrib/react-wallet-provider';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <WalletProvider name="Save The World With Art™">
      <App />
    </WalletProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// src/components/WalletConnectButton.js

import React, { useContext, useState } from 'react';
import { Button, Alert } from '@mui/material';
import { WalletContext } from '../contexts/WalletContext';

const WalletConnectButton = () => {
  const { walletAddress, connectWallet, disconnectWallet } = useContext(WalletContext);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    try {
      await connectWallet();
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Connection Error:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Disconnection Error:', err);
      setError('Failed to disconnect wallet. Please try again.');
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={walletAddress ? handleDisconnect : handleConnect}
        sx={{ mt: 2 }}
        fullWidth
      >
        {walletAddress ? 'Disconnect Wallet' : 'Connect Wallet'}
      </Button>
    </>
  );
};

export default WalletConnectButton;

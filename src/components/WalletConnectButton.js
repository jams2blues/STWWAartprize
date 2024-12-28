// artprize.savetheworldwithart.io/src/components/WalletConnectButton.js

import React, { useContext } from 'react';
import { Button } from '@mui/material';
import { WalletContext } from '../contexts/WalletContext';

const WalletConnectButton = () => {
  const { walletAddress, connectWallet, disconnectWallet } = useContext(WalletContext);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      // Optionally, display an error message to the user
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <>
      {walletAddress ? (
        <Button variant="outlined" color="secondary" onClick={handleDisconnect}>
          Disconnect Wallet
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={handleConnect}>
          Connect Wallet
        </Button>
      )}
    </>
  );
};

export default WalletConnectButton;

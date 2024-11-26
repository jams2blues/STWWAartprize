// src/components/WalletConnectButton.js

import React, { useContext } from 'react';
import { Button } from '@mui/material';
import { WalletContext } from '../contexts/WalletContext';

const WalletConnectButton = () => {
  const { walletAddress, connectWallet, disconnectWallet } = useContext(WalletContext);

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={walletAddress ? disconnectWallet : connectWallet}
      sx={{ mt: 2 }}
      fullWidth
    >
      {walletAddress ? 'Disconnect Wallet' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnectButton;

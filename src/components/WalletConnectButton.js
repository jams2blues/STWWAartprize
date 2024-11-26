// src/components/WalletConnectButton.js

import React, { useContext } from 'react';
import { WalletContext } from '@tezos-contrib/react-wallet-provider';
import { Button } from '@mui/material';

function WalletConnectButton() {
  const { connected, connect, disconnect } = useContext(WalletContext);

  return (
    <Button variant="contained" color="primary" onClick={connected ? disconnect : connect}>
      {connected ? 'Disconnect Wallet' : 'Connect Wallet'}
    </Button>
  );
}

export default WalletConnectButton;

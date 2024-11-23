// src/components/Header.js

import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { WalletContext } from '../contexts/WalletContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Header = () => {
  const { walletAddress, connectWallet, disconnectWallet } = useContext(WalletContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Save The World With Art™ Art Prize
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Submit Entry
        </Button>
        <Button color="inherit" component={Link} to="/voting-gallery">
          Voting Gallery
        </Button>
        <Button color="inherit" component={Link} to="/top-three">
          Top 3
        </Button>
        {!walletAddress ? (
          <Button color="inherit" onClick={connectWallet} startIcon={<AccountBalanceWalletIcon />}>
            Connect Wallet
          </Button>
        ) : (
          <Button color="inherit" onClick={disconnectWallet} startIcon={<AccountBalanceWalletIcon />}>
            Disconnect ({walletAddress.substring(0, 6)}...{walletAddress.slice(-4)})
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;

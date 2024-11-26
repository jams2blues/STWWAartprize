// src/components/Header.js

import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { WalletContext } from '../contexts/WalletContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/system';
import { useState } from 'react';

const GradientAppBar = styled(AppBar)({
  background: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)',
});

const HeaderText = styled(Typography)({
  color: '#FFFFFF',
  textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
});

const Header = () => {
  const { walletAddress, connectWallet, disconnectWallet } = useContext(WalletContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navLinks = [
    { title: 'Submit Entry', path: '/' },
    { title: 'Voting Gallery', path: '/voting-gallery' },
    { title: 'Top 3', path: '/top-three' },
  ];

  return (
    <>
      <GradientAppBar position="static">
        <Toolbar>
          {/* Mobile Menu Icon */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <HeaderText variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
            Save The World With Art™ Art Prize
          </HeaderText>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {navLinks.map((link) => (
              <Button key={link.title} color="inherit" component={Link} to={link.path}>
                {link.title}
              </Button>
            ))}
            {!walletAddress ? (
              <Button
                color="inherit"
                onClick={connectWallet}
                startIcon={<AccountBalanceWalletIcon />}
                sx={{ ml: 2 }}
              >
                Connect Wallet
              </Button>
            ) : (
              <Button
                color="inherit"
                onClick={disconnectWallet}
                startIcon={<AccountBalanceWalletIcon />}
                sx={{ ml: 2 }}
              >
                Disconnect ({walletAddress.substring(0, 6)}...{walletAddress.slice(-4)})
              </Button>
            )}
          </Box>
        </Toolbar>
      </GradientAppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            {navLinks.map((link) => (
              <ListItem button key={link.title} component={Link} to={link.path}>
                <ListItemText primary={link.title} />
              </ListItem>
            ))}
            {!walletAddress ? (
              <ListItem button onClick={connectWallet}>
                <AccountBalanceWalletIcon sx={{ mr: 2 }} />
                <ListItemText primary="Connect Wallet" />
              </ListItem>
            ) : (
              <ListItem button onClick={disconnectWallet}>
                <AccountBalanceWalletIcon sx={{ mr: 2 }} />
                <ListItemText primary={`Disconnect (${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)})`} />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;

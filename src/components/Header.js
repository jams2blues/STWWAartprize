// src/components/Header.js

import React, { useContext, useState } from 'react';
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
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/system';
import { auth } from '../firebase';

const GradientAppBar = styled(AppBar)({
  background: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)',
});

const HeaderText = styled(Typography)({
  color: '#FFFFFF',
  textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
});

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = auth.currentUser;

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
            {user ? (
              <Button
                color="inherit"
                onClick={() => auth.signOut()}
                startIcon={<AccountCircle />}
                sx={{ ml: 2 }}
              >
                Logout ({user.email})
              </Button>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/"
                startIcon={<AccountCircle />}
                sx={{ ml: 2 }}
              >
                Login
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
            {user ? (
              <ListItem button onClick={() => auth.signOut()}>
                <AccountCircle sx={{ mr: 2 }} />
                <ListItemText primary={`Logout (${user.email})`} />
              </ListItem>
            ) : (
              <ListItem button component={Link} to="/">
                <AccountCircle sx={{ mr: 2 }} />
                <ListItemText primary="Login" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;

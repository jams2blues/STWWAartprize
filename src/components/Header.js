// src/components/Header.js

import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/system';

const RainbowAppBar = styled(AppBar)({
  background: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)',
});

function Header() {
  return (
    <RainbowAppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'black',
          }}
        >
          Save The World With Art™ Art Prize
        </Typography>
      </Toolbar>
    </RainbowAppBar>
  );
}

export default Header;

// artprize.savetheworldwithart.io/src/components/Header.js

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import InfoModal from './InfoModal';

const RainbowAppBar = styled(AppBar)({
  background: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)',
});

function Header() {
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
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
              textShadow: '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.6)',
            }}
          >
            Save The World With Art™ Art Prize
          </Typography>
          <Button component={Link} to="/" color="inherit" sx={{ mr: 2 }}>
            Submit Entry
          </Button>
          <Button component={Link} to="/vote" color="inherit" sx={{ mr: 2 }}>
            Vote
          </Button>
          <Tooltip title="Learn more about the competition rules and guidelines">
            <Button color="inherit" onClick={handleOpenModal}>
              <InfoIcon />
            </Button>
          </Tooltip>
        </Toolbar>
      </RainbowAppBar>
      <InfoModal open={open} handleClose={handleCloseModal} />
    </>
  );
}

export default Header;

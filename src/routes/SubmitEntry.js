// src/routes/SubmitEntry.js

import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Button,
  Alert,
  Grid,
  Box,
  Tooltip,
} from '@mui/material';
import WalletConnectButton from '../components/WalletConnectButton';
import { WalletContext } from '../contexts/WalletContext';
import { Link } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import InfoModal from '../components/InfoModal';
import CountdownTimer from '../components/CountdownTimer'; // Importing the CountdownTimer

function SubmitEntry() {
  const { walletAddress } = useContext(WalletContext);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openModal, setOpenModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submission logic is now disabled
    setMessage({ type: 'info', text: 'Submission phase has ended. Please proceed to voting.' });
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: 'bold', color: 'black', mb: 2 }}
      >
        Submission Phase Ended
      </Typography>

      {/* Live Countdown Timer */}
      <CountdownTimer targetDate="2025-01-07T00:00:00Z" /> {/* Ensure consistency with Vote.js */}

      {/* Information Modal */}
      <Box sx={{ textAlign: 'right', mb: 2 }}>
        <Tooltip title="Learn more about the voting process">
          <Button onClick={handleOpenModal}>
            <InfoIcon />
          </Button>
        </Tooltip>
      </Box>
      <InfoModal open={openModal} handleClose={handleCloseModal} />

      {/* Competition Rules and Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          RULES and Voting Guide
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for submitting your artwork! The submission phase has ended, and the top 10 artworks have been curated.
          Now, it's time to cast your votes to help determine the winners.
        </Typography>
        <Typography variant="body1" paragraph>
          Connect your Tezos wallet and vote for your favorite artworks. Remember, each wallet can vote only once but can change their vote at any time.
        </Typography>
      </Box>

      {/* Display messages */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Wallet Connection */}
      <WalletConnectButton />

      {/* Submission Form (Disabled) */}
      {walletAddress && (
        <Box sx={{ mt: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Informational Message */}
              <Grid item xs={12}>
                <Alert severity="info">
                  The submission phase has ended. Please proceed to the <Button component={Link} to="/vote">Voting Page</Button>.
                </Alert>
              </Grid>
            </Grid>
          </form>
        </Box>
      )}
    </Container>
  );
}

export default SubmitEntry;

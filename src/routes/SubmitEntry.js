// src/routes/SubmitEntry.js

import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Button,
  Alert,
  Grid,
  Box,
  Tooltip, // Imported Tooltip
} from '@mui/material';
import WalletConnectButton from '../components/WalletConnectButton';
import { WalletContext } from '../contexts/WalletContext';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Link } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import InfoModal from '../components/InfoModal';

dayjs.extend(duration);

function SubmitEntry() {
  const { walletAddress } = useContext(WalletContext);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [captchaValue, setCaptchaValue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Set the deadline date to next Friday in 2025
  const deadline = dayjs().add(1, 'week').day(5); // Next Friday

  // Countdown Timer Logic
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const diff = deadline.diff(now);

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        });
      } else {
        const durationObj = dayjs.duration(diff);
        setTimeLeft({
          days: String(Math.floor(durationObj.asDays())).padStart(2, '0'),
          hours: String(durationObj.hours()).padStart(2, '0'),
          minutes: String(durationObj.minutes()).padStart(2, '0'),
          seconds: String(durationObj.seconds()).padStart(2, '0'),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  // Handle Form Submission (Disabled as submission phase is complete)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submission logic is now disabled
    setMessage({ type: 'info', text: 'Submission phase has ended. Please proceed to voting.' });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
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

      {/* Countdown Timer */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'red' }}>
          Time Left to Vote: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </Typography>
      </Box>

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

      {/* ReCAPTCHA */}
      <Box sx={{ my: 2, textAlign: 'center' }}>
        <ReCAPTCHA
          sitekey={process.env.RECAPTCHA_SITE_KEY}
          onChange={handleCaptchaChange}
          theme="light"
        />
      </Box>

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

// src/routes/VotingGallery.js

import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { query } from 'thin-backend';
import { useQuery } from 'thin-backend-react';
import { recordVote } from '../utils/thinBackendUtils';
import { WalletContext } from '../contexts/WalletContext';
import ReCAPTCHA from 'react-google-recaptcha';
import Countdown from 'react-countdown';

const VotingGallery = () => {
  const { walletAddress, connectWallet } = useContext(WalletContext);
  const { data, error, loading } = useQuery(query('entries').orderByDesc('votes'));
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [voted, setVoted] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setEntries(data);
    } else {
      setEntries([]);
    }
  }, [data]);

  useEffect(() => {
    const checkIfVoted = async () => {
      if (walletAddress) {
        const existingVote = await query('votes').where('walletAddress', walletAddress).fetchOne();
        if (existingVote) {
          setVoted(true);
        }
      }
    };
    checkIfVoted();
  }, [walletAddress]);

  const handleVote = async (entryId) => {
    if (!captchaValue) {
      setMessage({ type: 'error', text: 'Please complete the CAPTCHA.' });
      return;
    }

    try {
      // Send CAPTCHA token to backend for verification
      const captchaResponse = await fetch('/api/verifyCaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaValue }),
      });
      const captchaResult = await captchaResponse.json();

      if (!captchaResult.success) {
        setMessage({ type: 'error', text: 'CAPTCHA verification failed. Please try again.' });
        return;
      }

      // Record the vote
      await recordVote(walletAddress, entryId);
      setMessage({ type: 'success', text: 'Your vote has been recorded!' });
      setVoted(true);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setCaptchaValue(null); // Reset CAPTCHA
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          bgcolor: '#000000',
          color: '#FFFFFF',
          minHeight: '80vh',
          padding: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress color="secondary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          bgcolor: '#000000',
          color: '#FFFFFF',
          minHeight: '80vh',
          padding: 4,
        }}
      >
        <Alert severity="error">Failed to load entries. Please try again later.</Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        bgcolor: '#000000',
        color: '#FFFFFF',
        minHeight: '80vh',
        padding: 4,
        borderRadius: 2,
      }}
    >
      <CountdownTimer />
      <Typography variant="h4" gutterBottom>
        Voting Gallery
      </Typography>
      {message.text && (
        <Alert
          severity={message.type}
          sx={{
            mb: 2,
            bgcolor: message.type === 'error' ? '#FF4C4C' : '#4CAF50',
            color: '#FFFFFF',
          }}
        >
          {message.text}
        </Alert>
      )}
      {!walletAddress && (
        <Button variant="contained" color="secondary" onClick={connectWallet} sx={{ mb: 2 }}>
          Connect Wallet to Vote
        </Button>
      )}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {entries && entries.length > 0 ? (
          entries.map((entry) => (
            <Grid item xs={12} sm={6} md={4} key={entry.id}>
              <Card sx={{ bgcolor: '#1a1a1a', borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://images.tzkt.io/${entry.contractAddress}/${entry.tokenId}`}
                  alt={`Token ID ${entry.tokenId}`}
                  loading="lazy" // Enable native lazy loading
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6">Artist: {entry.walletAddress}</Typography>
                  <Typography variant="body2">Votes: {entry.votes}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleVote(entry.id)}
                    disabled={!walletAddress || voted}
                    sx={{ mt: 1 }}
                  >
                    Vote
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    href={`https://objkt.com/asset/${entry.contractAddress}/${entry.tokenId}`}
                    target="_blank"
                    sx={{ mt: 1, ml: 1 }}
                  >
                    View on OBJKT
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1">No entries available for voting.</Typography>
          </Grid>
        )}
      </Grid>
      <ReCAPTCHA
        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        onChange={handleCaptchaChange}
        theme="dark"
        style={{ marginTop: '16px' }}
      />
    </Container>
  );
};

const CountdownTimer = () => {
  const endDate = new Date('2024-12-25T00:00:00');

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return <Typography variant="h6" color="error">Voting period has ended.</Typography>;
    } else {
      return (
        <Typography variant="h6" color="error">
          Voting ends in: {days}d {hours}h {minutes}m {seconds}s
        </Typography>
      );
    }
  };

  return <Countdown date={endDate} renderer={renderer} />;
};

export default VotingGallery;

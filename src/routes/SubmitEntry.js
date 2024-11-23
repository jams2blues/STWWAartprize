// src/routes/SubmitEntry.js

import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { WalletContext } from '../contexts/WalletContext';
import { validateContract } from '../utils/tezosUtils';
import { submitEntry } from '../utils/thinBackendUtils';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Countdown from 'react-countdown';

const SubmitEntry = () => {
  const { connectWallet, walletAddress } = useContext(WalletContext);
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!captchaValue) {
      setMessage({ type: 'error', text: 'Please complete the CAPTCHA.' });
      setLoading(false);
      return;
    }

    try {
      // Verify CAPTCHA
      const captchaResponse = await fetch('/api/verifyCaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captchaValue }),
      });
      const captchaResult = await captchaResponse.json();

      if (!captchaResult.success) {
        setMessage({ type: 'error', text: 'CAPTCHA verification failed.' });
        setLoading(false);
        return;
      }

      // Validate the contract and token ID
      const isValid = await validateContract(contractAddress, tokenId, walletAddress);

      if (!isValid) {
        setMessage({ type: 'error', text: 'Invalid ZeroContract or you do not own the token.' });
        setLoading(false);
        return;
      }

      // Submit the entry
      await submitEntry(walletAddress, contractAddress, tokenId);

      setMessage({ type: 'success', text: 'Entry submitted successfully!' });
      navigate('/thank-you');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <CountdownTimer />
      <Typography variant="h4" gutterBottom>
        Submit Your Entry
      </Typography>
      <Typography variant="body1" gutterBottom>
        Welcome to the 9th Save The World With Art™ Art Prize! To participate, please mint your 1/1
        on-chain art using our platform{' '}
        <a href="https://savetheworldwithart.io" target="_blank" rel="noopener noreferrer">
          savetheworldwithart.io
        </a>
        . Then, submit your ZeroContract address and Token ID below.
      </Typography>

      <Box sx={{ mt: 2 }}>
        {!walletAddress ? (
          <Button variant="contained" color="secondary" onClick={connectWallet}>
            Connect Wallet
          </Button>
        ) : (
          <Typography variant="body1">Connected Wallet: {walletAddress}</Typography>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="ZeroContract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <ReCAPTCHA
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          onChange={(value) => setCaptchaValue(value)}
        />
        {message.text && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!walletAddress || loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Entry'}
        </Button>
      </Box>
    </Container>
  );
};

const CountdownTimer = () => {
  const endDate = new Date('2024-12-25T00:00:00');

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return <Typography variant="h6" color="error">Submission period has ended.</Typography>;
    } else {
      return (
        <Typography variant="h6" color="error">
          Submission ends in: {days}d {hours}h {minutes}m {seconds}s
        </Typography>
      );
    }
  };

  return <Countdown date={endDate} renderer={renderer} />;
};

export default SubmitEntry;

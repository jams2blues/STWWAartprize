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
  Grid,
} from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';

const SubmitEntry = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!captchaValue) {
      setMessage({ type: 'error', text: 'Please complete the CAPTCHA.' });
      setLoading(false);
      return;
    }

    try {
      // Validate input fields
      if (!contractAddress || !tokenId) {
        throw new Error('Please fill in all fields.');
      }

      // Check if the user has already submitted an entry
      const entriesRef = collection(db, 'entries');
      const q = query(entriesRef, where('wallet_address', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('You have already submitted an entry.');
      }

      // Submit the entry
      await addDoc(entriesRef, {
        wallet_address: auth.currentUser.uid,
        contract_address: contractAddress,
        token_id: tokenId,
        votes: 0,
        created_at: serverTimestamp(),
      });

      setMessage({ type: 'success', text: 'Entry submitted successfully!' });
      setContractAddress('');
      setTokenId('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setCaptchaValue(null); // Reset CAPTCHA
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        bgcolor: '#000000',
        color: '#FFFFFF',
        minHeight: '80vh',
        padding: 4,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Submit Your Entry
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="ZeroContract Address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            sx={{
              input: { color: '#FFFFFF' },
              label: { color: '#FFFFFF' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#FFFFFF',
                },
                '&:hover fieldset': {
                  borderColor: '#1E90FF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1E90FF',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            sx={{
              input: { color: '#FFFFFF' },
              label: { color: '#FFFFFF' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#FFFFFF',
                },
                '&:hover fieldset': {
                  borderColor: '#1E90FF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1E90FF',
                },
              },
            }}
          />
        </Grid>
      </Grid>
      <ReCAPTCHA
        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        onChange={handleCaptchaChange}
        theme="dark"
        style={{ marginTop: '16px' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
        sx={{ mt: 2 }}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Submit Entry'}
      </Button>
    </Container>
  );
};

export default SubmitEntry;

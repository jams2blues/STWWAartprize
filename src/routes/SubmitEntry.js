// src/routes/SubmitEntry.js

import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import WalletConnectButton from '../components/WalletConnectButton';
import { WalletContext } from '../contexts/WalletContext';
import axios from 'axios';

function SubmitEntry() {
  const [objktUrl, setObjktUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { walletAddress, Tezos } = useContext(WalletContext); // Removed connectWallet and disconnectWallet

  const handleSubmit = async () => {
    setMessage({ type: '', text: '' });

    // Basic form validation
    if (!walletAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet.' });
      return;
    }

    if (!objktUrl || !twitterHandle) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!captchaValue) {
      setMessage({ type: 'error', text: 'Please complete the reCAPTCHA.' });
      return;
    }

    // Send reCAPTCHA token to your API for verification
    try {
      const captchaResponse = await axios.post('/api/verifyCaptcha', { token: captchaValue });

      if (!captchaResponse.data.success) {
        setMessage({ type: 'error', text: 'reCAPTCHA verification failed. Please try again.' });
        return;
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      setMessage({ type: 'error', text: 'reCAPTCHA verification error. Please try again.' });
      return;
    }

    // Extract contract address and token ID from OBJKT.com URL
    const regex = /https:\/\/objkt\.com\/tokens\/(KT1[a-zA-Z0-9]{33})\/(\d+)/;
    const match = objktUrl.match(regex);

    if (!match) {
      setMessage({ type: 'error', text: 'Please enter a valid OBJKT.com listing URL.' });
      return;
    }

    const contractAddress = match[1];
    const tokenId = match[2];

    // Verify if the contract is ZeroContract v1 or v2
    try {
      const contract = await Tezos.contract.at(contractAddress);
      const entrypoints = contract.entrypoints;

      // Function to detect contract version
      const detectContractVersion = (entrypoints) => {
        const v2UniqueEntrypoints = [
          'add_child',
          'add_parent',
          'remove_child',
          'remove_parent',
        ];

        const entrypointNames = Object.keys(entrypoints).map((ep) => ep.toLowerCase());

        const v2Present = v2UniqueEntrypoints.filter((ep) => entrypointNames.includes(ep));

        return v2Present.length >= 2 ? 'v2' : 'v1';
      };

      const contractVersion = detectContractVersion(entrypoints);

      if (contractVersion !== 'v1' && contractVersion !== 'v2') {
        setMessage({
          type: 'error',
          text: 'The contract is neither ZeroContract v1 nor v2. Please submit a valid ZeroContract entry.',
        });
        return;
      }
    } catch (error) {
      console.error('Contract verification failed:', error);
      setMessage({ type: 'error', text: 'Failed to verify the contract address.' });
      return;
    }

    // Prepare data to submit to Google Form
    const formData = new FormData();
    formData.append('entry.414551757', walletAddress); // Wallet Address
    formData.append('entry.295660436', contractAddress); // Contract Address
    formData.append('entry.594385145', tokenId); // Token ID
    formData.append('entry.1645919499', objktUrl); // OBJKT.com Listing URL
    formData.append('entry.1349731758', twitterHandle); // Twitter Handle

    // Submit data to Google Form
    try {
      await fetch(
        'https://docs.google.com/forms/u/0/d/e/1FAIpQLSfeHNVem0YEMZmJEPfE2VGM0PLB1bvGFCmQQF0Sz5EoaHk5BA/formResponse',
        {
          method: 'POST',
          mode: 'no-cors',
          body: formData,
        }
      );

      setMessage({ type: 'success', text: 'Your entry has been submitted successfully!' });
      // Reset form fields
      setObjktUrl('');
      setTwitterHandle('');
      setCaptchaValue(null);
    } catch (error) {
      console.error('Google Form submission error:', error);
      setMessage({ type: 'error', text: 'An error occurred while submitting your entry.' });
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Submit Your Entry
      </Typography>

      {/* Competition Rules */}
      <Box sx={{ mb: 4 }}>
        {/* ... [Competition Rules Content] */}
      </Box>

      {/* Display messages */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Wallet Connection */}
      <WalletConnectButton />

      {/* Submission Form */}
      {walletAddress && (
        <Box sx={{ mt: 4 }}>
          <TextField
            label="OBJKT.com Listing URL"
            fullWidth
            required
            value={objktUrl}
            onChange={(e) => setObjktUrl(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., https://objkt.com/tokens/KT1JFbuyKULdgHi8KjbPAx5Ys8znyXe8BDpn/2"
          />
          <TextField
            label="X (Twitter) Handle"
            fullWidth
            required
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="@yourhandle"
          />
          <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
            onChange={handleCaptchaChange}
            theme="light"
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
            Submit Entry
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default SubmitEntry;

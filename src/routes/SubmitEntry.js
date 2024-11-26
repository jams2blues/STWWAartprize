// src/routes/SubmitEntry.js

import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Link,
} from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import { WalletContext } from '@tezos-contrib/react-wallet-provider';
import WalletConnectButton from '../components/WalletConnectButton';

function SubmitEntry() {
  const [objktUrl, setObjktUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { account } = useContext(WalletContext);

  const handleSubmit = async () => {
    if (!account) {
      setMessage({ type: 'error', text: 'Please connect your wallet first.' });
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

    try {
      // Prepare data to submit to Google Form
      const formData = new FormData();
      formData.append('entry.414551757', account); // Wallet Address
      formData.append('entry.295660436', 'ZeroContract Address'); // Contract Address
      formData.append('entry.594385145', 'Token ID'); // Token ID
      formData.append('entry.1645919499', objktUrl); // OBJKT.com Listing URL
      formData.append('entry.1349731758', twitterHandle); // Twitter Handle

      // Submit data to Google Form
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
      setMessage({ type: 'error', text: 'An error occurred while submitting your entry.' });
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Submit Your Entry
      </Typography>

      {/* Display the competition rules here */}
      <Box sx={{ my: 2 }}>
        {/* Insert the formatted rules from section 1 here */}
        <Typography variant="body1">
          {/* [Include the rules and entry guide here as HTML or Typography components] */}
          {/* For brevity, I have not included them again here. */}
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <WalletConnectButton />

      {account && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Connected Wallet: {account}
        </Typography>
      )}

      <TextField
        label="OBJKT.com Listing URL"
        fullWidth
        required
        value={objktUrl}
        onChange={(e) => setObjktUrl(e.target.value)}
        sx={{ mt: 2 }}
      />
      <TextField
        label="X (Twitter) Handle"
        fullWidth
        required
        value={twitterHandle}
        onChange={(e) => setTwitterHandle(e.target.value)}
        sx={{ mt: 2 }}
      />
      <ReCAPTCHA
        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        onChange={handleCaptchaChange}
        sx={{ mt: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
        Submit Entry
      </Button>
    </Container>
  );
}

export default SubmitEntry;

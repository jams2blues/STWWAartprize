// src/routes/SubmitEntry.js

import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Link as MuiLink,
  Grid,
} from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import WalletConnectButton from '../components/WalletConnectButton';
import { WalletContext } from '../contexts/WalletContext';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import axios from 'axios';

dayjs.extend(duration);

function SubmitEntry() {
  const [objktUrl, setObjktUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { walletAddress } = useContext(WalletContext);
  const [timeLeft, setTimeLeft] = useState({});
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  // Set the deadline date (Christmas Day)
  const deadline = dayjs('2024-12-25T00:00:00');

  // Countdown Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const diff = deadline.diff(now);

      if (diff <= 0) {
        setIsDeadlinePassed(true);
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

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Check if the deadline has passed
    if (isDeadlinePassed) {
      setMessage({ type: 'error', text: 'The submission deadline has passed.' });
      return;
    }

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

    // Convert Twitter handle to https://x.com/handle
    const formattedTwitterHandle = twitterHandle.startsWith('@')
      ? `https://x.com/${twitterHandle.substring(1)}`
      : `https://x.com/${twitterHandle}`;

    console.log('Formatted Twitter Handle:', formattedTwitterHandle);

    // Send reCAPTCHA token to your API for verification
    try {
      console.log('Verifying reCAPTCHA token...');
      const captchaResponse = await axios.post('/api/verifyCaptcha', { token: captchaValue });

      console.log('reCAPTCHA response:', captchaResponse.data);

      if (!captchaResponse.data.success) {
        setMessage({ type: 'error', text: 'reCAPTCHA verification failed. Please try again.' });
        return;
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      setMessage({ type: 'error', text: 'reCAPTCHA verification error. Please try again.' });
      return;
    }

    // Submit data to Google Form
    submitToGoogleForm(walletAddress, objktUrl, formattedTwitterHandle);
  };

  // Function to submit data to Google Form using a hidden form submission
  const submitToGoogleForm = (walletAddr, objktUrl, twitterHandle) => {
    const GOOGLE_FORM_ACTION_URL =
      'https://docs.google.com/forms/d/e/1FAIpQLSf3_BasFTXaInMtTlatKjOmEJqWMJXBemj5ISpvBOHwltM3uw/formResponse';

    // Replace the following with your actual entry.X IDs
    const GOOGLE_FORM_ENTRY_IDS = {
      walletAddress: 'entry.1911590716',   // Replace with actual entry ID for 'wallet address'
      objktUrl: 'entry.932123603',        // Replace with actual entry ID for 'objkt url'
      twitterHandle: 'entry.551018139',   // Replace with actual entry ID for 'x handle'
    };

    // Log the data being submitted
    console.log('Submitting to Google Form with the following data:');
    console.log({
      walletAddress: walletAddr,
      objktUrl: objktUrl,
      twitterHandle: twitterHandle,
    });

    // Create a new form element
    const form = document.createElement('form');
    form.action = GOOGLE_FORM_ACTION_URL;
    form.method = 'POST';
    form.target = 'hidden_iframe'; // Change to '_blank' for debugging if needed

    // Create hidden input fields for each form entry
    const fields = {
      [GOOGLE_FORM_ENTRY_IDS.walletAddress]: walletAddr,
      [GOOGLE_FORM_ENTRY_IDS.objktUrl]: objktUrl,
      [GOOGLE_FORM_ENTRY_IDS.twitterHandle]: twitterHandle,
    };

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    // Optional: Add a hidden field to prevent bot submissions (you can remove if not needed)
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'fvv';
    hiddenInput.value = '1';
    form.appendChild(hiddenInput);

    // Append the form to the body
    document.body.appendChild(form);

    // Log the form's innerHTML for debugging
    console.log('Generated form:', form.innerHTML);

    // Create a hidden iframe to submit the form without redirecting
    let iframe = document.getElementById('hidden_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'hidden_iframe';
      iframe.id = 'hidden_iframe';
      iframe.onload = handleIframeLoad;
      document.body.appendChild(iframe);
      console.log('Created hidden iframe for form submission.');
    } else {
      console.log('Using existing hidden iframe for form submission.');
    }

    // Submit the form
    console.log('Submitting form...');
    form.submit();

    // Remove the form after submission
    document.body.removeChild(form);
    console.log('Form submitted and removed from the DOM.');
  };

  // Function to handle form submission completion
  const handleIframeLoad = () => {
    console.log('Form submission completed (iframe loaded).');

    // Show success message if submission is successful
    setMessage({ type: 'success', text: 'Your entry has been submitted successfully!' });

    // Reset form fields
    setObjktUrl('');
    setTwitterHandle('');
    setCaptchaValue(null);

    // Reset reCAPTCHA
    if (window.grecaptcha) {
      window.grecaptcha.reset();
    }
  };

  const handleCaptchaChange = (value) => {
    console.log('reCAPTCHA value changed:', value);
    setCaptchaValue(value);
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
        Save The World With Art™ 9th Art Prize
      </Typography>

      {/* Countdown Timer */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'red' }}>
          Time Left: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </Typography>
      </Box>

      {/* Competition Rules and Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          RULES and ENTRY Guide
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>ONLY 3 ENTRIES PER ARTIST</strong>
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Theme:</strong> <em>"Compressionism, anything goes, give us your best compressionism artwork under 20KB, show us what you got! Be yourself, no rules."</em>
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>We will be kicking off your auctions/making offers shortly after the countdown timer ends.</strong>
        </Typography>
        <ol>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Create a 1/1 fully on-chain Tezos NFT</strong> using either <strong>v1</strong> or <strong>v2</strong> of the <strong>#ZeroContract</strong> on the no-code platform{' '}
              <MuiLink href="https://savetheworldwithart.io" target="_blank" rel="noopener noreferrer">
                savetheworldwithart.io
              </MuiLink>
              . Be sure to test with{' '}
              <MuiLink href="https://ghostnet.savetheworldwithart.io" target="_blank" rel="noopener noreferrer">
                ghostnet.savetheworldwithart.io
              </MuiLink>{' '}
              first.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Connect</strong> the same wallet used to mint your art on savetheworldwithart.io to artprize.savetheworldwithart.io and paste your{' '}
              <strong>OBJKT.com listing</strong> in the following format:
              <br />
              <strong>Example:</strong>{' '}
              <MuiLink href="https://objkt.com/tokens/KT1JFbuyKULdgHi8KjbPAx5Ys8znyXe8BDpn/2" target="_blank" rel="noopener noreferrer">
                https://objkt.com/tokens/KT1JFbuyKULdgHi8KjbPAx5Ys8znyXe8BDpn/2
              </MuiLink>
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Enter your X (Twitter) handle</strong>.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Hit submit!</strong>
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              After submitting your artwork, make an <strong>X (Twitter)</strong> post showing off your on-chain art skills using our{' '}
              <MuiLink href="#" target="_blank" rel="noopener noreferrer">
                #STWWAprize
              </MuiLink>{' '}
              tag, and tag{' '}
              <MuiLink href="https://twitter.com/jams2blues" target="_blank" rel="noopener noreferrer">
                @jams2blues
              </MuiLink>{' '}
              if you want to.
            </Typography>
          </li>
        </ol>
        <Typography variant="body1" paragraph>
          <strong>When the countdown timer expires,</strong> our curation team will select the top 10 entries for a community-voted poll competition on X (Twitter). We will tag all entrants and make it fun! The top 3 winners of the poll-off will win the following prizes:
        </Typography>
        <ol type="I">
          <li>
            <Typography variant="body1" paragraph>
              <strong>1st place:</strong> Kick-off a live auction or receive an offer of <strong>$600 in Tezos</strong>, & a <strong>Gold Certificate of Achievement</strong> from Save The World With Art™.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>2nd place:</strong> Kick-off a live auction or receive an offer of <strong>$300 in Tezos</strong>, & a <strong>Silver Certificate of Achievement</strong> from Save The World With Art™.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>3rd place:</strong> Kick-off a live auction or receive an offer of <strong>$100 in Tezos</strong>, & a <strong>Copper Certificate of Achievement</strong> from Save The World With Art™.
            </Typography>
          </li>
        </ol>
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
      {walletAddress && !isDeadlinePassed && (
        <Box sx={{ mt: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* OBJKT.com Listing URL */}
              <Grid item xs={12}>
                <TextField
                  label="OBJKT.com Listing URL"
                  fullWidth
                  required
                  value={objktUrl}
                  onChange={(e) => setObjktUrl(e.target.value)}
                  placeholder="e.g., https://objkt.com/tokens/KT1Example/1"
                />
              </Grid>

              {/* X (Twitter) Handle */}
              <Grid item xs={12}>
                <TextField
                  label="X (Twitter) Handle"
                  fullWidth
                  required
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="@yourhandle"
                />
              </Grid>

              {/* reCAPTCHA */}
              <Grid item xs={12}>
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                  theme="light"
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Submit Entry
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      )}

      {/* Message when the deadline has passed */}
      {isDeadlinePassed && (
        <Alert severity="warning" sx={{ mt: 4 }}>
          The submission deadline has passed. Thank you for your interest!
        </Alert>
      )}
    </Container>
  );
}

export default SubmitEntry;

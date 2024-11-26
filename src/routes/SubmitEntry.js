// src/routes/SubmitEntry.js

import React, { useState, useContext, useEffect, useRef } from 'react';
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
  const { walletAddress, Tezos } = useContext(WalletContext);
  const [timeLeft, setTimeLeft] = useState({});
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  const formRef = useRef(null);

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

    // Populate hidden form fields
    document.getElementById('walletAddress').value = walletAddress;
    document.getElementById('contractAddress').value = contractAddress;
    document.getElementById('tokenId').value = tokenId;
    document.getElementById('objktUrl').value = objktUrl;
    document.getElementById('twitterHandle').value = twitterHandle;

    // Submit the form
    formRef.current.submit();

    // Note: Do not show success message here, wait for iframe load
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  // Function to handle form submission completion
  const handleIframeLoad = () => {
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
        <Typography variant="h5" gutterBottom>
          Submission Deadline Countdown
        </Typography>
        <Grid container justifyContent="center" spacing={2}>
          {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
            <Grid item key={unit}>
              <Typography variant="h2" sx={{ color: 'red', fontWeight: 'bold' }}>
                {timeLeft[unit] || '00'}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </Typography>
            </Grid>
          ))}
        </Grid>
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
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfeHNVem0YEMZmJEPfE2VGM0PLB1bvGFCmQQF0Sz5EoaHk5BA/formResponse"
            method="POST"
            target="hidden_iframe"
          >
            <Grid container spacing={2}>
              {/* OBJKT.com Listing URL */}
              <Grid item xs={12}>
                <TextField
                  label="OBJKT.com Listing URL"
                  fullWidth
                  required
                  value={objktUrl}
                  onChange={(e) => setObjktUrl(e.target.value)}
                  placeholder="e.g., https://objkt.com/tokens/KT1JFbuyKULdgHi8KjbPAx5Ys8znyXe8BDpn/2"
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

              {/* Hidden Form Inputs */}
              <input type="hidden" name="entry.414551757" id="walletAddress" />
              <input type="hidden" name="entry.295660436" id="contractAddress" />
              <input type="hidden" name="entry.594385145" id="tokenId" />
              <input type="hidden" name="entry.1645919499" id="objktUrl" />
              <input type="hidden" name="entry.1349731758" id="twitterHandle" />

              {/* Required hidden inputs for Google Forms */}
              <input type="hidden" name="fvv" value="1" />
              <input type="hidden" name="partialResponse" value="[]" />
              <input type="hidden" name="pageHistory" value="0" />
              <input type="hidden" name="fbzx" value={Date.now().toString()} />

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Submit Entry
                </Button>
              </Grid>
            </Grid>
          </form>
          {/* Hidden iframe to handle form submission */}
          <iframe
            name="hidden_iframe"
            style={{ display: 'none' }}
            onLoad={handleIframeLoad}
          ></iframe>
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
// src/routes/SubmitEntry.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Link as MuiLink,
} from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import WalletConnectButton from '../components/WalletConnectButton';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

function SubmitEntry() {
  const [objktUrl, setObjktUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [walletAddress, setWalletAddress] = useState(null);

  // Initialize Tezos Toolkit and Wallet
  const wallet = new BeaconWallet({
    name: 'Save The World With Art™ Art Prize',
    preferredNetwork: 'ghostnet', // Change to 'mainnet' when ready
  });

  const Tezos = new TezosToolkit('https://ghostnet.tezos.marigold.dev'); // Change RPC URL for mainnet

  useEffect(() => {
    const initWallet = async () => {
      Tezos.setWalletProvider(wallet);
      const activeAccount = await wallet.getActiveAccount();
      if (activeAccount) {
        setWalletAddress(activeAccount.address);
      }
    };
    initWallet();
  }, [Tezos, wallet]);

  const handleWalletConnected = (address) => {
    setWalletAddress(address);
  };

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
      const storage = await contract.storage();
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
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to verify the contract address.' });
      return;
    }

    // Prepare data to submit to Google Form
    const formData = new FormData();
    formData.append('entry.414551757', walletAddress); // Wallet Address
    formData.append('entry.295660436', 'ZeroContract Address'); // Contract Address (Placeholder)
    formData.append('entry.594385145', tokenId); // Token ID
    formData.append('entry.1645919499', objktUrl); // OBJKT.com Listing URL
    formData.append('entry.1349731758', twitterHandle); // Twitter Handle

    // Replace 'ZeroContract Address' with actual contract address
    formData.set('entry.295660436', 'ZeroContract Address Placeholder'); // Adjust if needed

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
      console.error(error);
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
      <WalletConnectButton onWalletConnected={handleWalletConnected} />

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

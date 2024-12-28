// artprize.savetheworldwithart.io/src/routes/Vote.js

import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import WalletConnectButton from '../components/WalletConnectButton';
import { WalletContext } from '../contexts/WalletContext';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import InfoIcon from '@mui/icons-material/Info';
import InfoModal from '../components/InfoModal';
import Pyramid from '../components/Pyramid';
import CountdownTimer from '../components/CountdownTimer'; // Importing the CountdownTimer

const Vote = () => {
  const { walletAddress } = useContext(WalletContext);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [captchaValue, setCaptchaValue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isVotingOpen, setIsVotingOpen] = useState(true);

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Callback when countdown ends
  const handleCountdownEnd = () => {
    setIsVotingOpen(false);
    setMessage({ type: 'info', text: 'Voting period has ended.' });
  };

  // 1) Fetch Top 10 Artworks
  const { data, error, isLoading } = useQuery('topArtworks', async () => {
    const response = await axios.get('/api/getTopArtworks');
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch artworks.');
    }
  }, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // 2) Mutation for voting
  const voteMutation = useMutation(
    async (uniqueTokenId) => {
      const [contractAddress, tokenId] = uniqueTokenId.split('_');
      const response = await axios.post('/api/vote', {
        walletAddress,
        contractAddress,
        tokenId: parseInt(tokenId, 10),
        captchaToken: captchaValue,
      });
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to record vote.');
      }
    },
    {
      onSuccess: (data) => {
        setMessage({ type: 'success', text: data.message });
        setCaptchaValue(null);
        queryClient.invalidateQueries('topArtworks');
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
      },
      onError: (error) => {
        setMessage({ type: 'error', text: error.message });
      },
    }
  );

  const handleVote = async (uniqueTokenId) => {
    if (!walletAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet to vote.' });
      return;
    }
    if (!captchaValue) {
      setMessage({ type: 'error', text: 'Please complete the reCAPTCHA.' });
      return;
    }
    if (!isVotingOpen) {
      setMessage({ type: 'error', text: 'Voting has ended.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      await voteMutation.mutateAsync(uniqueTokenId);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
        Cast Your Votes!
      </Typography>
      <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
        1st: $600, 2nd: $300, 3rd: $100
      </Typography>
      
      {/* Live Countdown Timer */}
      <CountdownTimer targetDate="2025-01-07T00:00:00Z" onEnd={handleCountdownEnd} /> {/* Update target date as needed */}

      {/* Information Modal */}
      <Box sx={{ textAlign: 'right', mb: 2 }}>
        <Button onClick={handleOpenModal}>
          <InfoIcon />
        </Button>
      </Box>
      <InfoModal open={openModal} handleClose={handleCloseModal} />

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Wallet */}
      <WalletConnectButton />

      {/* reCAPTCHA */}
      <Box sx={{ my: 2, textAlign: 'center' }}>
        <ReCAPTCHA
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          onChange={handleCaptchaChange}
          theme="light"
        />
      </Box>

      {/* Additional Refresh Button ABOVE the pyramid */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => queryClient.invalidateQueries('topArtworks')}
        >
          Refresh Live Winners
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load artworks. Please try again later.
        </Alert>
      ) : data.length === 10 ? (
        <>
          <Pyramid
            artworks={data}
            handleVote={handleVote}
            isSubmitting={isSubmitting}
            walletAddress={walletAddress}
            isVotingOpen={isVotingOpen} // Pass the voting status
          />

          {/* The existing Refresh Button at bottom */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => queryClient.invalidateQueries('topArtworks')}
            >
              Refresh Live Winners
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="h6" align="center">
          No artworks available for voting.
        </Typography>
      )}
    </Container>
  );
};

export default Vote;

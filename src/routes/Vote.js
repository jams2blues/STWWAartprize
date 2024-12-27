// src/routes/Vote.js

import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Button,
  Alert,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { supabase } from '../supabaseClient';
import WalletConnectButton from '../components/WalletConnectButton';
import { WalletContext } from '../contexts/WalletContext';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import InfoIcon from '@mui/icons-material/Info';
import InfoModal from '../components/InfoModal';

const Vote = () => {
  const { walletAddress, Tezos } = useContext(WalletContext);
  const queryClient = useQueryClient();
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [captchaValue, setCaptchaValue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Fetch Top 10 Artworks using React Query
  const { data, error, isLoading } = useQuery('topArtworks', async () => {
    const response = await axios.get('/api/getTopArtworks');
    if (response.data.success) {
      // Fetch metadata for each artwork
      const artworksWithMetadata = await Promise.all(
        response.data.data.map(async (vote) => {
          // Replace with your actual metadata endpoint or storage
          // Assuming you have a metadata URL endpoint; adjust as necessary
          const metadataUrl = `https://api.savetheworldwithart.io/metadata/${vote.token_id}`;
          const metadataResponse = await fetch(metadataUrl);
          if (!metadataResponse.ok) {
            throw new Error('Failed to fetch metadata');
          }
          const metadata = await metadataResponse.json();
          return {
            tokenId: vote.token_id,
            count: vote.vote_count,
            ...metadata,
          };
        })
      );
      return artworksWithMetadata;
    } else {
      throw new Error('Failed to fetch artworks.');
    }
  }, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for voting
  const voteMutation = useMutation(
    async (tokenId) => {
      const response = await axios.post('/api/vote', {
        walletAddress,
        tokenId,
        captchaToken: captchaValue,
      });
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to record vote.');
      }
    },
    {
      onSuccess: () => {
        setMessage({ type: 'success', text: 'Your vote has been recorded!' });
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

  const handleVote = async (tokenId) => {
    if (!walletAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet to vote.' });
      return;
    }

    if (!captchaValue) {
      setMessage({ type: 'error', text: 'Please complete the reCAPTCHA.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await voteMutation.mutateAsync(tokenId);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const getBorderStyle = (rank) => {
    switch (rank) {
      case 1:
        return '3px solid gold';
      case 2:
        return '3px solid silver';
      case 3:
        return '3px solid #cd7f32'; // Copper
      default:
        return '3px double blue';
    }
  };

  // Arrange artworks in pyramid structure
  const getPyramidRows = () => {
    const rows = [];
    if (data && data.length >= 10) {
      rows.push(data.slice(0, 1)); // 1st
      rows.push(data.slice(1, 3)); // 2nd, 3rd
      rows.push(data.slice(3, 6)); // 4th, 5th, 6th
      rows.push(data.slice(6, 10)); // 7th, 8th, 9th, 10th
    }
    return rows;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
        Save The World With Art™ Voting Platform
      </Typography>

      {/* Countdown Timer */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'red' }}>
          Voting ends on: {new Date('2025-01-03').toLocaleDateString()}
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
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          onChange={handleCaptchaChange}
          theme="light"
        />
      </Box>

      {/* Voting Section */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load artworks. Please try again later.
        </Alert>
      ) : data.length > 0 ? (
        <>
          <Grid container spacing={2} justifyContent="center">
            {getPyramidRows().map((row, rowIndex) => (
              <Grid
                container
                item
                xs={12}
                spacing={2}
                justifyContent="center"
                key={`row-${rowIndex}`}
                sx={{ mb: 2 }}
              >
                {row.map((artwork, index) => {
                  const rank =
                    rowIndex === 0
                      ? 1
                      : rowIndex === 1
                      ? 2 + index
                      : rowIndex === 2
                      ? 4 + index
                      : 7 + index;

                  return (
                    <Grid item xs={12} sm={6} md={3} lg={2.4} key={artwork.tokenId}>
                      <Card
                        sx={{
                          border: getBorderStyle(rank),
                          transition: 'transform 0.3s',
                          '&:hover': { transform: 'scale(1.05)' },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={artwork.artifactUri}
                          alt={artwork.name}
                          loading="lazy" // Lazy loading for performance
                        />
                        <CardContent>
                          <Typography variant="h6" component="div">
                            {artwork.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {artwork.description}
                          </Typography>
                          <Typography variant="subtitle2" color="text.primary" sx={{ mt: 1 }}>
                            Votes: {artwork.count}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleVote(artwork.tokenId)}
                            disabled={isSubmitting || !walletAddress}
                          >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Vote'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Grid>

          {/* Refresh Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="outlined" onClick={() => queryClient.invalidateQueries('topArtworks')}>
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

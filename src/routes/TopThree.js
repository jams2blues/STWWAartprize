// src/routes/TopThree.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { query } from 'thin-backend';
import { useQuery } from 'thin-backend-react';
import Countdown from 'react-countdown';

const TopThree = () => {
  const { data, error, loading } = useQuery(query('entries').orderByDesc('votes').limit(3));
  const [entries, setEntries] = useState([]);
  const [competitionEnded, setCompetitionEnded] = useState(false);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setEntries(data);
    } else {
      setEntries([]);
    }
  }, [data]);

  useEffect(() => {
    const now = new Date();
    const endDate = new Date('2024-12-25T00:00:00');
    if (now >= endDate) {
      setCompetitionEnded(true);
    }
  }, []);

  if (loading) {
    return (
      <Container
        maxWidth="md"
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
        maxWidth="md"
        sx={{
          mt: 4,
          bgcolor: '#000000',
          color: '#FFFFFF',
          minHeight: '80vh',
          padding: 4,
        }}
      >
        <Alert severity="error">Failed to load top entries. Please try again later.</Alert>
      </Container>
    );
  }

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
      <CountdownTimer />
      <Typography variant="h4" gutterBottom>
        Top 3 Artworks
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {entries && entries.length > 0 ? (
          entries.map((entry, index) => {
            const place = index + 1;
            let color;
            switch (place) {
              case 1:
                color = '#FFD700'; // Gold
                break;
              case 2:
                color = '#C0C0C0'; // Silver
                break;
              case 3:
                color = '#CD7F32'; // Bronze
                break;
              default:
                color = '#FFFFFF';
            }
            return (
              <Grid item xs={12} key={entry.id}>
                <Card sx={{ border: `2px solid ${color}`, borderRadius: 2, bgcolor: '#1a1a1a' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={`https://images.tzkt.io/${entry.contractAddress}/${entry.tokenId}`}
                    alt={`Token ID ${entry.tokenId}`}
                    loading="lazy" // Enable native lazy loading
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h5" sx={{ color }}>
                      {place === 1 ? '1st Place' : place === 2 ? '2nd Place' : '3rd Place'}
                    </Typography>
                    <Typography variant="h6">Artist: {entry.walletAddress}</Typography>
                    <Typography variant="body2">Votes: {entry.votes}</Typography>
                    {competitionEnded && (
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        Congratulations! You will receive $
                        {place === 1 ? '1000' : place === 2 ? '500' : '100'} in Tezos and a{' '}
                        {place === 1 ? 'Gold' : place === 2 ? 'Silver' : 'Bronze'} On-Chain Certificate.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1">No entries available.</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

const CountdownTimer = () => {
  const endDate = new Date('2024-12-25T00:00:00');

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return <Typography variant="h6" color="error">Competition Ended</Typography>;
    } else {
      return (
        <Typography variant="h6" color="error">
          Competition ends in: {days}d {hours}h {minutes}m {seconds}s
        </Typography>
      );
    }
  };

  return <Countdown date={endDate} renderer={renderer} />;
};

export default TopThree;

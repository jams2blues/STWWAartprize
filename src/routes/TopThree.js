// src/routes/TopThree.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const TopThree = () => {
  const [topEntries, setTopEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [competitionEnded, setCompetitionEnded] = useState(false);

  useEffect(() => {
    const fetchTopEntries = async () => {
      const entriesRef = collection(db, 'entries');
      const q = query(entriesRef, orderBy('votes', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      const topData = [];
      querySnapshot.forEach((doc) => {
        topData.push({ id: doc.id, ...doc.data() });
      });
      setTopEntries(topData);
      setLoading(false);
    };

    fetchTopEntries();

    // Check if competition has ended
    const endDate = new Date('2024-12-25T00:00:00');
    const now = new Date();
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
        Top 3 Artworks
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {topEntries.map((entry, index) => {
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
              <Card sx={{ border: 2, borderColor: color, borderRadius: 2, bgcolor: '#1a1a1a' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={`https://images.tzkt.io/${entry.contract_address}/${entry.token_id}`}
                  alt={`Token ID ${entry.token_id}`}
                  loading="lazy" // Enable native lazy loading
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h5" sx={{ color }}>
                    {place === 1 ? '1st Place' : place === 2 ? '2nd Place' : '3rd Place'}
                  </Typography>
                  <Typography variant="h6">Artist: {entry.wallet_address}</Typography>
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
        })}
        {topEntries.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1">No entries available.</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default TopThree;

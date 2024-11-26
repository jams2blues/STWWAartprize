// src/routes/VotingGallery.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  where,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';

const VotingGallery = () => {
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [votedEntryId, setVotedEntryId] = useState(null);
  const [captchaValue, setCaptchaValue] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const entriesRef = collection(db, 'entries');
      const q = query(entriesRef, orderBy('votes', 'desc'));
      const querySnapshot = await getDocs(q);
      const entriesData = [];
      querySnapshot.forEach((doc) => {
        entriesData.push({ id: doc.id, ...doc.data() });
      });
      setEntries(entriesData);
    };

    fetchEntries();
  }, []);

  useEffect(() => {
    const fetchUserVote = async () => {
      const votesRef = collection(db, 'votes');
      const q = query(votesRef, where('wallet_address', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const voteDoc = querySnapshot.docs[0];
        setVotedEntryId(voteDoc.data().entry_id);
      }
    };

    fetchUserVote();
  }, []);

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleVote = async (entryId) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!captchaValue) {
      setMessage({ type: 'error', text: 'Please complete the CAPTCHA.' });
      setLoading(false);
      return;
    }

    try {
      // Check if user has already voted
      const votesRef = collection(db, 'votes');
      const q = query(votesRef, where('wallet_address', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // User hasn't voted yet
        await addDoc(votesRef, {
          wallet_address: auth.currentUser.uid,
          entry_id: entryId,
          created_at: new Date(),
        });

        // Increment vote count
        const entryRef = doc(db, 'entries', entryId);
        await updateDoc(entryRef, {
          votes: (entries.find((entry) => entry.id === entryId).votes || 0) + 1,
        });

        setVotedEntryId(entryId);
        setMessage({ type: 'success', text: 'Your vote has been recorded!' });
      } else {
        // User has already voted, update their vote
        const voteDoc = querySnapshot.docs[0];
        const previousEntryId = voteDoc.data().entry_id;

        if (previousEntryId === entryId) {
          throw new Error('You have already voted for this entry.');
        }

        // Update the vote document
        const voteRef = doc(db, 'votes', voteDoc.id);
        await updateDoc(voteRef, {
          entry_id: entryId,
          created_at: new Date(),
        });

        // Decrement previous entry's vote count
        const prevEntryRef = doc(db, 'entries', previousEntryId);
        await updateDoc(prevEntryRef, {
          votes: (entries.find((entry) => entry.id === previousEntryId).votes || 1) - 1,
        });

        // Increment new entry's vote count
        const newEntryRef = doc(db, 'entries', entryId);
        await updateDoc(newEntryRef, {
          votes: (entries.find((entry) => entry.id === entryId).votes || 0) + 1,
        });

        setVotedEntryId(entryId);
        setMessage({ type: 'success', text: 'Your vote has been updated!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setCaptchaValue(null); // Reset CAPTCHA
    }
  };

  return (
    <Container
      maxWidth="lg"
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
        Voting Gallery
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
        {entries.map((entry) => (
          <Grid item xs={12} sm={6} md={4} key={entry.id}>
            <Card sx={{ bgcolor: '#1a1a1a', borderRadius: 2 }}>
              <CardMedia
                component="img"
                height="200"
                image={`https://images.tzkt.io/${entry.contract_address}/${entry.token_id}`}
                alt={`Token ID ${entry.token_id}`}
                loading="lazy" // Enable native lazy loading
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6">Artist: {entry.wallet_address}</Typography>
                <Typography variant="body2">Votes: {entry.votes}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleVote(entry.id)}
                  disabled={loading || (votedEntryId === entry.id)}
                  sx={{ mt: 1 }}
                >
                  {votedEntryId === entry.id ? 'Voted' : 'Vote'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <ReCAPTCHA
        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        onChange={handleCaptchaChange}
        theme="dark"
        style={{ marginTop: '16px' }}
      />
    </Container>
  );
};

export default VotingGallery;

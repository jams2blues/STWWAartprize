// src/components/Auth.js

import React, { useState } from 'react';
import { auth, googleProvider, twitterProvider } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { Google as GoogleIcon, Twitter as TwitterIcon } from '@mui/icons-material';

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAuth = async () => {
    setMessage({ type: '', text: '' });
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Registration successful!' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Login successful!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleSocialLogin = async (provider) => {
    setMessage({ type: '', text: '' });
    try {
      await signInWithPopup(auth, provider);
      setMessage({ type: 'success', text: 'Login successful!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage({ type: 'success', text: 'Logged out successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {isRegistering ? 'Register' : 'Login'}
      </Typography>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}
      <TextField
        label="Email"
        type="email"
        fullWidth
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" fullWidth onClick={handleAuth}>
        {isRegistering ? 'Register' : 'Login'}
      </Button>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Or
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={() => handleSocialLogin(googleProvider)}
          >
            Google
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<TwitterIcon />}
            onClick={() => handleSocialLogin(twitterProvider)}
          >
            Twitter
          </Button>
        </Grid>
      </Grid>
      <Button
        color="secondary"
        fullWidth
        onClick={() => setIsRegistering(!isRegistering)}
        sx={{ mt: 2 }}
      >
        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
      </Button>
      <Button variant="outlined" color="error" fullWidth onClick={handleLogout} sx={{ mt: 1 }}>
        Logout
      </Button>
    </Box>
  );
};

export default Auth;

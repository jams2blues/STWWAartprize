// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Enables dark mode
    primary: {
      main: '#1E90FF', // Dodger Blue
    },
    secondary: {
      main: '#FF4C4C', // Red
    },
    background: {
      default: '#000000', // Black background
      paper: '#1a1a1a', // Dark gray for paper components
    },
    text: {
      primary: '#FFFFFF', // White text
      secondary: '#FFFFFF', // White secondary text
    },
  },
  typography: {
    allVariants: {
      color: '#FFFFFF',
    },
    button: {
      textTransform: 'none', // Keeps button text as-is
    },
  },
});

export default theme;

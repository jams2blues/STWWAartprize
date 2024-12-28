// artprize.savetheworldwithart.io/src/components/CountdownTimer.js

import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';

const CountdownTimer = ({ targetDate, onEnd }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (Object.keys(newTimeLeft).length === 0 && onEnd) {
        onEnd();
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <Box key={interval} sx={{ display: 'inline-block', marginRight: '10px' }}>
        <Typography variant="h6">
          {timeLeft[interval]} {interval}
        </Typography>
      </Box>
    );
  });

  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      {timerComponents.length ? timerComponents : <Typography variant="h6">Voting has ended.</Typography>}
    </Box>
  );
};

export default CountdownTimer;

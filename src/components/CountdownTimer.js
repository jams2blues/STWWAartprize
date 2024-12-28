// src/components/CountdownTimer.js

import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isEnded: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = dayjs();
      const end = dayjs(targetDate);
      const diff = end.diff(now);

      if (diff <= 0) {
        return {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          isEnded: true,
        };
      }

      const dur = dayjs.duration(diff);

      return {
        days: String(Math.floor(dur.asDays())).padStart(2, '0'),
        hours: String(dur.hours()).padStart(2, '0'),
        minutes: String(dur.minutes()).padStart(2, '0'),
        seconds: String(dur.seconds()).padStart(2, '0'),
        isEnded: false,
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      {timeLeft.isEnded ? (
        <Typography variant="h6" sx={{ color: 'red' }}>
          Voting has ended.
        </Typography>
      ) : (
        <Typography variant="h6" sx={{ color: 'red' }}>
          Voting ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </Typography>
      )}
    </Box>
  );
};

export default CountdownTimer;

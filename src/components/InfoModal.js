// src/components/InfoModal.js

import React from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: 'auto',
};

const InfoModal = ({ open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="info-modal-title"
      aria-describedby="info-modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="info-modal-title" variant="h6" component="h2" gutterBottom>
          Competition Rules and Guidelines
        </Typography>
        <Typography id="info-modal-description" sx={{ mt: 2 }}>
          <strong>Submission Phase:</strong>
          <ol>
            <li>Create a 1/1 fully on-chain Tezos NFT using v1 or v2 of the #ZeroContract on the no-code platform savetheworldwithart.io. Test on ghostnet first.</li>
            <li>Connect your wallet to artprize.savetheworldwithart.io and submit your OBJKT.com listing.</li>
            <li>Enter your X (Twitter) handle.</li>
            <li>Submit your entry.</li>
            <li>Share your submission on X (Twitter) with the #STWWAprize tag.</li>
          </ol>

          <strong>Voting Phase:</strong>
          <ol>
            <li>Connect your Tezos wallet by clicking the "Connect Wallet" button.</li>
            <li>Complete the reCAPTCHA to verify you're not a bot.</li>
            <li>Select your favorite artwork by clicking the "Vote" button below it.</li>
            <li>You can change your vote at any time by voting for a different artwork.</li>
            <li>Click "Refresh Live Winners" to see the latest standings.</li>
          </ol>

          <strong>Prizes:</strong>
          <ol type="I">
            <li>1st place: $600 in Tezos & a Gold Certificate of Achievement.</li>
            <li>2nd place: $300 in Tezos & a Silver Certificate of Achievement.</li>
            <li>3rd place: $100 in Tezos & a Copper Certificate of Achievement.</li>
          </ol>
        </Typography>
      </Box>
    </Modal>
  );
};

export default InfoModal;

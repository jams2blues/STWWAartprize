// artprize.savetheworldwithart.io/src/components/Pyramid.js

import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search'; // Magnifying glass
import { styled } from '@mui/system';

const RankLabel = styled(Typography)(({ theme, rank }) => ({
  position: 'absolute',
  top: '-10px',
  left: '-10px',
  backgroundColor: '#ffffff',
  color: '#000000',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: '0 0 5px rgba(0,0,0,0.3)',
}));

const Pyramid = ({ artworks, handleVote, isSubmitting, walletAddress }) => {
  // For "Read more/less" toggles
  const [expandedIndexes, setExpandedIndexes] = useState({});

  // For the full-screen image preview
  const [previewUrl, setPreviewUrl] = useState('');
  const [openPreview, setOpenPreview] = useState(false);

  const toggleExpand = (index) => {
    setExpandedIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handlePreviewOpen = (imageUrl) => {
    setPreviewUrl(imageUrl);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
    setPreviewUrl('');
  };

  // Titles and descriptions smaller
  const titleStyle = {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  };

  const descriptionStyle = {
    fontSize: '0.85rem',
    color: '#ccc',
    lineHeight: 1.4,
  };

  const linkStyle = {
    color: 'cyan',       // or '#00ffff'
    textDecoration: 'underline',
  };

  const twitterLinkStyle = {
    color: 'red',   // or '#00008b'
    textDecoration: 'underline',
  };

  // Function to determine border style based on rank
  const getBorderStyle = (rank) => {
    switch (rank) {
      case 1:
        return '5px solid gold';
      case 2:
        return '5px solid silver';
      case 3:
        return '5px solid #cd7f32'; // Copper
      default:
        return '3px double blue';
    }
  };

  // Function to create pyramid rows
  const getPyramidRows = () => {
    const rows = [];
    if (artworks && artworks.length === 10) {
      rows.push([artworks[0]]); // 1st
      rows.push([artworks[1], artworks[2]]); // 2nd, 3rd
      rows.push([artworks[3], artworks[4], artworks[5]]); // 4th, 5th, 6th
      rows.push([artworks[6], artworks[7], artworks[8], artworks[9]]); // 7th, 8th, 9th, 10th
    }
    return rows;
  };

  // Function to map rank to ordinal (1st, 2nd, etc.)
  const getOrdinal = (rank) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = rank % 100;
    return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  return (
    <>
      {/* Full-Screen Image Dialog */}
      <Dialog open={openPreview} onClose={handlePreviewClose} maxWidth="xl">
        <DialogContent sx={{ p: 0, backgroundColor: '#000', textAlign: 'center' }}>
          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt="Full Preview"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Grid container spacing={2} justifyContent="center">
        {getPyramidRows().map((row, rowIndex) => (
          <Grid
            container
            item
            xs={12}
            spacing={2}
            justifyContent="center"
            key={`pyramid-row-${rowIndex}`}
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

              const ordinalRank = getOrdinal(rank);

              const uniqueTokenId = `${artwork.contractAddress}_${artwork.tokenId}`;
              const combinedIndex = rowIndex * 10 + index;
              const isExpanded = expandedIndexes[combinedIndex] || false;

              // For a short/long description
              const shortDescriptionLimit = 150;
              const hasLongDesc =
                artwork.description && artwork.description.length > shortDescriptionLimit;
              const displayDescription = !hasLongDesc || isExpanded
                ? artwork.description
                : artwork.description.substring(0, shortDescriptionLimit) + '...';

                return (
                  <Grid item xs={12} sm={6} md={3} lg={2.4} key={uniqueTokenId} sx={{ position: 'relative' }}>
                    {/* Rank Label */}
                    <RankLabel rank={rank}>
                      {ordinalRank}
                    </RankLabel>
  
                    <Card
                      sx={{
                        border: getBorderStyle(rank),
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    >
                    {artwork.image ? (
                      <Box sx={{ position: 'relative' }}>
                        {/* Magnifying Glass in top-right corner */}
                        <IconButton
                          size="small"
                          onClick={() => handlePreviewOpen(artwork.image)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 2,
                            color: '#fff',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.7)',
                            },
                          }}
                        >
                          <SearchIcon fontSize="small" />
                        </IconButton>

                        <CardMedia
                          component="img"
                          alt={artwork.name || 'NFT Image'}
                          src={artwork.image}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain', // preserve aspect ratio
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f0f0f0',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No Image Available
                        </Typography>
                      </Box>
                    )}

                    <CardContent>
                      <Typography sx={titleStyle}>
                        {artwork.name || `Token ${artwork.tokenId}`}
                      </Typography>

                      <Typography sx={descriptionStyle}>
                        {displayDescription}
                      </Typography>

                      {hasLongDesc && (
                        <Box sx={{ mt: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(combinedIndex)}
                            aria-label="toggle description"
                            sx={{ color: '#aaa' }}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ color: '#aaa', ml: 0.5 }}
                          >
                            {isExpanded ? 'Read less' : 'Read more'}
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        <strong>Votes:</strong> {artwork.voteCount}
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <a
                          href={artwork.objktLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={linkStyle}
                        >
                          View on Objkt.com
                        </a>
                      </Typography>

                      <Typography variant="body2">
                        <a
                          href={artwork.twitterHandle}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={twitterLinkStyle}
                        >
                          {artwork.twitterUsername}
                        </a>
                      </Typography>
                    </CardContent>

                    <CardActions>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleVote(uniqueTokenId)}
                        disabled={isSubmitting || !walletAddress || !isVotingOpen}
                      >
                        {isSubmitting ? 'Voting...' : 'Vote'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Pyramid;
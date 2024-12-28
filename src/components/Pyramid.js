// src/components/Pyramid.js

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
import SearchIcon from '@mui/icons-material/Search';

/*
  CHANGES/ADDITIONS:
  1) Ranks (1st - 10th) in the upper left corner of each card.
  2) Glow/Pulse effect for top 3 bands (gold, silver, copper).
  3) Magnifying glass (SearchIcon) top-right corner for fullscreen preview.
  4) Link colors: OBJKT => cyan, Twitter => red (as requested).
  5) Maintain aspect ratio with "objectFit: contain".
*/

const Pyramid = ({ artworks, handleVote, isSubmitting, walletAddress }) => {
  const [expandedIndexes, setExpandedIndexes] = useState({});
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
    setPreviewUrl('');
    setOpenPreview(false);
  };

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

  // Hyperlink styles
  const objktLinkStyle = {
    color: 'cyan',
    textDecoration: 'underline',
  };
  const twitterLinkStyle = {
    color: 'red',
    textDecoration: 'underline',
  };

  // For the top 3 glow effect
  const glowKeyframes = `
    @keyframes glow {
      0% {
        box-shadow: 0 0 5px #fff, 0 0 10px #fff;
      }
      50% {
        box-shadow: 0 0 15px #fff, 0 0 30px #fff;
      }
      100% {
        box-shadow: 0 0 5px #fff, 0 0 10px #fff;
      }
    }
  `;

  // Insert the keyframe style in the DOM if not existing
  if (typeof document !== 'undefined' && !document.getElementById('glowKeyframes')) {
    const style = document.createElement('style');
    style.id = 'glowKeyframes';
    style.innerHTML = glowKeyframes;
    document.head.appendChild(style);
  }

  const getCardStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          border: '5px solid gold',
          animation: 'glow 2s infinite',
        };
      case 2:
        return {
          border: '5px solid silver',
          animation: 'glow 2s infinite',
        };
      case 3:
        return {
          border: '5px solid #cd7f32', // copper
          animation: 'glow 2s infinite',
        };
      default:
        return {
          border: '3px double blue',
        };
    }
  };

  // Provide the tiny rank labels
  const getRankLabel = (rank) => {
    switch (rank) {
      case 1:
        return '1st';
      case 2:
        return '2nd';
      case 3:
        return '3rd';
      case 4:
        return '4th';
      case 5:
        return '5th';
      case 6:
        return '6th';
      case 7:
        return '7th';
      case 8:
        return '8th';
      case 9:
        return '9th';
      case 10:
        return '10th';
      default:
        return '';
    }
  };

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

  return (
    <>
      {/* Full-Screen Image Dialog */}
      <Dialog
        open={openPreview}
        onClose={handlePreviewClose}
        maxWidth="xl"
        PaperProps={{
          sx: {
            backgroundColor: '#000',
          },
        }}
      >
        <DialogContent sx={{ p: 0, textAlign: 'center' }}>
          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt="Full Preview"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '95vh',
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

              const uniqueTokenId = `${artwork.contractAddress}_${artwork.tokenId}`;
              const combinedIndex = rowIndex * 10 + index;
              const isExpanded = expandedIndexes[combinedIndex] || false;

              // rank label text
              const rankLabel = getRankLabel(rank);

              // short vs. long description
              const shortDescriptionLimit = 150;
              const hasLongDesc =
                artwork.description && artwork.description.length > shortDescriptionLimit;
              const displayDescription = !hasLongDesc || isExpanded
                ? artwork.description
                : artwork.description.substring(0, shortDescriptionLimit) + '...';

              return (
                <Grid item xs={12} sm={6} md={3} lg={2.4} key={uniqueTokenId}>
                  <Card
                    sx={{
                      position: 'relative',
                      ...getCardStyle(rank), // top 3 glow
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  >
                    {/* Tiny rank label in top-left corner */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: '#fff',
                        padding: '2px 5px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {rankLabel}
                    </Box>

                    {artwork.image ? (
                      <Box sx={{ position: 'relative' }}>
                        <IconButton
                          size="small"
                          onClick={() => handlePreviewOpen(artwork.image)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 3,
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
                            objectFit: 'contain',
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
                            onClick={() => {
                              setExpandedIndexes((prev) => ({
                                ...prev,
                                [combinedIndex]: !prev[combinedIndex],
                              }));
                            }}
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
                          style={objktLinkStyle}
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
                        disabled={isSubmitting || !walletAddress}
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

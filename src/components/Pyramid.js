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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Pyramid = ({ artworks, handleVote, isSubmitting, walletAddress }) => {
  // For handling "Read more" toggles
  const [expandedIndexes, setExpandedIndexes] = useState({});

  const toggleExpand = (index) => {
    setExpandedIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Make the font a bit smaller for title and description
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

            // Unique identifier combining contract_address and token_id
            const uniqueTokenId = `${artwork.contractAddress}_${artwork.tokenId}`;
            const combinedIndex = rowIndex * 10 + index; // or any unique index scheme
            const isExpanded = expandedIndexes[combinedIndex] || false;

            // Decide how to display the description
            const shortDescriptionLimit = 150;
            const shouldShowReadMore =
              artwork.description && artwork.description.length > shortDescriptionLimit;
            const displayDescription =
              !shouldShowReadMore || isExpanded
                ? artwork.description
                : artwork.description.substring(0, shortDescriptionLimit) + '...';

            return (
              <Grid item xs={12} sm={6} md={3} lg={2.4} key={uniqueTokenId}>
                <Card
                  sx={{
                    border: getBorderStyle(rank),
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                >
                  {artwork.image ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={artwork.image}
                      alt={artwork.name || 'NFT Image'}
                      loading="lazy"
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
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
                    <Typography sx={titleStyle} component="div">
                      {artwork.name || 'Unnamed Art'}
                    </Typography>
                    <Typography sx={descriptionStyle}>
                      {displayDescription}
                    </Typography>
                    {shouldShowReadMore && (
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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <a
                        href={artwork.objktLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#bbb', textDecoration: 'underline' }}
                      >
                        View on Objkt.com
                      </a>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <a
                        href={artwork.twitterHandle}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#bbb', textDecoration: 'underline' }}
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
  );
};

export default Pyramid;

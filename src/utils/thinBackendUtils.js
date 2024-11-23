// src/utils/thinBackendUtils.js

import { createRecord, query, updateRecord } from 'thin-backend';

export const submitEntry = async (walletAddress, contractAddress, tokenId) => {
  // Check if the user has already submitted an entry
  const existingEntry = await query('entries').where('walletAddress', walletAddress).fetchOne();

  if (existingEntry) {
    throw new Error('You have already submitted an entry.');
  }

  // Save the entry
  await createRecord('entries', {
    walletAddress,
    contractAddress,
    tokenId,
    votes: 0,
    createdAt: new Date(),
  });
};

export const recordVote = async (walletAddress, entryId) => {
  // Check if the user has already voted
  const existingVote = await query('votes').where('walletAddress', walletAddress).fetchOne();

  if (existingVote) {
    throw new Error('You have already voted.');
  }

  // Record the vote
  await createRecord('votes', {
    walletAddress,
    entryId,
    createdAt: new Date(),
  });

  // Increment the vote count
  const entry = await query('entries').findById(entryId);
  await updateRecord('entries', entryId, { votes: entry.votes + 1 });
};

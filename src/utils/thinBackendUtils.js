// src/utils/thinBackendUtils.js

import { createRecord, query, updateRecord } from 'thin-backend';

export const submitEntry = async (walletAddress, contractAddress, tokenId) => {
  // Check if the token has already been submitted
  const existingEntry = await query('entries')
    .where('contract_address', contractAddress)
    .where('token_id', tokenId)
    .fetchOne();

  if (existingEntry) {
    throw new Error('This token has already been submitted.');
  }

  // Save the entry
  await createRecord('entries', {
    wallet_address: walletAddress,
    contract_address: contractAddress,
    token_id: tokenId,
    votes: 0,
  });
};

export const recordVote = async (walletAddress, entryId) => {
  // Check if the user has already voted
  const existingVote = await query('votes')
    .where('wallet_address', walletAddress)
    .fetchOne();

  if (existingVote) {
    throw new Error('You have already voted.');
  }

  // Record the vote
  await createRecord('votes', {
    wallet_address: walletAddress,
    entry_id: entryId,
  });

  // Increment the vote count
  const entry = await query('entries').findById(entryId);
  if (!entry) {
    throw new Error('Entry not found.');
  }
  await updateRecord('entries', entryId, { votes: entry.votes + 1 });
};

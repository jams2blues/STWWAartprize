// src/utils/tezosUtils.js

import { TezosToolkit } from '@taquito/taquito';
import axios from 'axios';

const Tezos = new TezosToolkit('https://mainnet.api.tez.ie');
const API_BASE_URL = 'https://api.tzkt.io/v1';

// Function to detect contract version based on entrypoints
const detectContractVersion = (entrypoints) => {
  const v2UniqueEntrypoints = [
    'add_child',
    'add_parent',
    'remove_child',
    'remove_parent',
  ];

  // Extract all entrypoint names and convert to lowercase for case-insensitive comparison
  const entrypointNames = Object.keys(entrypoints).map((ep) => ep.toLowerCase());

  // Identify which unique v2 entrypoints are present
  const v2EntrypointsPresent = v2UniqueEntrypoints.filter((ep) =>
    entrypointNames.includes(ep)
  );

  // Determine contract version based on the presence of unique v2 entrypoints
  return v2EntrypointsPresent.length >= 2 ? 'v2' : 'v1';
};

export const validateContract = async (contractAddress, tokenId, walletAddress) => {
  try {
    // Step 1: Fetch the contract and its entrypoints
    const contract = await Tezos.contract.at(contractAddress);
    const entrypoints = contract.entrypoints.entrypoints;

    // Step 2: Detect contract version
    const contractVersion = detectContractVersion(entrypoints);

    // Validate that it's either v1 or v2
    if (contractVersion !== 'v1' && contractVersion !== 'v2') {
      console.error('Invalid contract version:', contractVersion);
      return false;
    }

    // Step 3: Fetch and parse the contract metadata
    const storage = await contract.storage();
    const metadataMap = storage.metadata;

    // Retrieve the metadata URI from the big map using the empty string key ''
    let metadataURI = await metadataMap.get('');

    if (!metadataURI) {
      console.error('Metadata URI not found in contract storage.');
      return false;
    }

    // Decode metadataURI from hex string to UTF-8 string
    if (metadataURI.bytes) {
      metadataURI = Buffer.from(metadataURI.bytes, 'hex').toString('utf8');
    } else if (typeof metadataURI === 'string') {
      metadataURI = Buffer.from(metadataURI, 'hex').toString('utf8');
    } else {
      console.error('Metadata URI has an unexpected type.');
      return false;
    }

    // Check if metadataURI starts with 'tezos-storage:'
    if (!metadataURI.startsWith('tezos-storage:')) {
      console.error('Unsupported metadata URI scheme. Expected "tezos-storage:".');
      return false;
    }

    const metadataKey = metadataURI.replace('tezos-storage:', '');

    // Retrieve the metadata content from the big map using the key from the URI
    let metadataContent = await metadataMap.get(metadataKey);

    if (!metadataContent) {
      console.error(`Metadata content not found in contract storage for key '${metadataKey}'.`);
      return false;
    }

    // Decode metadataContent from hex string to UTF-8 string
    if (metadataContent.bytes) {
      metadataContent = Buffer.from(metadataContent.bytes, 'hex').toString('utf8');
    } else if (typeof metadataContent === 'string') {
      metadataContent = Buffer.from(metadataContent, 'hex').toString('utf8');
    } else {
      console.error('Metadata content has an unexpected type.');
      return false;
    }

    // Optionally, perform additional checks on the metadata

    // Step 4: Fetch token data to ensure the token exists
    const tokenResponse = await axios.get(
      `${API_BASE_URL}/tokens?contract=${contractAddress}&tokenId=${tokenId}`
    );

    if (tokenResponse.data.length === 0) {
      console.error('Token not found.');
      return false;
    }

    const token = tokenResponse.data[0];

    // Step 5: Check if the token is a 1/1 edition
    if (token.totalSupply !== '1') {
      console.error('Token is not a 1/1 edition.');
      return false;
    }

    // Step 6: Check if the wallet address owns the token
    const ownershipResponse = await axios.get(
      `${API_BASE_URL}/tokens/balances?contract=${contractAddress}&token.id=${tokenId}&account=${walletAddress}`
    );

    if (ownershipResponse.data.length === 0) {
      console.error('Wallet does not own the token.');
      return false;
    }

    // All validations passed
    return true;
  } catch (error) {
    console.error('Error validating contract:', error);
    return false;
  }
};

// src/utils/tezosUtils.js

import axios from 'axios';

const API_BASE_URL = 'https://api.tzkt.io/v1';
const ZERO_CONTRACTS = [
  'KT1DcqMeusLGDgQBcXRdD9o9MfpQLjC55M4p',
  'KT1MRWLFjo1X1tv1GWoXYfMVQLEYpVr1rUj5',
  // ... Include all your ZeroContract addresses
];

export const validateContract = async (contractAddress, tokenId, walletAddress) => {
  try {
    // Check if the contract is a ZeroContract
    if (!ZERO_CONTRACTS.includes(contractAddress)) {
      return false;
    }

    // Fetch token data
    const tokenResponse = await axios.get(
      `${API_BASE_URL}/tokens?contract=${contractAddress}&tokenId=${tokenId}`
    );

    if (tokenResponse.data.length === 0) {
      return false;
    }

    const token = tokenResponse.data[0];

    // Check if the token is a 1/1 edition
    if (token.totalSupply !== '1') {
      return false;
    }

    // Check if the wallet address owns the token
    const ownershipResponse = await axios.get(
      `${API_BASE_URL}/tokens/balances?contract=${contractAddress}&token.id=${tokenId}&account=${walletAddress}`
    );

    if (ownershipResponse.data.length === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating contract:', error);
    return false;
  }
};

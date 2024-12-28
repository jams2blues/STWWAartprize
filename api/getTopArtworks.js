// artprize.savetheworldwithart.io/api/getTopArtworks.js

import { createClient } from '@supabase/supabase-js';
import { TezosToolkit } from '@taquito/taquito';

// Initialize Supabase with Server-Side Keys
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const Tezos = new TezosToolkit('https://mainnet.api.tez.ie');

const tokenDetailsMap = {
  'KT1Tj26yEQwFAKnpHCF6pWasz5qeYbVWC1iP_0': {
    objktLink: 'https://objkt.com/tokens/KT1Tj26yEQwFAKnpHCF6pWasz5qeYbVWC1iP/0',
    twitterHandle: 'https://x.com/JaycPraiz',
    twitterUsername: '@JaycPraiz',
  },
  'KT1DCRK2mkTdY25FkyMFjAiXkEFMQ8XWCBDr_0': {
    objktLink: 'https://objkt.com/tokens/KT1DCRK2mkTdY25FkyMFjAiXkEFMQ8XWCBDr/0',
    twitterHandle: 'https://twitter.com/JestemZero',
    twitterUsername: '@JestemZero',
  },
  'KT1TVawuuBjxzUWj4kY9su4QpU4bRJXNXaga_0': {
    objktLink: 'https://objkt.com/tokens/KT1TVawuuBjxzUWj4kY9su4QpU4bRJXNXaga/0',
    twitterHandle: 'https://x.com/MyReceiptTT',
    twitterUsername: '@MyReceiptTT',
  },
  'KT1LykCakzibfukS9XkfMtWE2yQ8Ak4G4tQD_4': {
    objktLink: 'https://objkt.com/tokens/KT1LykCakzibfukS9XkfMtWE2yQ8Ak4G4tQD/4',
    twitterHandle: 'https://x.com/neur0mancer1',
    twitterUsername: '@neur0mancer1',
  },
  'KT1VgQzWU6RmpCnRqWDi6NSF9jqZTvaKe99P_6': {
    objktLink: 'https://objkt.com/tokens/KT1VgQzWU6RmpCnRqWDi6NSF9jqZTvaKe99P/6',
    twitterHandle: 'https://x.com/Stalomir',
    twitterUsername: '@Stalomir',
  },
  'KT1MEH1sCeQm3VecuP9ykmas7bmQ3URTsTTc_5': {
    objktLink: 'https://objkt.com/tokens/KT1MEH1sCeQm3VecuP9ykmas7bmQ3URTsTTc/5',
    twitterHandle: 'https://x.com/santiagoitzcoat',
    twitterUsername: '@santiagoitzcoat',
  },
  'KT1XKuiQuubqTPehsLS4EHkWD2u7PR4ciAsp_2': {
    objktLink: 'https://objkt.com/tokens/KT1XKuiQuubqTPehsLS4EHkWD2u7PR4ciAsp/2',
    twitterHandle: 'https://twitter.com/oblivion_fields',
    twitterUsername: '@oblivion_fields',
  },
  'KT1QQaWkaft3B6Fdig6rAvVuvgPCGiqt9pFv_1': {
    objktLink: 'https://objkt.com/tokens/KT1QQaWkaft3B6Fdig6rAvVuvgPCGiqt9pFv/1',
    twitterHandle: 'https://twitter.com/msergisonmain',
    twitterUsername: '@msergisonmain',
  },
  'KT1A1r5J3NKVyhSBm2S7PPaG3Y1NtgAoUTho_30': {
    objktLink: 'https://objkt.com/tokens/KT1A1r5J3NKVyhSBm2S7PPaG3Y1NtgAoUTho/30',
    twitterHandle: 'https://twitter.com/WildMissingNos',
    twitterUsername: '@WildMissingNos',
  },
  'KT1VcZmxPrkiWe54vyZYnK9ggzxG5DJu7zgT_2': {
    objktLink: 'https://objkt.com/tokens/KT1VcZmxPrkiWe54vyZYnK9ggzxG5DJu7zgT/2',
    twitterHandle: 'https://twitter.com/My_3y3',
    twitterUsername: '@My_3y3',
  },
};

// Handler for GET /api/getTopArtworks
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Fetch vote counts for all predefined artworks
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .select('contract_address, token_id, count')
      .group('contract_address, token_id');

    if (voteError) {
      console.error('Supabase Vote Error:', voteError);
      throw voteError;
    }

    // Map vote counts for quick lookup
    const voteCountMap = {};
    voteData.forEach((vote) => {
      const key = `${vote.contract_address}_${vote.token_id}`;
      voteCountMap[key] = vote.count;
    });

    // Fetch metadata for predefined artworks
    const artworksWithMetadata = await Promise.all(
      predefinedArtworks.map(async (artwork) => {
        const { contractAddress, tokenId, objktLink, twitterHandle, twitterUsername } = artwork;
        const key = `${contractAddress}_${tokenId}`;
        const voteCount = voteCountMap[key] || 0;

        try {
          const contract = await Tezos.contract.at(contractAddress);
          const storage = await contract.storage();

          if (!storage.token_metadata) {
            throw new Error(`No token_metadata big map found on ${contractAddress}`);
          }
          const tokenMetadataBigMap = storage.token_metadata;

          const tokenMetadataPair = await tokenMetadataBigMap.get(tokenId);
          if (!tokenMetadataPair) {
            throw new Error(`No entry in token_metadata for token_id ${tokenId}`);
          }

          const { token_info } = tokenMetadataPair;

          const decodedFields = {};
          for (const [rawKey, rawVal] of token_info.entries()) {
            const utf8Val = Buffer.from(rawVal, 'hex').toString('utf8');
            decodedFields[rawKey] = utf8Val;
          }

          const name = decodedFields.name || `Token ${tokenId}`;
          const description = decodedFields.description || 'No description available.';
          const artifactUri = decodedFields.artifactUri || '';
          const imageUri = decodedFields.imageUri || '';
          const finalImage = artifactUri.length > 0 ? artifactUri : imageUri;

          return {
            contractAddress,
            tokenId,
            voteCount,
            name,
            description,
            image: finalImage,
            objktLink,
            twitterHandle,
            twitterUsername,
          };
        } catch (err) {
          console.error(`Error retrieving metadata for ${key}:`, err);
          return {
            contractAddress,
            tokenId,
            voteCount,
            name: `Token ${tokenId}`,
            description: 'No description available.',
            image: '',
            objktLink,
            twitterHandle,
            twitterUsername,
          };
        }
      })
    );

    return res.status(200).json({ success: true, data: artworksWithMetadata });
  } catch (err) {
    console.error('Error fetching top artworks:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
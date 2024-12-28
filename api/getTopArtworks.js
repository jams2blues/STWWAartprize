// File: artprize.savetheworldwithart.io/api/getTopArtworks.js

import { createClient } from '@supabase/supabase-js';
import { TezosToolkit } from '@taquito/taquito';

// ----------------------------
// 1) Initialize Supabase + RPC
// ----------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const Tezos = new TezosToolkit('https://mainnet.api.tez.ie');

// ----------------------------
// 2) Fallback Link Mappings
// ----------------------------
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

// ----------------------------
// 3) Handler: GET /api/getTopArtworks
// ----------------------------
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 3A. Use our Supabase RPC to get up to 10 top artworks
    const { data, error } = await supabase.rpc('get_top_artworks');
    if (error) {
      console.error('Supabase RPC Error:', error);
      return res.status(500).json({ success: false, message: 'RPC Error' });
    }

    // If there are no rows for some reason, just respond with empty
    if (!data || data.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 3B. For each item from RPC, fetch on-chain metadata
    const artworksWithMetadata = await Promise.all(
      data.map(async (record) => {
        const { contract_address, token_id, total_votes } = record;
        const key = `${contract_address}_${token_id}`;

        // 1) Grab fallback info from tokenDetailsMap
        const tokenDetails = tokenDetailsMap[key] || {
          objktLink: `https://objkt.com/tokens/${contract_address}/${token_id}`,
          twitterHandle: '#',
          twitterUsername: '@unknown',
        };

        try {
          // 2) Access the contract's storage
          const contract = await Tezos.contract.at(contract_address);
          const storage = await contract.storage();

          // 3) The token_metadata big_map is typically in `storage.token_metadata`
          if (!storage.token_metadata) {
            throw new Error(`No token_metadata big map found on contract ${contract_address}`);
          }
          const tokenMetadataBigMap = storage.token_metadata;

          // 4) Retrieve the record for this token_id
          const tokenMetadataPair = await tokenMetadataBigMap.get(token_id);
          if (!tokenMetadataPair) {
            throw new Error(`No token_metadata for token_id: ${token_id}`);
          }

          // 5) Extract token_info, decode the relevant fields
          const { token_info } = tokenMetadataPair;
          const decodedFields = {};
          for (const [rawKey, rawVal] of token_info.entries()) {
            const utf8Val = Buffer.from(rawVal, 'hex').toString('utf8');
            decodedFields[rawKey] = utf8Val;
          }

          // 6) Identify name, description, artifactUri, imageUri
          const name = decodedFields.name || `Token ${token_id}`;
          const description = decodedFields.description || 'No description available.';
          const artifactUri = decodedFields.artifactUri || '';
          const imageUri = decodedFields.imageUri || '';
          const finalImage = artifactUri.length > 0 ? artifactUri : imageUri;

          // 7) Return final artwork object
          return {
            contractAddress: contract_address,
            tokenId: token_id,
            voteCount: parseInt(total_votes, 10),
            name,
            description,
            image: finalImage,
            objktLink: tokenDetails.objktLink,
            twitterHandle: tokenDetails.twitterHandle,
            twitterUsername: tokenDetails.twitterUsername,
          };
        } catch (err) {
          console.error(`Metadata retrieval error for ${key}:`, err);
          // fallback
          return {
            contractAddress: contract_address,
            tokenId: token_id,
            voteCount: parseInt(total_votes, 10),
            name: `Token ${token_id}`,
            description: 'No description available.',
            image: '',
            objktLink: tokenDetails.objktLink,
            twitterHandle: tokenDetails.twitterHandle,
            twitterUsername: tokenDetails.twitterUsername,
          };
        }
      })
    );

    // 3C. Return final JSON
    return res.status(200).json({ success: true, data: artworksWithMetadata });
  } catch (err) {
    console.error('Error in getTopArtworks:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

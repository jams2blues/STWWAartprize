// src/api/getTopArtworks.js

import { createClient } from '@supabase/supabase-js';
import { TezosToolkit } from '@taquito/taquito';

// ----------------------------------
// 1. Initialize Supabase & Taquito
// ----------------------------------

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const Tezos = new TezosToolkit('https://mainnet.api.tez.ie');

// -------------------------------------------
// 2. Prepare Our tokenDetailsMap for Links
// -------------------------------------------

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

// --------------------------------------------
// 3. The Handler for GET /api/getTopArtworks
// --------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 3A. Pull top 10 from supabase
    const { data, error, status } = await supabase
      .from('votes')
      .select('contract_address, token_id, vote_count')
      .order('vote_count', { ascending: false })
      .limit(10);

    if (error && status !== 406) {
      console.error('Supabase Error:', error);
      throw error;
    }
    if (!data || data.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 3B. For each item in supabase data, fetch token-level metadata
    const artworksWithMetadata = await Promise.all(
      data.map(async (vote) => {
        const { contract_address, token_id, vote_count } = vote;
        const key = `${contract_address}_${token_id}`;

        // 1) Grab fallback info from tokenDetailsMap
        const tokenDetails = tokenDetailsMap[key] || {
          objktLink: `https://objkt.com/tokens/${contract_address}/${token_id}`,
          twitterHandle: '#',
          twitterUsername: '@unknown',
        };

        try {
          // 2) Access the contract storage
          const contract = await Tezos.contract.at(contract_address);
          const storage = await contract.storage();

          // 3) The "token_metadata" big_map is in storage.token_metadata
          //    Each entry: { token_id: number, token_info: Map<string, bytes> }
          if (!storage.token_metadata) {
            throw new Error(`No token_metadata big map found on ${contract_address}`);
          }
          const tokenMetadataBigMap = storage.token_metadata;

          // 4) Retrieve the record for this token_id
          const tokenMetadataPair = await tokenMetadataBigMap.get(token_id);
          if (!tokenMetadataPair) {
            throw new Error(`No entry in token_metadata for token_id ${token_id}`);
          }

          // 5) Destructure the big map entry
          //    tokenMetadataPair is typically { token_id: X, token_info: Map(...) }
          const { token_info } = tokenMetadataPair;

          // 6) Decode all fields we care about
          const decodedFields = {};
          for (const [rawKey, rawVal] of token_info.entries()) {
            // rawVal is hex-encoded => convert to utf8
            const utf8Val = Buffer.from(rawVal, 'hex').toString('utf8');
            decodedFields[rawKey] = utf8Val;
          }

          // 7) We want name, description, image, etc.
          //    According to your notes, some store "artifactUri", some store "imageUri"
          //    We'll check them both.
          const name = decodedFields.name || `Token ${token_id}`;
          const description = decodedFields.description || 'No description available.';
          const artifactUri = decodedFields.artifactUri || '';
          const imageUri = decodedFields.imageUri || ''; // if present
          // If artifactUri is present, we prefer that.
          // Otherwise fallback to imageUri, etc.
          const finalImage = artifactUri.length > 0 ? artifactUri : imageUri;

          return {
            contractAddress: contract_address,
            tokenId: token_id,
            voteCount: vote_count,
            name,
            description,
            image: finalImage,
            objktLink: tokenDetails.objktLink,
            twitterHandle: tokenDetails.twitterHandle,
            twitterUsername: tokenDetails.twitterUsername,
          };
        } catch (err) {
          console.error(
            `Error retrieving metadata from token_metadata big map for ${contract_address}_${token_id}:`,
            err
          );
          // fallback if something fails
          return {
            contractAddress: contract_address,
            tokenId: token_id,
            voteCount: vote_count,
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

    return res.status(200).json({ success: true, data: artworksWithMetadata });
  } catch (err) {
    console.error('Error fetching top artworks:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

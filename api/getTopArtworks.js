// artprize.savetheworldwithart.io/api/getTopArtworks.js

import { createClient } from '@supabase/supabase-js';
import { TezosToolkit } from '@taquito/taquito';

// Initialize Supabase client with Service Role Key
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, // Public Supabase URL
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key for backend
);

// Initialize Taquito
const Tezos = new TezosToolkit('https://mainnet.api.tez.ie'); // Ensure this matches your network

// Mapping of (contract_address, token_id) to objktLink and twitterHandle
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Fetch top 10 artworks ordered by vote_count descending
    const { data, error, status } = await supabase
      .from('votes')
      .select('contract_address, token_id, vote_count')
      .order('vote_count', { ascending: false })
      .limit(10);

    if (error && status !== 406) { // 406: Not Acceptable (no data)
      console.error('Supabase Error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Fetch metadata for each token
    const artworksWithMetadata = await Promise.all(
      data.map(async (vote) => {
        const { contract_address, token_id, vote_count } = vote;
        const key = `${contract_address}_${token_id}`;
        const tokenDetails = tokenDetailsMap[key] || {
          objktLink: `https://objkt.com/tokens/${contract_address}/${token_id}`,
          twitterHandle: '#',
          twitterUsername: '@unknown',
        };

        try {
          const contract = await Tezos.contract.at(contract_address);
          const tokenMetadata = await contract.views.get_metadata.tokenId(token_id).read();

          // Parse metadata
          let metadata = {};
          if (tokenMetadata.artifactUri && tokenMetadata.mimeType) {
            const dataUriPrefix = `data:${tokenMetadata.mimeType};base64,`;
            const base64Data = tokenMetadata.artifactUri.replace(dataUriPrefix, '');
            const image = `data:${tokenMetadata.mimeType};base64,${base64Data}`;
            metadata = {
              name: tokenMetadata.name || `Token ${token_id}`,
              description: tokenMetadata.description || '',
              image,
            };
          }

          return {
            contractAddress: contract_address,
            tokenId: token_id,
            voteCount: vote_count,
            ...metadata,
            objktLink: tokenDetails.objktLink,
            twitterHandle: tokenDetails.twitterHandle,
            twitterUsername: tokenDetails.twitterUsername,
          };
        } catch (metadataError) {
          console.error(`Error fetching metadata for token ${contract_address}_${token_id}:`, metadataError);
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
  } catch (error) {
    console.error('Error fetching top artworks:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

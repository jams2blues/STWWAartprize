// pages/api/getTopArtworks.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with Service Role Key
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, // Public Supabase URL
  process.env.SUPABASE_SERVICE_ROLE_KEY // **Service Role Key** for backend
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Fetch top 10 artworks ordered by vote count descending
    const { data, error, status } = await supabase
      .from('votes')
      .select('wallet_address, token_id, vote_count')
      .order('vote_count', { ascending: false })
      .limit(10);

    if (error && status !== 406) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching top artworks:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

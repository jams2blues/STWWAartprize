// artprize.savetheworldwithart.io/api/getTopArtworks.js

import { supabase } from '../../src/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    // Fetch votes grouped by token_id with their counts
    const { data, error } = await supabase
      .from('votes')
      .select('token_id, count(*) as vote_count')
      .group('token_id')
      .order('vote_count', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching top artworks:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

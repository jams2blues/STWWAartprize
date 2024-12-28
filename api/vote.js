// artprize.savetheworldwithart.io/api/vote.js

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client with Service Role Key
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, // Public Supabase URL
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key for backend
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { walletAddress, contractAddress, tokenId, captchaToken } = req.body;

  // Basic validation
  if (!walletAddress || !contractAddress || tokenId === undefined || !captchaToken) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    // Verify reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaResponse = await axios.post(verifyUrl);

    if (!captchaResponse.data.success) {
      return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
    }

    // Check if the user has already voted for this token
    const { data: existingVote, error: selectError } = await supabase
      .from('votes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('contract_address', contractAddress)
      .eq('token_id', tokenId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // 'PGRST116' = No rows found
      throw selectError;
    }

    if (existingVote) {
      // User has already voted for this token, increment vote_count
      const { data, error } = await supabase
        .from('votes')
        .update({ vote_count: existingVote.vote_count + 1 })
        .eq('wallet_address', walletAddress)
        .eq('contract_address', contractAddress)
        .eq('token_id', tokenId);

      if (error) {
        throw error;
      }

      return res.status(200).json({ success: true, message: 'Vote updated successfully.', data });
    } else {
      // First time voting for this token, insert a new row
      const { data, error } = await supabase
        .from('votes')
        .insert([{ wallet_address: walletAddress, contract_address: contractAddress, token_id: tokenId, vote_count: 1 }]);

      if (error) {
        throw error;
      }

      return res.status(200).json({ success: true, message: 'Vote recorded successfully.', data });
    }
  } catch (error) {
    console.error('Error processing vote:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

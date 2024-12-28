// artprize.savetheworldwithart.io/api/vote.js

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// We strongly recommend using non-prefixed env vars on the server side
// e.g., process.env.SUPABASE_URL & process.env.SUPABASE_SERVICE_ROLE_KEY
// so rename them in your Vercel environment if needed:
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client with Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { walletAddress, contractAddress, tokenId, captchaToken } = req.body;

  // Basic validation
  if (!walletAddress || !contractAddress || tokenId === undefined || !captchaToken) {
    console.error('[vote.js] Missing required fields in request body:', {
      walletAddress,
      contractAddress,
      tokenId,
      captchaToken: !!captchaToken, // just show if present
    });
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    // DEBUG: Log environment usage
    console.log('[vote.js] Using SUPABASE_URL:', SUPABASE_URL);
    console.log('[vote.js] Using SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY);
    console.log('[vote.js] Attempting to verify reCAPTCHA...');

    // 1) Verify reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaResponse = await axios.post(verifyUrl);

    if (!captchaResponse.data.success) {
      console.error('[vote.js] reCAPTCHA verification failed:', captchaResponse.data);
      return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
    }

    // 2) Check if the user has already voted
    console.log('[vote.js] Checking existingVote for:', {
      walletAddress,
      contractAddress,
      tokenId,
    });
    const { data: existingVote, error: selectError } = await supabase
      .from('votes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('contract_address', contractAddress)
      .eq('token_id', tokenId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // 'PGRST116' = No rows found => not an actual error
      console.error('[vote.js] selectError:', selectError);
      throw selectError;
    }

    // 3) Insert or update vote
    if (existingVote) {
      // User has voted for this token, increment
      console.log('[vote.js] Found existingVote, incrementing...');
      const { data, error: updateError } = await supabase
        .from('votes')
        .update({ vote_count: existingVote.vote_count + 1 })
        .eq('wallet_address', walletAddress)
        .eq('contract_address', contractAddress)
        .eq('token_id', tokenId);

      if (updateError) {
        console.error('[vote.js] updateError:', updateError);
        throw updateError;
      }

      return res
        .status(200)
        .json({ success: true, message: 'Vote updated successfully.', data });
    } else {
      // First time voting for this token
      console.log('[vote.js] No existing vote found, inserting new row...');
      const { data, error: insertError } = await supabase
        .from('votes')
        .insert([
          {
            wallet_address: walletAddress,
            contract_address: contractAddress,
            token_id: tokenId,
            vote_count: 1,
          },
        ]);

      if (insertError) {
        console.error('[vote.js] insertError:', insertError);
        throw insertError;
      }

      return res
        .status(200)
        .json({ success: true, message: 'Vote recorded successfully.', data });
    }
  } catch (error) {
    console.error('[vote.js] Error processing vote:', error);

    // If row-level security (RLS) is on but there's no policy allowing inserts/updates,
    // that can cause a 500. Check your Supabase RLS policies on the 'votes' table.
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// artprize.savetheworldwithart.io/api/vote.js

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// We'll rename environment variables for server usage
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Set the countdown deadline (e.g., 2025-01-03). Any format you like:
const DEADLINE = '2025-01-03T00:00:00Z';
// Alternatively, store this date in an environment variable if you prefer

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 1) Check request body
  const { walletAddress, contractAddress, tokenId, captchaToken } = req.body || {};
  if (!walletAddress || !contractAddress || tokenId === undefined || !captchaToken) {
    console.error('[vote.js] Missing fields:', { walletAddress, contractAddress, tokenId, captchaToken });
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    // 2) Disallow votes if past the countdown
    const now = new Date().toISOString();
    if (now > DEADLINE) {
      // after the countdown, no new or changed votes
      console.error('[vote.js] Attempt to vote after deadline:', now, '>', DEADLINE);
      return res.status(400).json({ success: false, message: 'Voting period has ended.' });
    }

    // 3) Verify reCAPTCHA
    console.log('[vote.js] Checking reCAPTCHA...');
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaResponse = await axios.post(verifyUrl);

    if (!captchaResponse.data.success) {
      console.error('[vote.js] reCAPTCHA failed:', captchaResponse.data);
      return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
    }

    // 4) Check if user has an existing row (ignore token_id).
    //    We store exactly one row per wallet, tracking the user’s current vote.
    console.log('[vote.js] Checking for existing row for wallet:', walletAddress);
    const { data: existingRow, error: existingRowError } = await supabase
      .from('votes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    // If error is anything other than "no row found," abort
    if (existingRowError && existingRowError.code !== 'PGRST116') {
      console.error('[vote.js] existingRowError:', existingRowError);
      throw existingRowError;
    }

    if (existingRow) {
      // 5) If row found, update its token_id
      console.log('[vote.js] Found existing row => updating token_id...');
      const { data: updated, error: updateError } = await supabase
        .from('votes')
        .update({
          contract_address: contractAddress,
          token_id: tokenId,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress);

      if (updateError) {
        console.error('[vote.js] updateError:', updateError);
        throw updateError;
      }

      return res.status(200).json({
        success: true,
        message: 'Vote updated successfully.',
        data: updated,
      });
    } else {
      // 6) If no row, insert new record
      console.log('[vote.js] No existing row => inserting new row...');
      const { data: inserted, error: insertError } = await supabase
        .from('votes')
        .insert([
          {
            wallet_address: walletAddress,
            contract_address: contractAddress,
            token_id: tokenId,
            vote_count: 1, // or 0 if you want
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error('[vote.js] insertError:', insertError);
        throw insertError;
      }

      return res.status(200).json({
        success: true,
        message: 'Vote recorded successfully.',
        data: inserted,
      });
    }
  } catch (error) {
    console.error('[vote.js] Error processing vote:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

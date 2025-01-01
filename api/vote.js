// File: artprize.savetheworldwithart.io/api/vote.js

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase with Server-Side Keys
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Define Voting End Time (Adjust as needed)
const VOTING_END_TIME = new Date('2025-01-07T00:00:00Z'); // Update as needed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { walletAddress, contractAddress, tokenId, captchaToken } = req.body;

  // Basic validation
  if (!walletAddress || !contractAddress || tokenId === undefined || !captchaToken) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  // Check if voting period has ended
  const currentTime = new Date();
  if (currentTime > VOTING_END_TIME) {
    return res.status(400).json({ success: false, message: 'Voting period has ended.' });
  }

  // 1) Parse IP & User Agent
  // In Vercel/Next, 'x-forwarded-for' is often the best chance to get the real client IP
  const ipAddress =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';
  const userAgent = req.headers['user-agent'] || '';

  try {
    // 2) Verify reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaResponse = await axios.post(verifyUrl);

    if (!captchaResponse.data.success) {
      return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
    }

    // 3) Validate Artwork
    const allowedArtworks = {
      'KT1Tj26yEQwFAKnpHCF6pWasz5qeYbVWC1iP_0': true,
      'KT1DCRK2mkTdY25FkyMFjAiXkEFMQ8XWCBDr_0': true,
      'KT1TVawuuBjxzUWj4kY9su4QpU4bRJXNXaga_0': true,
      'KT1LykCakzibfukS9XkfMtWE2yQ8Ak4G4tQD_4': true,
      'KT1VgQzWU6RmpCnRqWDi6NSF9jqZTvaKe99P_6': true,
      'KT1MEH1sCeQm3VecuP9ykmas7bmQ3URTsTTc_5': true,
      'KT1XKuiQuubqTPehsLS4EHkWD2u7PR4ciAsp_2': true,
      'KT1QQaWkaft3B6Fdig6rAvVuvgPCGiqt9pFv_1': true,
      'KT1A1r5J3NKVyhSBm2S7PPaG3Y1NtgAoUTho_30': true,
      'KT1VcZmxPrkiWe54vyZYnK9ggzxG5DJu7zgT_2': true,
    };
    const uniqueTokenId = `${contractAddress}_${tokenId}`;
    if (!allowedArtworks[uniqueTokenId]) {
      return res.status(400).json({ success: false, message: 'Invalid artwork selected.' });
    }

    // 4) Check Existing Vote
    const { data: existingVote, error: selectError } = await supabase
      .from('votes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { 
      // PGRST116 = no rows found
      console.error('Supabase Select Error:', selectError);
      throw selectError;
    }

    if (existingVote) {
      // 4A) If same vote, do nothing
      if (
        existingVote.contract_address === contractAddress &&
        existingVote.token_id === tokenId
      ) {
        return res.status(200).json({
          success: true,
          message: 'You have already voted for this artwork.',
        });
      } else {
        // 4B) User is changing vote
        const { data: updatedVote, error: updateError } = await supabase
          .from('votes')
          .update({
            contract_address: contractAddress,
            token_id: tokenId,
            ip_address: ipAddress,      // Store IP
            user_agent: userAgent,      // Store user-agent
            updated_at: new Date(),     // Keep track
          })
          .eq('wallet_address', walletAddress)
          .single();

        if (updateError) {
          console.error('Supabase Update Error:', updateError);
          throw updateError;
        }

        return res.status(200).json({
          success: true,
          message: 'Your vote has been updated successfully.',
          data: updatedVote,
        });
      }
    } else {
      // 5) First-time voter
      const { data: insertData, error: insertError } = await supabase
        .from('votes')
        .insert([
          {
            wallet_address: walletAddress,
            contract_address: contractAddress,
            token_id: tokenId,
            ip_address: ipAddress,  // Store IP
            user_agent: userAgent,  // Store user-agent
          },
        ]);

      if (insertError) {
        console.error('Supabase Insert Error:', insertError);
        throw insertError;
      }

      return res.status(200).json({
        success: true,
        message: 'Vote recorded successfully.',
        data: insertData,
      });
    }
  } catch (error) {
    console.error('Error processing vote:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

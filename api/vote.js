// artprize.savetheworldwithart.io/api/vote.js

import { supabase } from '../../src/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { walletAddress, tokenId, captchaToken } = req.body;

  // Basic input validation
  if (
    !walletAddress ||
    typeof walletAddress !== 'string' ||
    !tokenId ||
    typeof tokenId !== 'number' ||
    !captchaToken ||
    typeof captchaToken !== 'string'
  ) {
    res.status(400).json({ success: false, message: 'Invalid input data.' });
    return;
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Verify reCAPTCHA
  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`,
      { method: 'POST' }
    );

    const data = await response.json();

    if (!data.success) {
      res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
      return;
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    return;
  }

  try {
    // Check if the wallet has already voted
    const { data: existingVote, error: fetchError } = await supabase
      .from('votes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows found
      throw fetchError;
    }

    if (existingVote) {
      // Update the vote to the new token_id
      const { error: updateError } = await supabase
        .from('votes')
        .update({ token_id: tokenId, updated_at: new Date() })
        .eq('wallet_address', walletAddress);

      if (updateError) {
        throw updateError;
      }

      res.status(200).json({ success: true, message: 'Vote updated successfully.' });
    } else {
      // Insert a new vote
      const { error: insertError } = await supabase.from('votes').insert([
        {
          wallet_address: walletAddress,
          token_id: tokenId,
          created_at: new Date(),
        },
      ]);

      if (insertError) {
        // If the error is due to the unique constraint, return a specific message
        if (insertError.code === '23505') { // unique_violation
          res.status(400).json({ success: false, message: 'You have already voted. To change your vote, please update it.' });
          return;
        }
        throw insertError;
      }

      res.status(200).json({ success: true, message: 'Vote recorded successfully.' });
    }
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

/**
 * /api/verify-pin.js — Server-side PIN verification
 *
 * Compares a SHA-256 hash of the submitted PIN against the stored hash.
 * The plaintext PIN is NEVER stored or logged.
 */

import { createHash } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pin } = req.body || {};
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ error: 'Missing PIN' });
  }

  const storedHash = process.env.PARENT_PIN_HASH;
  if (!storedHash) {
    // If no PIN is configured, deny access
    return res.status(500).json({ error: 'PIN not configured on server' });
  }

  // Hash the submitted PIN and compare
  const submittedHash = createHash('sha256').update(pin).digest('hex');
  const valid = submittedHash === storedHash.toLowerCase();

  // Constant-time-ish delay to mitigate timing attacks
  await new Promise(resolve => setTimeout(resolve, 200));

  return res.status(200).json({ valid });
}

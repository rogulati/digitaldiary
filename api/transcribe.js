/**
 * /api/transcribe.js — Whisper transcription endpoint
 *
 * Accepts multipart form data with an "audio" file.
 * Uses busboy for proper multipart parsing (Vercel doesn't auto-parse).
 */

import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false, // We parse multipart ourselves
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  try {
    // Parse multipart form data using busboy
    const { default: Busboy } = await import('busboy');
    const chunks = [];

    await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      busboy.on('file', (_fieldname, file) => {
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {});
      });
      busboy.on('finish', resolve);
      busboy.on('error', reject);
      req.pipe(busboy);
    });

    if (chunks.length === 0) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBuffer = Buffer.concat(chunks);

    // Size limit: 25MB (Whisper's limit)
    if (audioBuffer.length > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'Audio file too large (max 25MB)' });
    }

    // Build FormData for OpenAI
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('file', blob, 'recording.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Whisper API error:', err);
      return res.status(502).json({ error: 'Transcription service failed' });
    }

    const data = await response.json();
    return res.status(200).json({ text: data.text });
  } catch (err) {
    console.error('Transcription error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

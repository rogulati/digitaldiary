/**
 * /api/punctuate.js — Format and punctuate a kid's story using GPT
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  const { storyText } = req.body || {};
  if (!storyText || typeof storyText !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "storyText" field' });
  }

  // Limit input length to prevent abuse
  const trimmedText = storyText.slice(0, 10000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful editor for children\'s stories. Fix the punctuation, capitalization, and formatting of the following story. Keep the original words and meaning. Return only the corrected text.',
          },
          { role: 'user', content: trimmedText },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', err);
      return res.status(502).json({ error: 'AI service failed' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || storyText;
    return res.status(200).json({ text });
  } catch (err) {
    console.error('Punctuate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

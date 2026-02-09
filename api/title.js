/**
 * /api/title.js — Generate a kid-friendly story title using GPT
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  const { story } = req.body || {};
  if (!story || typeof story !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "story" field' });
  }

  // Limit input length to prevent abuse
  const trimmedStory = story.slice(0, 5000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 60,
        messages: [
          {
            role: 'system',
            content: 'Generate a single short, cute, kid-friendly title for the following story. Return only the title text, nothing else.',
          },
          { role: 'user', content: trimmedStory },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', err);
      return res.status(502).json({ error: 'AI service failed' });
    }

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim() || 'Untitled Story';
    return res.status(200).json({ title });
  } catch (err) {
    console.error('Title generation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

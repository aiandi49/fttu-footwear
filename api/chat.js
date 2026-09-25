// /api/chat.js
// A tiny server-side proxy so the browser never needs (or sees) your Anthropic API key.
// Deploy this file at api/chat.js in the same Vercel project as index.html / fttu-engine.html —
// Vercel turns any file under /api into a serverless function automatically, no config needed.
//
// SETUP (one-time):
// 1. Get a Claude API key at https://console.anthropic.com (this is separate from a claude.ai
//    subscription — it's pay-per-use, billed by tokens, not part of any Claude Pro/Max plan).
// 2. In your Vercel project: Settings -> Environment Variables -> add
//      ANTHROPIC_API_KEY = sk-ant-...
//    then redeploy (env vars only apply to new deployments).
// 3. That's it — the frontend calls POST /api/chat and never touches the key.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. POST only.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Server is missing ANTHROPIC_API_KEY. Add it in Vercel -> Project -> Settings -> Environment Variables, then redeploy.'
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const system = body && body.system;
  const messages = body && body.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: '"messages" array is required.' });
    return;
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: system || undefined,
        messages: messages
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data });
      return;
    }

    const text = (data.content || [])
      .filter(function (b) { return b.type === 'text'; })
      .map(function (b) { return b.text; })
      .join('\n');

    res.status(200).json({ text: text });
  } catch (err) {
    res.status(500).json({ error: String((err && err.message) || err) });
  }
};

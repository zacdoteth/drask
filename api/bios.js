export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.BIOS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'BIOS API key not configured' });
  }

  const { action, message, conversationId, researchMode } = req.body;

  try {
    // Start a new deep research session or continue one
    if (action === 'start') {
      const params = new URLSearchParams();
      params.append('message', message);
      if (conversationId) params.append('conversationId', conversationId);
      params.append('researchMode', researchMode || 'steering');

      const response = await fetch('https://api.ai.bio.xyz/deep-research/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json(data);
    }

    // Poll / get conversation status
    if (action === 'get') {
      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId required for get' });
      }

      const response = await fetch(`https://api.ai.bio.xyz/deep-research/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json(data);
    }

    // List conversations
    if (action === 'list') {
      const response = await fetch('https://api.ai.bio.xyz/deep-research?limit=10', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Invalid action. Use: start, get, or list' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach BIOS API' });
  }
}

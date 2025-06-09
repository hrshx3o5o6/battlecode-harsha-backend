import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';

router.post('/', async (req, res) => {
  const { source_code, language_id, stdin = '' } = req.body;

  if (!source_code || !language_id) {
    return res.status(400).json({ error: 'Missing source_code or language_id' });
  }

  try {
    const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // or hardcoded if needed
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code,
        language_id,
        stdin
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Judge0 RapidAPI error: ${response.status} - ${err}`);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Judge0 Error:', error.message);
    res.status(500).json({ error: 'Code execution failed', detail: error.message });
  }
});

export default router;
import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com'; // or http://localhost:3000 if self-hosted

router.post('/', async (req, res) => {
  const { source_code, language_id, function_name, test_cases } = req.body;

  if (!source_code || !language_id || !function_name || !Array.isArray(test_cases)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const results = [];

  try {
    for (const test of test_cases) {
      const { input, expected_output } = test;

      const testRunner = `\nprint(Solution().${function_name}(${input}))`;

      const fullCode = `${source_code}\n${testRunner}`;

      const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          source_code: fullCode,
          language_id,
        }),
      });

      const data = await response.json();

      const output = (data.stdout || '').trim();
      const expected = expected_output.trim();

      results.push({
        input,
        expected_output: expected,
        actual_output: output,
        passed: output === expected,
        status: data.status.description
      });
    }

    const passedCount = results.filter(r => r.passed).length;
    const total = results.length;

    res.json({
      passed: passedCount,
      total,
      score: Math.round((passedCount / total) * 100),
      results,
    });

  } catch (err) {
    console.error('Error evaluating code:', err);
    res.status(500).json({ error: 'Evaluation failed', detail: err.message });
  }
});

export default router;


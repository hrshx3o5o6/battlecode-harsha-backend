// import express from 'express';
// import fetch from 'node-fetch';
// const router = express.Router();

// const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com'; // or http://localhost:3000 if self-hosted

// router.post('/', async (req, res) => {
//   const { source_code, language_id, function_name, test_cases } = req.body;

//   if (!source_code || !language_id || !function_name || !Array.isArray(test_cases)) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const results = [];

//   try {
//     for (const test of test_cases) {
//       const { input, expected_output } = test;

//       // Construct test runner code
//       const testRunner = `\nprint(Solution().${function_name}(${input}))`;

//       const fullCode = `${source_code}\n${testRunner}`;

//       const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
//           'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
//         },
//         body: JSON.stringify({
//           source_code: fullCode,
//           language_id,
//         }),
//       });

//       const data = await response.json();

//       const output = (data.stdout || '').trim();
//       const expected = expected_output.trim();

//       results.push({
//         input,
//         expected_output: expected,
//         actual_output: output,
//         passed: output === expected,
//         status: data.status.description
//       });
//     }

//     const passedCount = results.filter(r => r.passed).length;
//     const total = results.length;

//     res.json({
//       passed: passedCount,
//       total,
//       score: Math.round((passedCount / total) * 100),
//       results,
//     });

//   } catch (err) {
//     console.error('Error evaluating code:', err);
//     res.status(500).json({ error: 'Evaluation failed', detail: err.message });
//   }
// });

// export default router;


import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
};

// Build code with function calls like print(Solution().add(1, 2))
function buildPythonRunnerCode(source_code, function_name, test_cases) {
  let testRunner = '';
  for (const test of test_cases) {
    const args = test.input.trim(); // e.g., "1, 2"
    testRunner += `print(Solution().${function_name}(${args}))\n`;
  }
  const fullCode = `${source_code}\n\n${testRunner}`;
  console.log("🧠 [buildPythonRunnerCode] Full code being sent to Judge0:\n", fullCode);
  return fullCode;
}

router.post('/', async (req, res) => {
  const { source_code, language_id, function_name, test_cases } = req.body;

  console.log("📩 Incoming Request:");
  console.log("• function_name:", function_name);
  console.log("• language_id:", language_id);
  console.log("• test_cases:", test_cases);

  if (!source_code || !function_name || !Array.isArray(test_cases)) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const fullCode = buildPythonRunnerCode(source_code, function_name, test_cases);

    const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: JUDGE0_HEADERS,
      body: JSON.stringify({
        source_code: fullCode,
        language_id // e.g. 71 for Python 3
      })
    });

    const result = await response.json();

    console.log("📨 Judge0 Raw Response:");
    console.log(JSON.stringify(result, null, 2));

    const rawOutput = (result.stdout || '').trim();
    const actualOutputs = rawOutput.split('\n');
    console.log("🔍 Processed Outputs:");
    console.log(actualOutputs);

    const testResults = test_cases.map((test, idx) => {
      const actual = (actualOutputs[idx] || '').trim();
      const expected = String(test.expected_output).trim();
      const passed = actual === expected;

      console.log(`🧪 Test Case ${idx + 1}`);
      console.log("• Input:", test.input);
      console.log("• Expected:", expected);
      console.log("• Actual:", actual);
      console.log("• Passed:", passed);

      return {
        input: test.input,
        expected_output: expected,
        actual_output: actual,
        passed,
        status: result.status?.description || 'Unknown'
      };
    });

    const passedCount = testResults.filter(r => r.passed).length;
    const total = testResults.length;

    console.log(`✅ Final Score: ${passedCount}/${total}`);

    res.json({
      passed: passedCount,
      total,
      score: Math.round((passedCount / total) * 100),
      results: testResults
    });

  } catch (err) {
    console.error("🔥 Internal error:", err);
    res.status(500).json({ error: 'Code execution failed', details: err.message });
  }
});

export default router;
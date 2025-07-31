require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

/**
 * Parses the AI's response to extract multiple code files (HTML, CSS, JS).
 * @param {string} response The raw string response from the AI.
 * @returns {Array} An array of file objects.
 */
const parseResponse = (response) => {
  const fileMap = new Map();
  
  // This regex looks for filenames in markdown bold (e.g., **index.html**)
  // followed by a fenced code block.
  const pattern = /\*\*([a-zA-Z0-9_.-]+)\*\*\s*```(?:\w*\s*)?([\s\S]*?)```/g;

  let match;
  while ((match = pattern.exec(response)) !== null) {
    const fileName = match[1].trim();
    const code = match[2].trim();
    
    // Ensure we don't add empty files
    if (fileName && code) {
      fileMap.set(fileName, { 
        name: fileName, 
        content: code, 
        type: 'file' 
      });
    }
  }

  // If the primary pattern fails, return the raw response in a single HTML file for debugging.
  if (fileMap.size === 0) {
      return [{
        name: 'response.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Raw AI Response</title>
    <style> body { font-family: sans-serif; margin: 2rem; background: #f0f0f0; } pre { background: #fff; padding: 1.5rem; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word; } </style>
</head>
<body>
    <h1>Unable to Parse Response</h1>
    <p>The AI did not return the expected file structure. Displaying the raw response:</p>
    <pre>${response.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`,
        type: 'file'
      }];
  }

  return Array.from(fileMap.values());
};


app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // --- KEY CHANGE ---
    // The prompt now includes the required CDN links for React, ReactDOM, and Babel
    // directly in the index.html example. This ensures the generated code
    // is self-contained and runnable in the preview iframe.
    const enhancedPrompt = `
Generate a complete and modern-looking single-page React application based on the following prompt: "${prompt}"

Provide the full code organized into three separate files: **index.html**, **style.css**, and **script.js**.

- The **index.html** file must include a root div (e.g., <div id="root"></div>) and all necessary script tags for React, ReactDOM, and Babel to run.
- The **style.css** file should contain all the necessary styling for a clean, modern, and responsive user interface.
- The **script.js** file should contain the React component logic using JSX.

Format your response exactly as follows, with each file clearly marked:

**index.html**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
  <link rel="stylesheet" href="style.css">
  <!-- React Libraries -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <!-- Babel for JSX Transpilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <!-- Note the type="text/babel" for your script tag -->
  <script src="script.js" type="text/babel"></script>
</body>
</html>
\`\`\`

**style.css**
\`\`\`css
/* Your CSS styles here */
body {
  font-family: sans-serif;
  /* ... etc ... */
}
\`\`\`

**script.js**
\`\`\`javascript
const App = () => {
  return (
    <div>
      <h1>Hello, React!</h1>
      <p>This is a sample component.</p>
    </div>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
\`\`\`
`;

    const chatCompletion = await cerebras.chat.completions.create({
      messages: [{ role: 'user', content: enhancedPrompt }],
      model: 'qwen-3-32b', // Or your preferred model
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    
    console.log('=== RAW CEREBRAS RESPONSE ===\n', rawResponse, '\n=== END RAW RESPONSE ===');

    const files = parseResponse(rawResponse);
    
    console.log('=== PARSED FILES ===');
    files.forEach(file => console.log(`- Found: ${file.name} (${file.content.length} chars)`));
    console.log('=== END PARSED FILES ===');

    res.json(files);
  } catch (error) {
    console.error('Error calling Cerebras API:', error);
    res.status(500).json({ error: 'Failed to generate response from Cerebras API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

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
  
  // Multiple parsing strategies to handle different AI response formats
  const parseStrategies = [
    // Strategy 1: **filename** followed by code block
    /\*\*([a-zA-Z0-9_.-]+)\*\*\s*```(?:\w*\s*)?([\s\S]*?)```/g,
    
    // Strategy 2: ### filename or ## filename followed by code block
    /#{1,3}\s*([a-zA-Z0-9_.-]+)\s*```(?:\w*\s*)?([\s\S]*?)```/g,
    
    // Strategy 3: filename: followed by code block
    /([a-zA-Z0-9_.-]+):\s*```(?:\w*\s*)?([\s\S]*?)```/g,
    
    // Strategy 4: Just filename.extension followed by code block
    /([a-zA-Z0-9_.-]+\.(?:html|css|js))\s*```(?:\w*\s*)?([\s\S]*?)```/gi,
    
    // Strategy 5: Code blocks with language hints
    /```(html|css|javascript|js)\s*([\s\S]*?)```/gi
  ];

  // Try each parsing strategy
  for (let i = 0; i < parseStrategies.length; i++) {
    const pattern = parseStrategies[i];
    pattern.lastIndex = 0; // Reset regex
    
    let match;
    while ((match = pattern.exec(response)) !== null) {
      let fileName, code;
      
      if (i === 4) { // Language hint strategy
        const lang = match[1].toLowerCase();
        fileName = lang === 'html' ? 'index.html' : 
                  lang === 'css' ? 'style.css' : 
                  'script.js';
        code = match[2].trim();
      } else {
        fileName = match[1].trim();
        code = match[2].trim();
      }
      
      // Clean up filename
      if (!fileName.includes('.')) {
        if (fileName.toLowerCase().includes('html') || fileName.toLowerCase().includes('index')) {
          fileName = 'index.html';
        } else if (fileName.toLowerCase().includes('css') || fileName.toLowerCase().includes('style')) {
          fileName = 'style.css';
        } else if (fileName.toLowerCase().includes('js') || fileName.toLowerCase().includes('script')) {
          fileName = 'script.js';
        }
      }
      
      // Ensure we don't add empty files and have valid extensions
      if (fileName && code && (fileName.endsWith('.html') || fileName.endsWith('.css') || fileName.endsWith('.js'))) {
        fileMap.set(fileName, { 
          name: fileName, 
          content: code, 
          type: 'file' 
        });
      }
    }
    
    // If we found files with this strategy, break
    if (fileMap.size > 0) break;
  }

  // If no structured files found, try to extract any HTML, CSS, JS content
  if (fileMap.size === 0) {
    console.log('No structured files found, attempting content extraction...');
    
    // Look for HTML content
    const htmlMatch = response.match(/<!DOCTYPE html[\s\S]*?<\/html>/i);
    if (htmlMatch) {
      fileMap.set('index.html', {
        name: 'index.html',
        content: htmlMatch[0],
        type: 'file'
      });
    }
    
    // Look for CSS content (styles between style tags or standalone CSS)
    const cssMatches = response.match(/(?:<style>[\s\S]*?<\/style>|(?:^|\n)(?:body|\.[\w-]+|#[\w-]+)[\s\S]*?{[\s\S]*?})/gm);
    if (cssMatches) {
      let cssContent = cssMatches.join('\n\n').replace(/<\/?style>/g, '');
      if (cssContent.trim()) {
        fileMap.set('style.css', {
          name: 'style.css',
          content: cssContent,
          type: 'file'
        });
      }
    }
    
    // Look for JavaScript content
    const jsMatches = response.match(/(?:<script>[\s\S]*?<\/script>|(?:function|const|let|var|document\.addEventListener)[\s\S]*?(?=\n\n|\n(?:[A-Z]|$)|$))/gm);
    if (jsMatches) {
      let jsContent = jsMatches.join('\n\n').replace(/<\/?script>/g, '');
      if (jsContent.trim()) {
        fileMap.set('script.js', {
          name: 'script.js',
          content: jsContent,
          type: 'file'
        });
      }
    }
  }

  // Final fallback: create a comprehensive single-file solution
  if (fileMap.size === 0) {
    console.log('Creating fallback HTML file with embedded styles and scripts...');
    
    return [{
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 2rem;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .ai-response {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 1rem;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            background: #2d3748;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
        }
        .error-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-notice">
            <h3>⚠️ Parsing Issue Detected</h3>
            <p>The AI response couldn't be parsed into separate files. This might be because:</p>
            <ul>
                <li>The AI didn't use the expected file format markers</li>
                <li>The response was incomplete or malformed</li>
                <li>The content structure was different than expected</li>
            </ul>
            <p>Please try generating again or refine your prompt for better results.</p>
        </div>
        
        <h1>🤖 AI Response Preview</h1>
        <div class="ai-response">
            <h3>Raw AI Output:</h3>
            <pre>${response.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
        
        <script>
            console.log('Fallback HTML loaded - AI response parsing failed');
            
            // Add some interactivity to the fallback page
            document.addEventListener('DOMContentLoaded', function() {
                const container = document.querySelector('.container');
                
                // Add a retry button
                const retryButton = document.createElement('button');
                retryButton.textContent = '🔄 Try Again';
                retryButton.style.cssText = \`
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-top: 1rem;
                    transition: transform 0.2s;
                \`;
                
                retryButton.addEventListener('click', function() {
                    window.parent.location.reload();
                });
                
                retryButton.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                });
                
                retryButton.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
                
                container.appendChild(retryButton);
            });
        </script>
    </div>
</body>
</html>`,
      type: 'file'
    }];
  }

  // Ensure we have at least an HTML file
  if (!fileMap.has('index.html') && fileMap.size > 0) {
    const cssContent = fileMap.get('style.css')?.content || '';
    const jsContent = fileMap.get('script.js')?.content || '';
    
    fileMap.set('index.html', {
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <h1>Generated Application</h1>
        <p>Your generated content will appear here.</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      type: 'file'
    });
  }

  console.log(`Parsed ${fileMap.size} files:`, Array.from(fileMap.keys()));
  return Array.from(fileMap.values());
};

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Enhanced prompt for vanilla JavaScript applications with stricter formatting
    const enhancedPrompt = `
IMPORTANT: You must format your response EXACTLY as shown below. Use the exact file markers and code block format.

Generate a complete and modern-looking single-page web application using vanilla HTML, CSS, and JavaScript based on this request: "${prompt}"

Create a fully functional, interactive, and responsive web application that is modern, visually appealing, and includes proper interactivity.

CRITICAL FORMATTING REQUIREMENTS:
- You MUST use exactly this format: **filename** followed immediately by a code block
- Use EXACTLY these three filenames: **index.html**, **style.css**, **script.js**
- Each file must be in a separate code block with the appropriate language tag
- Do not deviate from this format or the parsing will fail

TECHNICAL REQUIREMENTS:
- Use ONLY vanilla HTML, CSS, and JavaScript (no frameworks or libraries)
- Make it fully responsive and mobile-friendly
- Include modern CSS features (flexbox/grid, animations, hover effects)
- Add interactive JavaScript functionality where relevant
- Use modern JavaScript (ES6+, async/await, proper event handling)
- Include error handling and console logging
- Ensure accessibility with semantic HTML and ARIA attributes
- Make it visually appealing with modern design principles

EXACT FORMAT TO FOLLOW:

**index.html**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your App Title</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <nav>
      <!-- Navigation content -->
    </nav>
  </header>
  
  <main>
    <!-- Main application content with proper semantic structure -->
  </main>
  
  <footer>
    <!-- Footer content -->
  </footer>
  
  <script src="script.js"></script>
</body>
</html>
\`\`\`

**style.css**
\`\`\`css
/* Modern CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

/* Your complete styles here - make it modern and responsive */
/* Include: containers, buttons, cards, animations, hover effects */
/* Add responsive breakpoints with @media queries */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  /* Mobile responsive styles */
}
\`\`\`

**script.js**
\`\`\`javascript
// Modern vanilla JavaScript application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application starting...');
    init();
});

function init() {
    console.log('Initializing application');
    setupEventListeners();
    loadInitialData();
}

function setupEventListeners() {
    // Add all your event listeners here
    console.log('Setting up event listeners');
}

async function loadInitialData() {
    try {
        console.log('Loading initial data');
        // Your initialization code here
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Add your complete application logic here
// Use modern JavaScript features and best practices

// Utility functions
const utils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
\`\`\`

REMEMBER: 
- Use EXACTLY the format shown above
- Each file must start with **filename** (two asterisks on each side)
- Follow immediately with a code block using the correct language tag
- Generate complete, functional code for all three files
- Make it production-ready and fully interactive
`;

    const chatCompletion = await cerebras.chat.completions.create({
      messages: [{ role: 'user', content: enhancedPrompt }],
      model: 'qwen-3-coder-480b', // Or your preferred model
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
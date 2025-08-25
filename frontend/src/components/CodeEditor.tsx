'use client'

import { useState, useMemo } from 'react';
import { Copy, Download, Eye, Code2, ExternalLink } from 'lucide-react';
import { FileNode } from '@/types';
import JSZip from 'jszip';

interface CodeEditorProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
  code: string;       // This is the active file content
  files: FileNode[];  // All generated files from your backend
  activeFile?: FileNode | null; // The currently selected file
}

export default function CodeEditor({
  onMenuClick,
  showMenuButton = false,
  className = '',
  code,
  files = [],
  activeFile = null
}: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState('preview');

  // Enhanced HTML combination that handles your backend's file structure
  const combinedHtml = useMemo(() => {
    if (!files || files.length === 0) {
      return `<div style="font-family: sans-serif; padding: 2rem; color: #9ca3af;">
                <h2 style="color: #22d3ee;">Preview Area</h2><p>Generate code to see a preview.</p>
              </div>`;
    }

    // Find the main HTML file (could be index.html or any .html file)
    const htmlFile = files.find((f: FileNode) => f.name.endsWith('.html'));
    if (!htmlFile) {
      return `<div style="font-family: sans-serif; padding: 2rem; color: #f87171;">
                <h2>Error</h2><p>No HTML file found in the generated code.</p>
              </div>`;
    }

    let htmlContent = htmlFile.content;

    // Collect all CSS and JS content
    const allCss = files.filter((f: FileNode) => f.name.endsWith('.css')).map((f: FileNode) => f.content).join('\n\n/* --- */\n\n');
    const allJs = files.filter((f: FileNode) => f.name.endsWith('.js')).map((f: FileNode) => f.content).join('\n\n// --- \n\n');

    // Enhanced head injection with better error handling
    const headInjection = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta charset="UTF-8">
      <style>
        /* CSS Reset and Base Styles */
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #111827;
          color: #d1d5db;
          overflow-x: hidden;
        }
        img, video, iframe { max-width: 100%; height: auto; }
       
        /* Error Overlay Styles */
        .preview-error-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
          color: white;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          z-index: 999999;
          border-bottom: 3px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          animation: slideDown 0.3s ease-out;
        }
       
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
       
        .preview-error-overlay h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
       
        .preview-error-overlay pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.75rem;
          border-radius: 6px;
          margin: 0.5rem 0;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }
       
        .preview-error-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.2s;
        }
       
        .preview-error-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
      <style>${allCss}</style>
    `;

    // FIXED: Enhanced JavaScript injection with navigation prevention
    const bodyInjection = `
      <script>
        // Prevent navigation that causes the nested preview issue
        (function preventNavigation() {
          // Override default link behavior to prevent navigation
          function preventLinkNavigation(e) {
            const target = e.target;
            if (target.tagName === 'A' && target.href) {
              e.preventDefault();
              e.stopPropagation();
              
              // Handle different types of navigation
              const href = target.getAttribute('href');
              
              if (href === '#' || href.startsWith('#')) {
                // Handle anchor links - scroll to element if it exists
                if (href !== '#') {
                  const targetElement = document.querySelector(href);
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              } else if (href.startsWith('http')) {
                // Handle external links - open in new tab
                window.open(href, '_blank', 'noopener,noreferrer');
              } else {
                // Handle other navigation - prevent it and show message
                console.log('Navigation prevented:', href);
                
                // Optional: Show a subtle message to user
                const message = document.createElement('div');
                message.style.cssText = \`
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: rgba(34, 197, 94, 0.9);
                  color: white;
                  padding: 12px 16px;
                  border-radius: 6px;
                  font-size: 14px;
                  z-index: 999999;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                  animation: slideInRight 0.3s ease-out;
                \`;
                message.textContent = \`Navigation to "\${href}" prevented in preview\`;
                
                document.body.appendChild(message);
                
                setTimeout(() => {
                  if (message.parentNode) {
                    message.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => message.remove(), 300);
                  }
                }, 2000);
              }
              
              return false;
            }
          }
          
          // Apply click prevention to all current and future links
          document.addEventListener('click', preventLinkNavigation, true);
          
          // Also prevent form submissions that might cause navigation
          document.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submission prevented in preview');
            
            // Show message
            const message = document.createElement('div');
            message.style.cssText = \`
              position: fixed;
              top: 20px;
              right: 20px;
              background: rgba(251, 146, 60, 0.9);
              color: white;
              padding: 12px 16px;
              border-radius: 6px;
              font-size: 14px;
              z-index: 999999;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            \`;
            message.textContent = 'Form submission prevented in preview';
            
            document.body.appendChild(message);
            
            setTimeout(() => message.remove(), 2000);
          }, true);
          
          // Add required CSS animations
          const style = document.createElement('style');
          style.textContent = \`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(100%); opacity: 0; }
            }
          \`;
          document.head.appendChild(style);
        })();

        // Enhanced console forwarding
        (function() {
          const originalConsoleLog = console.log;
          const originalConsoleError = console.error;
          const originalConsoleWarn = console.warn;
         
          console.log = function(...args) {
            originalConsoleLog.apply(console, args);
            try {
              window.parent?.console?.log?.('Preview:', ...args);
            } catch(e) { /* Ignore cross-origin errors */ }
          };
         
          console.error = function(...args) {
            originalConsoleError.apply(console, args);
            try {
              window.parent?.console?.error?.('Preview Error:', ...args);
            } catch(e) { /* Ignore cross-origin errors */ }
          };
         
          console.warn = function(...args) {
            originalConsoleWarn.apply(console, args);
            try {
              window.parent?.console?.warn?.('Preview Warning:', ...args);
            } catch(e) { /* Ignore cross-origin errors */ }
          };
        })();

        // Enhanced error handling
        function showPreviewError(title, message, details) {
          // Remove existing error overlays
          const existingErrors = document.querySelectorAll('.preview-error-overlay');
          existingErrors.forEach(el => el.remove());
         
          const errorContainer = document.createElement('div');
          errorContainer.className = 'preview-error-overlay';
          errorContainer.innerHTML = \`
            <button class="preview-error-close" onclick="this.parentElement.remove()">×</button>
            <h3>⚠️ \${title}</h3>
            <p>\${message}</p>
            \${details ? \`<pre>\${details}</pre>\` : ''}
            <small style="opacity: 0.8; margin-top: 0.5rem; display: block;">
              Click × to dismiss this error. Check the browser console for more details.
            </small>
          \`;
         
          document.body.appendChild(errorContainer);
         
          // Auto-dismiss after 10 seconds
          setTimeout(() => {
            if (errorContainer.parentElement) {
              errorContainer.style.animation = 'slideDown 0.3s ease-in reverse';
              setTimeout(() => errorContainer.remove(), 300);
            }
          }, 10000);
        }

        // Global error handler
        window.addEventListener('error', function(event) {
          const errorMsg = event.message || 'Unknown error occurred';
          const fileName = event.filename ? event.filename.replace('about:srcdoc', 'generated code') : 'unknown file';
          const lineInfo = event.lineno ? \` (line \${event.lineno}\${event.colno ? \`, col \${event.colno}\` : ''})\` : '';
         
          showPreviewError(
            'JavaScript Error',
            \`\${errorMsg}\`,
            \`File: \${fileName}\${lineInfo}\${event.error?.stack ? \`\\n\\nStack trace:\\n\${event.error.stack}\` : ''}\`
          );
         
          try {
            window.parent?.console?.error?.('Preview Unhandled Error:', errorMsg, fileName, event.lineno, event.colno, event.error);
          } catch(e) { /* Ignore cross-origin errors */ }
         
          return true; // Prevent default browser error handling
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(event) {
          const reason = event.reason || 'Unknown promise rejection';
          showPreviewError(
            'Promise Rejection',
            'An unhandled promise rejection occurred',
            \`Reason: \${reason}\${reason?.stack ? \`\\n\\nStack trace:\\n\${reason.stack}\` : ''}\`
          );
         
          try {
            window.parent?.console?.error?.('Preview Unhandled Promise Rejection:', reason);
          } catch(e) { /* Ignore cross-origin errors */ }
        });

        // Direct execution approach that bypasses DOMContentLoaded timing issues
        function executeGeneratedCode() {
          console.log('Preview: Executing generated JavaScript...');
         
          try {
            // Create the JavaScript code as a string literal, properly escaped
            const jsCode = ${JSON.stringify(allJs)};
            
            if (jsCode && jsCode.trim()) {
              console.log('Preview: Running JavaScript code...');
              
              // Execute the JavaScript code first
              const executeJs = new Function(jsCode);
              executeJs();
              
              console.log('Preview: JavaScript loaded, now forcing initialization...');
              
              // Force immediate initialization after a very short delay
              setTimeout(() => {
                console.log('Preview: Force-initializing interactive elements...');
                
                // Try multiple initialization approaches
                try {
                  // Method 1: Call common init functions if they exist
                  if (typeof window.init === 'function') {
                    console.log('Preview: Calling init()...');
                    window.init();
                  }
                  
                  if (typeof window.setupEventListeners === 'function') {
                    console.log('Preview: Calling setupEventListeners()...');
                    window.setupEventListeners();
                  }
                  
                  if (typeof window.resetCalculator === 'function') {
                    console.log('Preview: Calling resetCalculator()...');
                    window.resetCalculator();
                  }
                  
                  // Method 2: Manually trigger DOMContentLoaded-style initialization
                  console.log('Preview: Manually triggering initialization...');
                  
                  // Look for calculator-specific elements and manually set up events
                  const keypad = document.querySelector('.keypad');
                  if (keypad && typeof window.handleKeyPress === 'function') {
                    console.log('Preview: Setting up keypad click handler...');
                    keypad.removeEventListener('click', window.handleKeyPress); // Remove if exists
                    keypad.addEventListener('click', window.handleKeyPress);
                  }
                  
                  // Set up keyboard handler if it exists
                  if (typeof window.handleKeyDown === 'function') {
                    console.log('Preview: Setting up keyboard handler...');
                    document.removeEventListener('keydown', window.handleKeyDown); // Remove if exists
                    document.addEventListener('keydown', window.handleKeyDown);
                  }
                  
                  // Method 3: Try to find and click-enable all buttons manually
                  const buttons = document.querySelectorAll('button');
                  console.log(\`Preview: Found \${buttons.length} buttons to check...\`);
                  
                  buttons.forEach((button, index) => {
                    if (!button.onclick && keypad && typeof window.handleKeyPress === 'function') {
                      console.log(\`Preview: Setting up click handler for button \${index}\`);
                      button.addEventListener('click', (e) => window.handleKeyPress(e));
                    }
                  });
                  
                  // Method 4: Force update display if function exists
                  if (typeof window.updateDisplay === 'function') {
                    console.log('Preview: Updating display...');
                    window.updateDisplay();
                  }
                  
                  console.log('Preview: Initialization complete! App should now be interactive.');
                  
                } catch (initError) {
                  console.error('Preview: Error during forced initialization:', initError);
                }
              }, 10);
              
            } else {
              console.log('Preview: No JavaScript code to execute');
            }
           
          } catch (error) {
            console.error('Preview: Error during script execution:', error);
            showPreviewError(
              'Script Execution Error',
              'An error occurred while executing the generated JavaScript code',
              \`Error: \${error.message}\${error.stack ? \`\\n\\nStack trace:\\n\${error.stack}\` : ''}\`
            );
          }
        }
        
        // Execute immediately since DOM is ready
        executeGeneratedCode();

        // Helper function to safely call functions that might not exist
        window.safeCall = function(functionName, ...args) {
          try {
            if (typeof window[functionName] === 'function') {
              return window[functionName](...args);
            } else {
              console.warn(\`Function '\${functionName}' is not defined\`);
              showPreviewError(
                'Function Not Found',
                \`The function '\${functionName}' was called but is not defined\`,
                'This usually happens when there are issues with the generated JavaScript code.'
              );
              return null;
            }
          } catch (error) {
            console.error(\`Error calling function '\${functionName}':\`, error);
            showPreviewError(
              'Function Call Error',
              \`Error calling function '\${functionName}'\`,
              \`Error: \${error.message}\${error.stack ? \`\\n\\nStack trace:\\n\${error.stack}\` : ''}\`
            );
            return null;
          }
        };
       
        console.log('Preview: Enhanced error handling and navigation prevention initialized');
      <\/script>
    `;

    // Clean the HTML content and inject our enhancements
    htmlContent = htmlContent
      // Remove external CSS/JS links that might conflict
      .replace(/<link[^>]*(?:href=["'][^"']*\.css["']|rel=["']stylesheet["'])[^>]*>/gi, '')
      .replace(/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/gi, '')
      .replace(/<script[^>]*src=["']https?:\/\/[^"']*["'][^>]*><\/script>/gi, '');

    // Inject our enhanced head content
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', headInjection + '</head>');
    } else if (htmlContent.includes('<head>')) {
      htmlContent = htmlContent.replace('<head>', '<head>' + headInjection);
    } else {
      htmlContent = `<!DOCTYPE html><html><head>${headInjection}</head><body>${htmlContent}`;
    }

    // Inject our enhanced body content
    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', bodyInjection + '</body>');
    } else {
      htmlContent += bodyInjection + '</body></html>';
    }

    return htmlContent;
  }, [files]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      console.log('Code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  };

  const handleDownload = () => {
    if (files.length === 0) return;

    const zip = new JSZip();
   
    // Add all generated files to the zip
    files.forEach((file: FileNode) => {
      zip.file(file.name, file.content);
    });
   
    // Add a README file with instructions
    zip.file('README.md', `# Generated Project

This project was generated using your CodeEditor tool.

## Files included:
${files.map((file: FileNode) => `- ${file.name}`).join('\n')}

## How to run:
1. Extract all files to a directory
2. Open index.html in a web browser
3. Or serve the directory using a local web server

## Note:
If you encounter any issues, make sure all files are in the same directory and that your browser supports modern JavaScript features.
`);

    zip.generateAsync({ type: 'blob' }).then(blob => {
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = 'generated-project.zip';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    }).catch(err => {
      console.error('Failed to generate zip file:', err);
    });
  };

  const handleOpenInNewWindow = () => {
    if (!files || files.length === 0) return;
   
    const htmlFile = files.find((f: FileNode) => f.name.endsWith('.html'));
    if (!htmlFile) return;
   
    let htmlContent = htmlFile.content;
    const allCss = files.filter((f: FileNode) => f.name.endsWith('.css')).map((f: FileNode) => f.content).join('\n\n/* --- */\n\n');
    const allJs = files.filter((f: FileNode) => f.name.endsWith('.js')).map((f: FileNode) => f.content).join('\n\n// --- \n\n');
   
    // Simpler head injection for new window (without the preview-specific error handling)
    const headInjection = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        img, video, iframe { max-width: 100%; height: auto; }
      </style>
      <style>${allCss}</style>
    `;
   
    // Simpler body injection for new window (normal navigation behavior)
// CORRECTED: Direct script execution for the new window
const bodyInjection = `
  <script>
    try {
      console.log('Standalone version loading...');
      const jsCode = ${JSON.stringify(allJs)};
      if (jsCode && jsCode.trim()) {
        const executeJs = new Function(jsCode);
        executeJs();
        console.log('Standalone JavaScript executed.');
      }
    } catch (e) {
      console.error('Error executing JavaScript in new window:', e);
      // Optional: Add a visual error message in the new window itself
      document.body.innerHTML = '<div style="padding: 2em; color: red; font-family: sans-serif;">' +
        '<h2>JavaScript Error</h2><p>' + e.message + '</p><pre>' + e.stack + '</pre></div>' + 
        document.body.innerHTML;
    }
    <\/script>
  `;
   
    // Clean and inject for new window
    htmlContent = htmlContent
      .replace(/<link[^>]*(?:href=["'][^"']*\.css["']|rel=["']stylesheet["'])[^>]*>/gi, '')
      .replace(/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/gi, '')
      .replace(/<script[^>]*src=["']https?:\/\/[^"']*["'][^>]*><\/script>/gi, '');
   
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', headInjection + '</head>');
    } else if (htmlContent.includes('<head>')) {
      htmlContent = htmlContent.replace('<head>', '<head>' + headInjection);
    } else {
      htmlContent = `<!DOCTYPE html><html><head>${headInjection}</head><body>${htmlContent}`;
    }
   
    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', bodyInjection + '</body>');
    } else {
      htmlContent += bodyInjection + '</body></html>';
    }
   
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();
    } else {
      alert('Popup blocked. Please allow popups for this site to open in a new window.');
    }
  };

  return (
    <div className={`flex-1 flex flex-col bg-gray-950/50 animate-fade-in ${className}`}>
      {/* Header/Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b border-cyan-400/30">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1 flex-1 sm:flex-none bg-black/20 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm ${ activeTab === 'preview'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-700 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
              }`}
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm ${ activeTab === 'code'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-700 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
              }`}
            >
              <Code2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Code</span>
            </button>
          </div>
        </div>
       
        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
          <button
            onClick={handleOpenInNewWindow}
            className="flex text-cyan-400/70 hover:text-cyan-400 transition-all duration-300 p-2 rounded-lg hover:bg-cyan-400/10 transform hover:scale-110 items-center justify-center"
            title="Open preview in new window"
            disabled={files.length === 0}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="flex text-cyan-400/70 hover:text-cyan-400 transition-all duration-300 p-2 rounded-lg hover:bg-cyan-400/10 transform hover:scale-110 items-center justify-center"
            title="Copy active file's code"
            disabled={!code}
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="flex text-cyan-400/70 hover:text-cyan-400 transition-all duration-300 p-2 rounded-lg hover:bg-cyan-400/10 transform hover:scale-110 items-center justify-center"
            title="Download project as .zip"
            disabled={files.length === 0}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
     
      {/* Status Bar */}
      {files.length > 0 && (
        <div className="px-3 sm:px-4 py-2 bg-black/20 text-xs text-gray-400 border-b border-gray-800/50">
          Generated {files.length} file{files.length !== 1 ? 's' : ''}: {files.map(f => f.name).join(', ')}
        </div>
      )}
     
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Preview Tab */}
        <div className={`absolute inset-0 transition-all duration-500 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {activeTab === 'preview' && (
            <div className="h-full bg-gray-900 animate-fade-in">
              <iframe
                srcDoc={combinedHtml}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
              />
            </div>
          )}
        </div>
       
        {/* Code Tab */}
        <div className={`absolute inset-0 transition-all duration-500 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {activeTab === 'code' && (
            <div className="h-full overflow-auto animate-fade-in bg-gray-950">
              {files.length > 0 && code ? (
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700/50">
                      <h3 className="text-cyan-400 font-semibold text-sm sm:text-base">
                        {activeFile?.name || 'Selected File'}
                      </h3>
                      <span className="text-gray-500 text-xs">{code.length} characters</span>
                    </div>
                    <pre className="text-gray-300 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre-wrap break-words bg-black/30 p-4 rounded-lg overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No code generated yet</p>
                    <p className="text-sm mt-2 opacity-75">Generate some code to view it here</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
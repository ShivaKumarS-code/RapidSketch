'use client'

import { useState, useMemo } from 'react';
import { Copy, Download, Eye, Code2 } from 'lucide-react';
import { FileNode } from '@/types';
import JSZip from 'jszip';

interface CodeEditorProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
  code: string;      // This is the active file content
  files: FileNode[]; // All generated files
}

export default function CodeEditor({
  onMenuClick,
  showMenuButton = false,
  className = '',
  code,
  files = []
}: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState('preview');

  // Combine all files into a single, runnable HTML document for the preview iframe.
  const combinedHtml = useMemo(() => {
    if (!files || files.length === 0) {
      return `<div style="font-family: sans-serif; padding: 2rem; color: #9ca3af;">
                <h2 style="color: #22d3ee;">Preview Area</h2><p>Generate code to see a preview.</p>
              </div>`;
    }

    const htmlFile = files.find(f => f.name.endsWith('.html'));
    if (!htmlFile) {
      return `<div style="font-family: sans-serif; padding: 2rem; color: #f87171;">
                <h2>Error</h2><p>No HTML file found in the generated code.</p>
              </div>`;
    }

    let htmlContent = htmlFile.content;

    const allCss = files.filter(f => f.name.endsWith('.css')).map(f => f.content).join('\n\n/* --- */\n\n');
    const allJs = files.filter(f => f.name.endsWith('.js')).map(f => f.content).join('\n\n// --- \n\n');

    // ✅ Responsive head injection (from first file)
    const headInjection = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; }
        body { margin:0; padding:0; font-family: system-ui, sans-serif; background-color: #111827; color: #d1d5db; }
        img, video, iframe { max-width:100%; height:auto; }
      </style>
      <!-- Injected Styles -->
      <style>${allCss}</style>
      <!-- React + Babel for JSX support -->
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    `;

    const bodyInjection = `
      <!-- Injected Application Logic -->
      <script type="text/babel">
        // Forward logs to the parent window's console
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          originalConsoleLog(...args);
          window.parent.console.log('iFrame:', ...args);
        };
        const originalConsoleError = console.error;
        console.error = (...args) => {
          originalConsoleError(...args);
          window.parent.console.error('iFrame Error:', ...args);
        };

        // Global error handler
        window.onerror = function(message, source, lineno, colno, error) {
          const errorContainer = document.createElement('div');
          errorContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;padding:1rem;background-color:rgba(255,0,0,0.8);color:white;font-family:sans-serif;z-index:9999;';
          errorContainer.innerHTML = '<h3>Preview Error</h3><p>' + message + '</p>';
          document.body.prepend(errorContainer);
          window.parent.console.error('iFrame Unhandled Error:', message, source, lineno, colno, error);
          return true; // Prevents the default browser error handling
        };

        try {
          ${allJs}
        } catch (e) {
          const errorContainer = document.createElement('div');
          errorContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;padding:1rem;background-color:rgba(255,0,0,0.8);color:white;font-family:sans-serif;z-index:9999;';
          errorContainer.innerHTML = '<h3>JavaScript Execution Error</h3><pre>' + e.message + '</pre><p>Check the browser console for more details.</p>';
          document.body.prepend(errorContainer);
          console.error(e);
        }
      <\/script>
    `;

    // Clean out AI-added external links
    htmlContent = htmlContent
      .replace(/<link[^>]*\.css[^>]*>/g, '')
      .replace(/<script[^>]*\.js[^>]*><\/script>/g, '')
      .replace(/<script[^>]*src=\"https?:\/\/unpkg\.com[^\"]*\"[^>]*><\/script>/g, '');

    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', headInjection + '</head>');
    } else {
      htmlContent = `<!DOCTYPE html><html><head>${headInjection}</head><body>${htmlContent}`;
    }

    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', bodyInjection + '</body>');
    } else {
      htmlContent += bodyInjection + '</body></html>';
    }

    return htmlContent;
  }, [files]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(err => console.error('Failed to copy code:', err));
  };

  const handleDownload = () => {
    if (files.length === 0) return;

    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.name, file.content);
    });

    zip.generateAsync({ type: 'blob' }).then(blob => {
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = 'RapidSketch-project.zip';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
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
        
        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end">
          <button 
            onClick={handleCopy}
            className="flex text-cyan-400/70 hover:text-cyan-400 transition-all duration-300 p-2 rounded-lg hover:bg-cyan-400/10 transform hover:scale-110 items-center justify-center"
            title="Copy active file's code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDownload}
            className="flex text-cyan-400/70 hover:text-cyan-400 transition-all duration-300 p-2 rounded-lg hover:bg-cyan-400/10 transform hover:scale-110 items-center justify-center"
            title="Download project as .zip"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
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
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              />
            </div>
          )}
        </div>
        
        {/* Code Tab */}
        <div className={`absolute inset-0 transition-all duration-500 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {activeTab === 'code' && (
            <div className="h-full overflow-auto animate-fade-in bg-gray-950">
              <pre className="p-3 sm:p-4 lg:p-6 text-gray-300 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
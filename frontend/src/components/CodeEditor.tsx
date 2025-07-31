'use client'

import { useState, useMemo } from 'react';
import { Copy, Download, Eye, Code2 } from 'lucide-react';
import { FileNode } from '@/types';

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
    // If no files are generated yet, show a placeholder.
    if (!files || files.length === 0) {
      return `<div style="font-family: sans-serif; padding: 2rem; color: white;"><h2>Preview Area</h2><p>Generate code to see a preview.</p></div>`;
    }

    // Find the primary HTML file. If none exists, show an error.
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    if (!htmlFile) {
      return `<div style="font-family: sans-serif; padding: 2rem;"><h2>Error</h2><p>No HTML file was found in the generated code.</p></div>`;
    }

    let htmlContent = htmlFile.content;

    // 1. Gather all CSS content from .css files into a single string.
    const allCss = files
      .filter(f => f.name.endsWith('.css'))
      .map(f => f.content)
      .join('\n\n/* --- */\n\n');

    // 2. Gather all JavaScript content from .js files.
    const allJs = files
      .filter(f => f.name.endsWith('.js'))
      .map(f => f.content)
      .join('\n\n// --- \n\n');

    // 3. Prepare the code blocks to be injected into the HTML.
    const headInjection = `
      <!-- Injected Styles -->
      <style>
        ${allCss}
      </style>
      <!-- Injected Libraries for React & Babel -->
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    `;

    const bodyInjection = `
      <!-- Injected Application Logic -->
      <script type="text/babel">
        try {
          ${allJs}
        } catch (e) {
          document.body.innerHTML = '<div style="color: red; font-family: sans-serif; padding: 2rem;"><h2>JavaScript Error</h2><pre>' + e.message + '</pre></div>';
          console.error(e);
        }
      <\/script>
    `;

    // 4. Clean the original HTML of any external file links the AI might have added.
    htmlContent = htmlContent.replace(/<link[^>]*href="[^"]*\.css"[^>]*>/g, '');
    htmlContent = htmlContent.replace(/<script[^>]*src="[^"]*\.js"[^>]*><\/script>/g, '');
    // Also remove any CDN links the AI might have added, to prevent duplication.
    htmlContent = htmlContent.replace(/<script[^>]*src="httpss?:\/\/unpkg\.com[^"]*"[^>]*><\/script>/g, '');

    // 5. Perform the injections into the head and body.
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', `${headInjection}</head>`);
    } else {
      htmlContent = headInjection + htmlContent;
    }

    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', `${bodyInjection}</body>`);
    } else {
      htmlContent = htmlContent + bodyInjection;
    }
    
    console.log('Final HTML for preview:', htmlContent);
    return htmlContent;

  }, [files]); // The dependency array now correctly only relies on the `files` array.

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(err => console.error('Failed to copy code:', err));
  };

  const handleDownload = () => {
    // This logic can be improved to download a zip of all files.
    // For now, it downloads the combined HTML for the preview.
    const element = document.createElement('a');
    const file = new Blob([combinedHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'index.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`flex-1 flex flex-col bg-black animate-fade-in ${className}`}>
      {/* Header/Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b border-white/20 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1 flex-1 sm:flex-none">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm ${
                activeTab === 'preview' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm ${
                activeTab === 'code' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
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
            className="hidden sm:flex text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110 items-center justify-center"
            title="Copy active file's code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDownload}
            className="hidden sm:flex text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110 items-center justify-center"
            title="Download preview as HTML"
          >
            <Download className="w-4 h-4" />
          </button>
          <button className="bg-white text-black px-3 sm:px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg hover:shadow-white/20 text-xs sm:text-sm">
            Deploy
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Preview Tab */}
        <div className={`absolute inset-0 transition-all duration-500 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {activeTab === 'preview' && (
            <div className="h-full bg-[#0d1117] animate-fade-in">
              <iframe
                srcDoc={combinedHtml}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}
        </div>
        
        {/* Code Tab */}
        <div className={`absolute inset-0 transition-all duration-500 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {activeTab === 'code' && (
            <div className="h-full overflow-auto animate-fade-in bg-[#0d1117]">
              <pre className="p-3 sm:p-4 lg:p-6 text-white/90 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

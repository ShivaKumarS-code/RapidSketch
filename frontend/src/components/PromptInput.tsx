'use client'

import { useState } from 'react';
import { Send, Sparkles, Image, Code } from 'lucide-react';

import { FileNode } from '@/types';

interface PromptInputProps {
  onCodeUpdate: (files: FileNode[]) => void;
}

export default function PromptInput({ onCodeUpdate }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [framework, setFramework] = useState('React');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setIsGenerating(true);
      try {
        const response = await fetch('https://rapidsketch.onrender.com/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: `${prompt} using ${framework}` }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const files = await response.json();
        console.log('Received files:', files); // Debug log
        
        // Make sure we're passing an array of files
        if (Array.isArray(files) && files.length > 0) {
          onCodeUpdate(files);
        } else {
          console.error('No files received or invalid format');
          // Fallback: create a simple HTML file if no files returned
          const fallbackFile: FileNode = {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Content</title>
</head>
<body>
    <h1>Generated content will appear here</h1>
    <p>Prompt: ${prompt}</p>
</body>
</html>`,
            type: 'file'
          };
          onCodeUpdate([fallbackFile]);
        }
      } catch (error) {
        console.error('Error generating code:', error);
        // Show error to user
        alert('Failed to generate code. Please check your backend server.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="bg-black/80 backdrop-blur-sm border-t border-cyan-400/30 p-3 sm:p-4 lg:p-6 animate-fade-in shadow-lg shadow-cyan-500/10">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className={`relative bg-gray-950 border rounded-xl overflow-hidden transition-all duration-500 transform ${ isFocused ? 'border-cyan-400 shadow-2xl shadow-cyan-500/20 scale-[1.02]' : 'border-cyan-400/30'}`}>
          <div className="flex items-center px-3 sm:px-4 py-2 sm:py-3 border-b border-cyan-400/30">
            <Sparkles className="w-4 h-4 text-cyan-400 mr-2 animate-pulse" />
            <span className="text-cyan-400/80 text-xs sm:text-sm">Describe your UI</span>
          </div>
          
          <div className="flex items-start p-3 sm:p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Create a modern landing page with a hero section, navigation bar, and call-to-action buttons..."
              className="flex-1 bg-transparent text-gray-300 placeholder-gray-500 resize-none border-none outline-none min-h-[60px] sm:min-h-[80px] max-h-[150px] sm:max-h-[200px] transition-all duration-300 text-sm sm:text-base"
              rows={2}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 py-3 bg-gray-950/50 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <span className="text-gray-500 text-sm">
                {prompt.length}/2000
              </span>
            </div>
            
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="bg-gradient-to-r from-cyan-400 to-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:from-cyan-500 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 w-full sm:w-auto justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Generating...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="text-sm sm:text-base">Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

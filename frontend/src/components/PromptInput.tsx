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
        const response = await fetch('http://localhost:3001/api/generate', {
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
    <div className="bg-black border-t border-white/20 p-3 sm:p-4 lg:p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className={`relative bg-black border rounded-xl overflow-hidden transition-all duration-500 transform ${
          isFocused ? 'border-white/30 shadow-xl shadow-white/5 scale-[1.02]' : 'border-white/20'
        }`}>
          <div className="flex items-center px-3 sm:px-4 py-2 sm:py-3 border-b border-white/20">
            <Sparkles className="w-4 h-4 text-white/60 mr-2 animate-pulse" />
            <span className="text-white/60 text-xs sm:text-sm">Describe your UI or upload an image reference</span>
          </div>
          
          <div className="flex items-start p-3 sm:p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Create a modern landing page with a hero section, navigation bar, and call-to-action buttons..."
              className="flex-1 bg-transparent text-white placeholder-white/40 resize-none border-none outline-none min-h-[60px] sm:min-h-[80px] max-h-[150px] sm:max-h-[200px] transition-all duration-300 text-sm sm:text-base"
              rows={2}
            />
            
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
              <button
                type="button"
                className="text-white/50 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/5 transform hover:scale-110"
                title="Add image reference"
              >
                <Image className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                className="text-white/50 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/5 transform hover:scale-110"
                title="Code snippet"
              >
                <Code className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 py-3 bg-black/50 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <span className="text-white/50 text-sm">
                {prompt.length}/2000
              </span>
            </div>
            
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="bg-white text-black px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg hover:shadow-white/20 w-full sm:w-auto justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
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
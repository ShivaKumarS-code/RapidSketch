'use client'

import { useState, useRef } from 'react';
import { Send, Square, Wand2 } from 'lucide-react';
import { FileNode } from '@/types';

interface PromptInputProps {
  onCodeUpdate: (files: FileNode[]) => void;
  currentFiles?: FileNode[];
  onMenuClick?: () => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function getSessionId() {
  if (typeof window === 'undefined') return 'default';
  const key = 'rs_session';
  let id = sessionStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); }
  return id;
}

export default function PromptInput({ onCodeUpdate, currentFiles = [] }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const isRefine = currentFiles.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setStatus('Connecting...');
    abortRef.current = new AbortController();
    const endpoint = isRefine ? '/api/refine' : '/api/generate';
    const body = isRefine
      ? { instruction: prompt, files: currentFiles, session_id: getSessionId() }
      : { prompt, session_id: getSessionId() };
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      setStatus('Generating...');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.type === 'files') { onCodeUpdate(ev.files); setPrompt(''); setStatus('Done'); }
            else if (ev.type === 'error') throw new Error(ev.message);
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setStatus('Error — check backend'); console.error(err);
      }
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <div className="shrink-0 border-t border-[#1e1e1e] bg-[#0c0c0c] px-4 py-3">
      <form onSubmit={handleSubmit}>
        <div className="flex items-end gap-3 bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 focus-within:border-[#3a3a3a] transition-colors">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs text-gray-600">{isRefine ? 'Refine' : 'Generate'}</span>
              {isRefine && (
                <span className="text-xs bg-[#1e1e1e] text-gray-500 px-2 py-0.5 rounded-full border border-[#2a2a2a]">refine mode</span>
              )}
              {status && <span className="text-xs text-gray-600 ml-auto animate-pulse">{status}</span>}
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e); }}
              placeholder={isRefine ? 'Make it darker, add a login form...' : 'Describe the UI you want to build...'}
              rows={2}
              className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-700 resize-none outline-none leading-relaxed"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 pb-0.5">
            <span className="text-xs text-gray-700 hidden sm:block">{prompt.length}/2000</span>
            {isGenerating ? (
              <button type="button" onClick={() => { abortRef.current?.abort(); setIsGenerating(false); }}
                className="flex items-center gap-1.5 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-400 text-xs px-3 py-2 rounded-lg border border-[#2a2a2a] transition-colors">
                <Square className="w-3.5 h-3.5" /> Stop
              </button>
            ) : (
              <button type="submit" disabled={!prompt.trim()}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-black text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <Send className="w-3.5 h-3.5" />
                {isRefine ? 'Refine' : 'Generate'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

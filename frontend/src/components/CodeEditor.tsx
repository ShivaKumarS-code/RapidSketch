'use client'

import { useState, useMemo } from 'react';
import { Copy, Download, Eye, Code2, ExternalLink, Menu } from 'lucide-react';
import { FileNode } from '@/types';
import JSZip from 'jszip';

interface CodeEditorProps {
  code: string;
  files: FileNode[];
  activeFile?: FileNode | null;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

function buildPreviewHtml(files: FileNode[]): string {
  const appFile = files.find(f => f.name === 'App.jsx');
  const cssFile = files.find(f => f.name === 'styles.css');
  if (!appFile) return EMPTY_HTML;

  // Safely encode to avoid breaking the srcdoc attribute
  const css = (cssFile?.content ?? '').replace(/<\/style>/gi, '<\\/style>');
  const app = appFile.content.replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0"/>
<style>
*{box-sizing:border-box}
body{margin:0;padding:0;-webkit-tap-highlight-color:transparent}
button,a,input,select,textarea{touch-action:manipulation;font-family:inherit}
button{cursor:pointer}
img{max-width:100%;height:auto}
${css}
</style>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="react">
const {useState,useEffect,useCallback,useMemo,useRef,useContext,useReducer,createContext}=React;
${app}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
</script>
</body>
</html>`;
}

const EMPTY_HTML = `<!DOCTYPE html><html><body style="margin:0;background:#0c0c0c;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#3d3d3d;flex-direction:column;gap:12px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg><p style="font-size:14px;margin:0">Generate code to see a preview</p></body></html>`;

export default function CodeEditor({ code, files = [], activeFile = null, onMenuClick }: CodeEditorProps) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const hasFiles = files.length > 0;
  const previewHtml = useMemo(() => hasFiles ? buildPreviewHtml(files) : EMPTY_HTML, [files, hasFiles]);

  const handleCopy = () => { if (code) navigator.clipboard.writeText(code); };
  const handleDownload = () => {
    if (!hasFiles) return;
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.content));
    zip.generateAsync({ type: 'blob' }).then(blob => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'rapidsketch-project.zip'; a.click(); URL.revokeObjectURL(a.href);
    });
  };
  const handleOpen = () => {
    if (!hasFiles) return;
    const win = window.open('', '_blank');
    if (win) { win.document.write(previewHtml); win.document.close(); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c0c]" style={{ minHeight: 0 }}>
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button onClick={onMenuClick} title="Toggle explorer"
              className="md:hidden text-gray-600 hover:text-gray-300 p-1.5 rounded transition-colors">
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1 bg-[#141414] rounded-lg p-1">
            {(['preview', 'code'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${tab === t ? 'bg-[#2a2a2a] text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                {t === 'preview' ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[
            { icon: <ExternalLink className="w-3.5 h-3.5" />, fn: handleOpen, disabled: !hasFiles, title: 'Open in new tab' },
            { icon: <Copy className="w-3.5 h-3.5" />, fn: handleCopy, disabled: !code, title: 'Copy' },
            { icon: <Download className="w-3.5 h-3.5" />, fn: handleDownload, disabled: !hasFiles, title: 'Download ZIP' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.fn} disabled={btn.disabled} title={btn.title}
              className="text-gray-600 hover:text-gray-300 p-1.5 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
              {btn.icon}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        <div className={`absolute inset-0 ${tab === 'preview' ? 'block' : 'hidden'}`}>
          <iframe key={previewHtml.length} srcDoc={previewHtml} sandbox="allow-scripts"
            className="w-full h-full border-0" title="Preview" />
        </div>
        <div className={`absolute inset-0 overflow-auto ${tab === 'code' ? 'block' : 'hidden'}`}>
          {hasFiles && code ? (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e1e1e]">
                <span className="text-xs text-gray-500">{activeFile?.name}</span>
                <span className="text-xs text-gray-700 ml-auto">{code.length} chars</span>
              </div>
              <pre className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-words"><code>{code}</code></pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-700 text-sm">No code generated yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

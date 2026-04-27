'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import FileExplorer from '@/components/FileExplorer';
import PromptInput from '@/components/PromptInput';
import { FileNode } from '@/types';

export default function EditorPage() {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);

  const handleCodeUpdate = (newFiles: FileNode[]) => {
    setFiles(newFiles);
    setActiveFile(newFiles.find(f => f.name === 'App.jsx') ?? newFiles[0] ?? null);
  };

  return (
    <div className="flex h-screen bg-[#0c0c0c] text-[#e8e8e8] overflow-hidden">
      <FileExplorer
        isOpen={explorerOpen}
        onToggle={() => setExplorerOpen(o => !o)}
        files={files}
        onFileSelect={setActiveFile}
        activeFile={activeFile}
      />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <CodeEditor
          code={activeFile?.content ?? ''}
          files={files}
          activeFile={activeFile}
          onMenuClick={() => setExplorerOpen(o => !o)}
        />
        <PromptInput onCodeUpdate={handleCodeUpdate} currentFiles={files} />
      </div>
    </div>
  );
}

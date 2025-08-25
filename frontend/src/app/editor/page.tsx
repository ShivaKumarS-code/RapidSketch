'use client';

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import FileExplorer from '@/components/FileExplorer';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';

import { FileNode } from '@/types';

export default function Home() {
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);

  const toggleFileExplorer = () => {
    setIsFileExplorerOpen(!isFileExplorerOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCodeUpdate = (newFiles: FileNode[]) => {
    console.log('Updating files:', newFiles); // Debug log
    setFiles(newFiles);
    if (newFiles.length > 0) {
      // Set the first HTML file as active, or the first file if no HTML
      const htmlFile = newFiles.find(f => f.name.endsWith('.html'));
      setActiveFile(htmlFile || newFiles[0]);
    } else {
      setActiveFile(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <Header onMenuClick={toggleFileExplorer} onSidebarClick={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <FileExplorer 
          isOpen={isFileExplorerOpen} 
          onToggle={toggleFileExplorer} 
          files={files} 
          onFileSelect={setActiveFile} 
          activeFile={activeFile} 
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <CodeEditor 
            onMenuClick={toggleFileExplorer} 
            showMenuButton={!isFileExplorerOpen} 
            code={activeFile ? activeFile.content : ''} 
            files={files}
            activeFile={activeFile}
          />
          <PromptInput onCodeUpdate={handleCodeUpdate} />
        </div>
      </div>
    </div>
  );
}

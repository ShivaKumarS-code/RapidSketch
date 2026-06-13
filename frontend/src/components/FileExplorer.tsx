'use client'

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileCode, FileType, X } from 'lucide-react';
import { FileNode } from '@/types';

interface FileExplorerProps {
  isOpen?: boolean;
  onToggle?: () => void;
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  activeFile: FileNode | null;
}

function fileIcon(name: string) {
  if (name.endsWith('.jsx') || name.endsWith('.tsx')) return <FileCode className="w-3.5 h-3.5 text-blue-400/70" />;
  if (name.endsWith('.css')) return <FileType className="w-3.5 h-3.5 text-pink-400/70" />;
  return <FileCode className="w-3.5 h-3.5 text-gray-500" />;
}

export default function FileExplorer({ isOpen = true, onToggle, files: initialFiles, onFileSelect, activeFile }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);

  useEffect(() => { setFiles(initialFiles); }, [initialFiles]);

  const renderNode = (node: FileNode, level = 0, path = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isSelected = activeFile?.name === node.name;

    return (
      <div key={currentPath}>
        <div
          onClick={() => {
            if (node.type === 'folder') {
              setFiles(prev => prev.map(f => f.name === node.name ? { ...f, isOpen: !f.isOpen } : f));
            } else {
              onFileSelect(node);
              if (onToggle && window.innerWidth < 768) onToggle();
            }
          }}
          className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition-colors rounded mx-1 my-0.5 ${
            isSelected
              ? 'bg-[#1e1e1e] text-white'
              : 'text-gray-500 hover:text-gray-300 hover:bg-[#161616]'
          }`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          {node.type === 'folder'
            ? node.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
            : fileIcon(node.name)
          }
          <span className={isSelected ? 'text-white' : ''}>{node.name}</span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children?.map(c => renderNode(c, level + 1, currentPath))}
      </div>
    );
  };

  return (
    <>
      {isOpen && onToggle && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onToggle} />
      )}
      <div className={`
        ${onToggle ? 'fixed md:relative z-50 md:z-auto' : 'relative'}
        w-52 shrink-0 flex flex-col border-r border-[#1e1e1e] bg-[#0c0c0c] h-full
        transition-transform duration-200
        ${onToggle ? (isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0') : ''}
      `}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1e1e1e]">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Explorer</span>
          {onToggle && (
            <button onClick={onToggle} className="md:hidden text-gray-600 hover:text-gray-300 p-0.5 rounded transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {files.length > 0
            ? files.map(n => renderNode(n))
            : <p className="text-xs text-gray-700 text-center mt-6 px-3">Generate code to see files</p>
          }
        </div>
      </div>
    </>
  );
}

'use client'

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, X, Menu } from 'lucide-react';

import { FileNode } from '@/types';

interface FileExplorerProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  activeFile: FileNode | null;
}

export default function FileExplorer({ isOpen = true, onToggle, className = '', files: initialFiles, onFileSelect, activeFile }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const toggleFolder = (path: string) => {
    const updateNode = (nodes: FileNode[], currentPath: string = ''): FileNode[] => {
      return nodes.map(node => {
        const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
        if (nodePath === path && node.type === 'folder') {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children, nodePath) };
        }
        return node;
      });
    };
    setFiles(updateNode(files));
  };

  const handleFileSelect = (file: FileNode) => {
    onFileSelect(file);
    // Close mobile sidebar when file is selected
    if (onToggle && window.innerWidth < 768) {
      onToggle();
    }
  };

  const renderNode = (node: FileNode, level: number = 0, path: string = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isSelected = activeFile ? activeFile.name === node.name : false;

    return (
      <div key={currentPath} className="animate-slide-in">
        <div
          className={`flex items-center py-1.5 sm:py-2 px-2 hover:bg-white/5 cursor-pointer transition-all duration-300 transform hover:translate-x-1 ${
            isSelected ? 'bg-white/10 border-r-2 border-white shadow-lg shadow-white/5' : ''
          }`}
          style={{ paddingLeft: `${level * 10 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(currentPath);
            } else {
              handleFileSelect(node);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              <div className="transition-transform duration-300">
                {node.isOpen ? (
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 mr-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 mr-1" />
                )}
              </div>
              <div className="transition-all duration-300">
                {node.isOpen ? (
                  <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 mr-1.5 sm:mr-2" />
                ) : (
                  <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 mr-1.5 sm:mr-2" />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-3 sm:w-4 mr-1" />
              <File className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 mr-1.5 sm:mr-2" />
            </>
          )}
          <span className={`text-xs sm:text-sm transition-all duration-300 truncate ${isSelected ? 'text-white font-medium' : 'text-white/80'}`}>
            {node.name}
          </span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children && (
          <div className="animate-expand">
            {node.children.map(child => renderNode(child, level + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onToggle && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* File Explorer */}
      <div className={`
        ${onToggle ? 'fixed md:relative z-50 md:z-auto' : 'relative'}
        bg-black border-r border-white/20 
        w-64 sm:w-72 md:w-64 lg:w-72 xl:w-80
        flex flex-col transition-transform duration-300 ease-in-out
        ${onToggle ? (isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0') : ''}
        h-full
        ${className}
      `}>
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/20">
          <h3 className="text-white font-medium text-sm sm:text-base">Files</h3>
          <div className="flex items-center space-x-2">
            <button className="text-white/60 hover:text-white transition-all duration-300 p-1 rounded hover:bg-white/5 transform hover:scale-110">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            {onToggle && (
              <button 
                className="md:hidden text-white/60 hover:text-white transition-all duration-300 p-1 rounded hover:bg-white/5"
                onClick={onToggle}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {files.map(node => renderNode(node))}
        </div>
      </div>
    </>
  );
}

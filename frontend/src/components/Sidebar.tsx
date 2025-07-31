'use client'

import { useState } from 'react';
import { History, Bookmark, Palette, Layers, Globe, Zap, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function Sidebar({ isOpen = true, onToggle, className = '' }: SidebarProps) {
  const [activeIndex, setActiveIndex] = useState(2);

  const tools = [
    { icon: History, label: 'History' },
    { icon: Bookmark, label: 'Saved' },
    { icon: Palette, label: 'Themes' },
    { icon: Layers, label: 'Components' },
    { icon: Globe, label: 'Deploy' },
    { icon: Zap, label: 'AI Tools' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onToggle && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${onToggle ? 'fixed top-0 right-0 md:relative z-50 md:z-auto' : 'relative'}
        bg-black border-l border-white/20 
        w-16 sm:w-20
        flex flex-col items-center py-3 sm:py-4 space-y-3 sm:space-y-4
        transition-transform duration-300 ease-in-out
        ${onToggle ? (isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0') : ''}
        h-full
        ${className}
      `}>
        {onToggle && (
            <button 
              className="md:hidden text-white/60 hover:text-white transition-all duration-300 p-1 rounded hover:bg-white/5 mb-4"
              onClick={onToggle}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        )}
        {tools.map((tool, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`p-2 sm:p-3 rounded-lg transition-all duration-300 transform hover:scale-110 group ${
              activeIndex === index 
                ? 'bg-white text-black shadow-lg shadow-white/20 scale-105' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
          </button>
        ))}
      </div>
    </>
  );
}

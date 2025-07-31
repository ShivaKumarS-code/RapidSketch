'use client'

import { Zap, Settings, User, Download, Share, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  onSidebarClick?: () => void;
}

export default function Header({ onMenuClick, onSidebarClick }: HeaderProps) {
  return (
    <header className="bg-black border-b border-white/20 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <button
              className="md:hidden text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center space-x-2 group">
            <div className="bg-white p-2 rounded-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">RapidSketch</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button className="hidden sm:block text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110">
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="hidden sm:block text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110">
            <Share className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="hidden md:block text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="bg-white text-black px-3 sm:px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg hover:shadow-white/20">
            <User className="w-4 h-4 inline sm:mr-2" />
            <span className="hidden sm:inline">Account</span>
          </button>
          {onSidebarClick && (
            <button
              className="md:hidden text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10"
              onClick={onSidebarClick}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
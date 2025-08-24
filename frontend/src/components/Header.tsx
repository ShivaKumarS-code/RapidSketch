'use client'

import { Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  onMenuClick?: () => void;
  onSidebarClick?: () => void;
}

export default function Header({ onMenuClick, onSidebarClick }: HeaderProps) {
  return (
    <header className="bg-black/80 backdrop-blur-sm border-b border-cyan-400/30 px-4 sm:px-6 py-3 sm:py-4 shadow-lg shadow-cyan-500/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <button
              className="md:hidden text-cyan-400/70 hover:text-cyan-400 transition-all duration-300 p-2 rounded-lg hover:bg-cyan-400/10"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src="/logo.png" alt="RapidSketch Logo" width={32} height={32} className="transform scale-230" />
            </div>
            <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">Rapid<span className='text-yellow-200'>S</span>ketch</h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
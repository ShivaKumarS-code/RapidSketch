'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Code2, RefreshCw, Layers } from 'lucide-react';

const EXAMPLES = [
  "A kanban board with drag and drop columns",
  "A weather dashboard with animated charts",
  "A music player with waveform visualizer",
  "An e-commerce product page with cart",
  "A real-time chat interface with avatars",
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [placeholder, setPlaceholder] = useState(EXAMPLES[0]);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const [exIdx, setExIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const target = EXAMPLES[exIdx];
    if (typing) {
      if (displayed.length < target.length) {
        timerRef.current = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 40);
      } else {
        timerRef.current = setTimeout(() => setTyping(false), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timerRef.current = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 20);
      } else {
        setExIdx(i => (i + 1) % EXAMPLES.length);
        setTyping(true);
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [displayed, typing, exIdx]);

  const features = [
    { icon: <Zap className="w-5 h-5" />, title: "Instant generation", desc: "Prompt to working React app in seconds via Groq's ultra-fast inference." },
    { icon: <Code2 className="w-5 h-5" />, title: "Real React code", desc: "Generates actual JSX with hooks, state, and CSS — not just static HTML." },
    { icon: <RefreshCw className="w-5 h-5" />, title: "Iterative refinement", desc: "Keep refining with natural language. The AI remembers your session context." },
    { icon: <Layers className="w-5 h-5" />, title: "Live Sandpack preview", desc: "In-browser React bundler renders your app instantly with hot reload." },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#e8e8e8] flex flex-col">
      {/* Nav */}
      <header className="border-b border-[#1e1e1e] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo2.png" alt="logo" width={28} height={28} />
          <span className="font-semibold text-white tracking-tight">Rapid<span className="text-gray-400">Sketch</span></span>
        </Link>
        <Link href="/editor"
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          Open Editor <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 text-xs px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Powered by Groq + LangChain + Sandpack
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Describe it.<br />
          <span className="text-gray-500">We build it.</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-12 leading-relaxed">
          RapidSketch turns natural language into production-ready React components — live preview included.
        </p>

        {/* Prompt box */}
        <div className="w-full max-w-2xl bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2 h-2 bg-[#2a2a2a] rounded-full" />
            <span className="w-2 h-2 bg-[#2a2a2a] rounded-full" />
            <span className="w-2 h-2 bg-[#2a2a2a] rounded-full" />
            <span className="ml-2">prompt</span>
          </div>
          <div className="p-5 relative min-h-[100px]">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-transparent text-white resize-none outline-none text-sm leading-relaxed relative z-10 min-h-[80px]"
              rows={3}
              placeholder=""
            />
            {!prompt && (
              <div className="absolute top-5 left-5 right-5 pointer-events-none text-gray-600 text-sm leading-relaxed">
                {displayed}<span className="animate-pulse text-gray-400">|</span>
              </div>
            )}
          </div>
          <div className="px-5 py-3 border-t border-[#1e1e1e] flex items-center justify-between">
            <span className="text-xs text-gray-700">{prompt.length}/2000</span>
            <Link
              href={{ pathname: '/editor', query: prompt ? { initialPrompt: prompt } : {} }}
              className="flex items-center gap-2 bg-white text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Generate <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-700 mb-20">No signup required. Free to use.</p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
          {features.map((f, i) => (
            <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 text-left hover:border-[#2a2a2a] transition-colors">
              <div className="text-gray-500 mb-3">{f.icon}</div>
              <h3 className="text-white text-sm font-medium mb-1.5">{f.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[#1e1e1e] px-6 py-5 flex items-center justify-between text-xs text-gray-700">
        <span>© {new Date().getFullYear()} RapidSketch</span>
        <span>Built with Next.js · FastAPI · Groq</span>
      </footer>
    </div>
  );
}

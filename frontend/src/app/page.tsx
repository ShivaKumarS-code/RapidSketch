'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Code, Palette, Star, Zap, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const placeholders = [
    "Create a futuristic dashboard with neon accents, dark theme, animated cards...",
    "Build a modern e-commerce product page with 3D hover effects and smooth animations...",
    "Design a minimalist portfolio website with floating elements and gradient backgrounds...",
    "Generate a gaming interface with holographic buttons and cyberpunk styling...",
    "Make a social media app layout with dark mode and glowing notification badges..."
  ];

  // Typing animation effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isTyping) {
      const targetText = placeholders[currentPlaceholder];
      
      if (displayText.length < targetText.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, 50 + Math.random() * 50); // Variable typing speed
      } else {
        // Pause at end of text
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Start erasing
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
      } else {
        // Move to next placeholder
        setCurrentPlaceholder((prev: number) => (prev + 1) % placeholders.length);
        setIsTyping(true);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [displayText, isTyping, currentPlaceholder, placeholders]);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description: "Describe your UI concept and let our advanced AI create the code for you.",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Instant Preview",
      description: "See your generated UI come to life in real-time with our live preview feature.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Go from idea to prototype in seconds, not hours or days.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Beautiful Output",
      description: "Generate modern, responsive, and visually appealing user interfaces.",
      color: "from-green-400 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 bg-black/90 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image src="/logo.png" alt="RapidSketch Logo" width={40} height={40} className="transform scale-230" />
            </div>
            <h1 className="text-white font-bold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text">
              Rapid<span className='text-yellow-200'>S</span>ketch
            </h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:scale-105">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:scale-105">How It Works</a>
          </nav>
          
          <Link href="/editor" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 sm:px-6 py-2 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 font-medium transform hover:scale-105 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Go from{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse">
              Concept
            </span>
            <br />
            to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
              Code
            </span>{' '}
            in Seconds
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            RapidSketch uses <span className="text-cyan-400 font-semibold">advanced AI</span> to transform your UI ideas into fully functional, 
            modern web applications. <span className="text-purple-400 font-semibold">No coding required.</span>
          </p>
          
          {/* Enhanced prompt interface */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 hover:shadow-cyan-500/10 transition-all duration-500">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                </div>
                <div className="text-center text-gray-400 text-sm font-mono">
                  AI UI Generator
                </div>
                <div className="text-gray-500 text-xs font-mono">
                  v2.0
                </div>
              </div>
              
              {/* Prompt area */}
              <div className="p-6">
                <div className="flex items-center mb-4 text-sm font-mono text-gray-500">
                  <span className="text-cyan-400">$</span>
                  <span className="ml-2">rapidsketch generate --ui</span>
                </div>
                
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder=""
                    className="w-full bg-transparent text-white placeholder-gray-500 resize-none border-none outline-none min-h-[120px] text-base leading-relaxed font-mono relative z-10"
                    rows={4}
                  />
                  {!prompt && (
                    <div className="absolute top-0 left-0 right-0 pointer-events-none text-gray-500 text-base leading-relaxed font-mono">
                      {displayText}
                      <span className="animate-pulse text-cyan-400">|</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500 text-sm font-mono">{prompt.length}/2000</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-400"></div>
                    </div>
                  </div>
                  
                  <Link 
                    href={{
                      pathname: '/editor',
                      query: prompt ? { initialPrompt: prompt } : {}
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 flex items-center space-x-3 transform hover:scale-105 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                  >
                    <span>Generate</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to rapidly prototype and build <span className="text-cyan-400 font-semibold">stunning</span> user interfaces.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-700/30 rounded-3xl p-8 hover:border-transparent transition-all duration-700 hover:shadow-2xl hover:-translate-y-4 overflow-hidden cursor-pointer"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* Animated border gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-3xl`}></div>
                <div className={`absolute inset-[1px] bg-gray-900/80 rounded-3xl transition-all duration-700`}></div>
                
                {/* Floating particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-1 h-1 bg-gradient-to-r ${feature.color} rounded-full animate-pulse`}
                      style={{
                        top: `${20 + i * 10}%`,
                        left: `${10 + i * 15}%`,
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '2s'
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with enhanced effects */}
                  <div className={`relative mb-8 w-fit group-hover:scale-125 transition-all duration-500`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 scale-150`}></div>
                    <div className={`relative text-white p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-2xl transform group-hover:rotate-12 transition-all duration-500`}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  {/* Title with gradient effect */}
                  <h3 className={`text-xl font-bold mb-4 text-white group-hover:bg-gradient-to-r group-hover:${feature.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500`}>
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 group-hover:text-gray-200 transition-colors duration-500 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} w-0 group-hover:w-full transition-all duration-700 rounded-full`}></div>
                </div>
                
                {/* Corner glow effect */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700 rounded-3xl blur-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Transform your ideas into reality in just <span className="text-purple-400 font-semibold">three simple steps</span>.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-12 lg:space-y-0 lg:space-x-8">
            {[ 
              { 
                step: "01", 
                title: "Describe Your UI", 
                description: "Simply tell us what kind of UI you want to create using natural language.",
                color: "from-cyan-400 to-blue-500"
              },
              { 
                step: "02", 
                title: "AI Generates Code", 
                description: "Our powerful AI instantly creates the HTML, CSS, and JavaScript for your design.",
                color: "from-purple-400 to-pink-500" 
              },
              { 
                step: "03", 
                title: "Preview & Refine", 
                description: "See your UI come to life in real-time and make adjustments as needed.",
                color: "from-green-400 to-emerald-500"
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center max-w-sm group">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-2xl mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {item.description}
                </p>
                
                {/* Connecting line */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-12 border-t border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image src="/logo.png" alt="RapidSketch Logo" width={32} height={32} className="transform scale-230" />
              </div>
              <h2 className="text-white font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                Rapid<span className='text-yellow-200'>S</span>ketch
              </h2>
            </div>
          </div>
          
          <div className="mt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} RapidSketch. All rights reserved. Built with ❤️ and AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
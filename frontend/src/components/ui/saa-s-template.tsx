'use client';

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from 'motion/react';
import { FeatureCard } from './grid-feature-cards';
import { Zap, Cpu, Code, FolderOpen, Play, Download } from 'lucide-react';
import { HowItWorks } from './how-it-works';
import HoverFooter from './footer';
import { supabase } from '@/lib/supabase';

// Inline Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-white text-black hover:bg-gray-100",
      secondary: "bg-gray-800 text-white hover:bg-gray-700",
      ghost: "hover:bg-gray-800/50 text-white",
      gradient: "bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95"
    };
    
    const sizes = {
      default: "py-2.5 px-6 text-sm",
      sm: "py-1.5 px-4 text-xs",
      lg: "py-4 px-10 text-base font-semibold"
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Icons
const ArrowRight = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const Menu = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const X = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const Navigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-black/40 backdrop-blur-md border-none">
      <div 
        className="nav-container max-w-5xl mx-auto h-[72px] sm:h-20 flex items-center justify-between md:grid md:grid-cols-3 md:items-center"
        style={{ marginLeft: 'auto', marginRight: 'auto' }}
      >
        {/* Logo */}
        <div className="flex justify-start md:col-span-1">
          <a href="/" className="text-xl font-medium text-white tracking-tight hover:opacity-90 transition-opacity">
            RapidSketch
          </a>
        </div>
        
        {/* Centered Desktop Links */}
        <div className="hidden md:flex items-center justify-center gap-8 md:col-span-1">
          <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
            How it works
          </a>
        </div>

        {/* Right side - button */}
        <div className="hidden md:flex justify-end md:col-span-1">
          <a 
            href={user ? "/editor" : "/login"} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 550,
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '8px 18px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              textDecoration: 'none'
            }} 
            className="hover:bg-gray-100 hover:scale-102 active:scale-98"
          >
            {user ? "Workspace" : "Sign in"}
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden text-white focus:outline-none p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown md:hidden w-full bg-black/95 backdrop-blur-md border-t border-gray-900 flex flex-col gap-6 animate-[slideDown_0.2s_ease-out]">
          <a
            href="#features"
            className="text-base text-white/60 hover:text-white transition-colors py-2.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-base text-white/60 hover:text-white transition-colors py-2.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            How it works
          </a>
          <a
            href={user ? "/editor" : "/login"}
            className="text-base text-white hover:text-white/80 transition-colors py-2.5 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            {user ? "Workspace →" : "Sign in →"}
          </a>
        </div>
      )}
    </header>
  );
});

Navigation.displayName = "Navigation";

// Hero Component
const Hero = React.memo(() => {
  return (
    <section
      className="hero-section relative min-h-screen flex flex-col items-center justify-start px-6 pb-20"
      style={{
        animation: "fadeIn 0.6s ease-out"
      }}
    >
      <aside className="eyebrow-badge">
        <span className="text-xs text-center whitespace-nowrap" style={{ color: '#9ca3af' }}>
          Streaming model with Cerebras & GLM 4.7 is live!
        </span>
        <a
          href="/editor"
          className="flex items-center gap-1 text-xs hover:text-white transition-all active:scale-95 whitespace-nowrap text-cyan-400"
          aria-label="Read more about the new version"
        >
          Try it now
          <ArrowRight size={12} />
        </a>
      </aside>

      <h1
        className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-center max-w-3xl px-6 leading-tight"
        style={{
          background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.05em"
        }}
      >
        Give your frontend ideas <br className="hidden sm:inline" />the app they deserve
      </h1>

      <p className="hero-desc text-sm md:text-base text-center max-w-2xl px-6" style={{ color: '#9ca3af' }}>
        Generate fully interactive React applications in seconds. Describe your interface, watch the AI stream the code, and preview it instantly in a live sandbox.
      </p>

      <div className="hero-btn-container flex items-center gap-4 relative z-10">
        <a href="/editor" style={{ textDecoration: 'none' }}>
          <button
            type="button"
            className="premium-btn"
            aria-label="Get started with the template"
          >
            Launch Workspace
          </button>
        </a>
      </div>

      <div className="w-full max-w-6xl relative pb-10">
        <div
          className="absolute left-1/2 w-[90%] pointer-events-none z-0"
          style={{
            top: "-40%",
            transform: "translateX(-50%)"
          }}
          aria-hidden="true"
        >
          <img
            src="https://i.postimg.cc/Ss6yShGy/glows.png"
            alt=""
            className="w-full h-auto opacity-70"
            style={{ mixBlendMode: 'screen' }}
            loading="eager"
          />
        </div>
        
        <div className="relative z-10 rounded-xl overflow-hidden border border-gray-800 bg-gray-950/40 shadow-2xl">
          <img
            src="/generated_mock.png"
            alt="Dashboard preview showing analytics and metrics interface"
            className="w-full h-[280px] sm:h-[380px] md:h-[500px] lg:h-[630px] object-cover object-top"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

const features = [
	{
		title: 'AI Code Streaming',
		icon: Zap,
		description: 'Powered by Cerebras and GLM 4.7 for lightning-fast, real-time React code generation.',
	},
	{
		title: 'Live Preview Sandbox',
		icon: Play,
		description: 'See your frontend layout render instantly and interact with it in real-time.',
	},
	{
		title: 'Interactive Code Editor',
		icon: Code,
		description: 'Tweak, refine, and view the generated code directly with an embedded code editor.',
	},
	{
		title: 'Multi-File Workspace',
		icon: FolderOpen,
		description: 'Manage full-scale components and structures with a functional file tree explorer.',
	},
	{
		title: 'Instant UI Generation',
		icon: Cpu,
		description: 'Translate simple descriptions into fully working interactive React screens.',
	},
	{
		title: 'One-Click Export',
		icon: Download,
		description: 'Download the generated application code and easily run it in your local dev setup.',
	},
];

type ViewAnimationProps = {
	delay?: number;
	className?: React.ComponentProps<typeof motion.div>['className'];
	children: React.ReactNode;
	style?: React.CSSProperties;
};

function AnimatedContainer({ className, delay = 0.1, children, style }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (shouldReduceMotion || !mounted) {
		return <div className={className} style={style}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
			style={style}
		>
			{children}
		</motion.div>
	);
}

const FeaturesSection = React.memo(() => {
	return (
		<section 
			id="features" 
			className="border-t border-gray-900/60 bg-black relative z-20"
			style={{
				paddingTop: '96px',
				paddingBottom: '96px',
				paddingLeft: '24px',
				paddingRight: '24px'
			}}
		>
			<div 
				className="mx-auto w-full max-w-5xl" 
				style={{ 
					marginLeft: 'auto', 
					marginRight: 'auto',
					display: 'flex',
					flexDirection: 'column',
					gap: '64px' // Space between the title container and the cards grid
				}}
			>
				<AnimatedContainer 
					className="mx-auto max-w-3xl text-center" 
					style={{ 
						marginLeft: 'auto', 
						marginRight: 'auto', 
						textAlign: 'center',
						display: 'flex',
						flexDirection: 'column',
						gap: '16px' // Space between the h2 and p
					}}
				>
					<h2 
						className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl"
						style={{
							background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							letterSpacing: "-0.04em",
							margin: 0,
							lineHeight: '1.2'
						}}
					>
						Power. Speed. Control.
					</h2>
					<p 
						className="text-gray-400 text-sm tracking-wide md:text-base max-w-lg mx-auto leading-relaxed" 
						style={{ 
							marginLeft: 'auto', 
							marginRight: 'auto', 
							margin: 0,
							color: '#9ca3af'
						}}
					>
						Everything you need to stream, edit, and preview fully interactive React interfaces in seconds.
					</p>
				</AnimatedContainer>

				<AnimatedContainer
					delay={0.3}
					className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed border-gray-800/60 divide-gray-800/60 sm:grid-cols-2 md:grid-cols-3"
					style={{ 
						marginLeft: 'auto', 
						marginRight: 'auto', 
						width: '100%',
						backgroundColor: 'rgba(0, 0, 0, 0.2)'
					}}
				>
					{features.map((feature, i) => (
						<FeatureCard key={i} feature={feature} />
					))}
				</AnimatedContainer>
			</div>
		</section>
	);
});

FeaturesSection.displayName = "FeaturesSection";

// Main Component
export default function Component() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <HoverFooter />
    </main>
  );
}

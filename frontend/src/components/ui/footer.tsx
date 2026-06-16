"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

// Local Custom SVG Icons for compatibility with older lucide-react versions
const MailIcon = ({ size = 18, className }: { size?: number; className?: string }) => (
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
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LinkedinIcon = ({ size = 18, className }: { size?: number; className?: string }) => (
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 18, className }: { size?: number; className?: string }) => (
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
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

// Local cn utility to avoid missing import issues
const cn = (...classes: (string | undefined | null | boolean)[]) => classes.filter(Boolean).join(" ");

export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      if (svgRect.width > 0 && svgRect.height > 0) {
        const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
        const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
        setMaskPosition({
          cx: `${cxPercentage}%`,
          cy: `${cyPercentage}%`,
        });
      }
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none uppercase cursor-pointer", className)}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#80eeb4" />
              <stop offset="75%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent font-[helvetica] text-7xl font-bold"
        style={{ stroke: 'rgba(255, 255, 255, 0.05)', opacity: hovered ? 0.7 : 0.3, transition: 'opacity 0.3s ease' }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent font-[helvetica] text-7xl font-bold"
        style={{ stroke: '#ef4444', strokeOpacity: 0.4 }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        className="fill-transparent font-[helvetica] text-7xl font-bold"
      >
        {text}
      </text>
    </svg>
  );
};

export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(125% 125% at 50% 10%, #0F0F1166 50%, #ef444415 100%)",
      }}
    />
  );
};

export default function HoverFooter() {
  // Contact info data
  const contactInfo = [
    {
      icon: <MailIcon size={18} className="text-[#ef4444]" />,
      text: "shiva.ks1604@gmail.com",
      href: "mailto:shiva.ks1604@gmail.com",
    },
    {
      icon: <LinkedinIcon size={18} className="text-[#ef4444]" />,
      text: "LinkedIn / shiva-ks16",
      href: "https://www.linkedin.com/in/shiva-ks16/",
    },
    {
      icon: <GithubIcon size={18} className="text-[#ef4444]" />,
      text: "GitHub / ShivaKumarS-code",
      href: "https://github.com/ShivaKumarS-code",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <GithubIcon size={20} />, label: "GitHub", href: "https://github.com/ShivaKumarS-code" },
    { icon: <LinkedinIcon size={20} />, label: "LinkedIn", href: "https://www.linkedin.com/in/shiva-ks16/" },
  ];

  return (
    <footer 
      className="bg-[#0F0F11]/10 relative h-fit rounded-3xl overflow-hidden m-8 border border-white/5 z-20"
      style={{
        margin: '32px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="max-w-7xl mx-auto z-40 relative"
        style={{
          padding: '56px',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24"
          style={{ paddingBottom: '48px', boxSizing: 'border-box' }}
        >
          {/* Brand section */}
          <div className="flex flex-col" style={{ gap: '16px', boxSizing: 'border-box' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <span className="text-[#ef4444] text-2xl font-extrabold animate-pulse" style={{ color: '#ef4444' }}>
                ●
              </span>
              <span className="text-white text-2xl font-bold tracking-widest">RAPIDSKETCH</span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 normal-case" style={{ margin: 0 }}>
              RapidSketch is a modern, AI-powered document-to-frontend platform that transforms ideas into engaging interfaces.
            </p>
          </div>

          {/* Contact section */}
          <div className="flex flex-col md:items-end" style={{ boxSizing: 'border-box' }}>
            <div className="w-full md:max-w-xs" style={{ boxSizing: 'border-box' }}>
              <h4 className="text-white text-sm font-semibold tracking-wider" style={{ marginBottom: '24px', margin: '0 0 24px 0' }}>
                Contact Me
              </h4>
              <ul className="space-y-4" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {contactInfo.map((item, i) => (
                  <li key={i} className="flex items-center" style={{ gap: '12px', margin: '0 0 16px 0' }}>
                    {item.icon}
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors tracking-wide normal-case text-neutral-400"
                        style={{ textDecoration: 'none' }}
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span className="hover:text-white transition-colors tracking-wide normal-case text-neutral-400">
                        {item.text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-t border-white/10" style={{ marginTop: '32px', marginBottom: '32px', borderStyle: 'solid', borderWidth: '1px 0 0 0', borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Footer bottom */}
        <div 
          className="flex flex-col md:flex-row justify-between items-center text-xs"
          style={{ gap: '24px', boxSizing: 'border-box' }}
        >
          {/* Social icons */}
          <div className="flex space-x-6 text-neutral-500" style={{ gap: '24px', margin: 0 }}>
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="hover:text-white transition-colors"
                style={{ color: '#ef4444' }}
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left text-neutral-500" style={{ margin: 0 }}>
            &copy; {new Date().getFullYear()} RAPIDSKETCH.EXE. ALL SYSTEM CHIPS COMPILING.
          </p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-[30rem] -mt-52 -mb-36 relative z-10">
        <TextHoverEffect text="SKETCH" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

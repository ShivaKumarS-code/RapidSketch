"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Zap, Play } from "lucide-react";
import React from "react";

// The main props for the HowItWorks component
interface HowItWorksProps extends React.HTMLAttributes<HTMLElement> {}

// The props for a single step card
interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

/**
 * A single step card within the "How It Works" section.
 * Styled for premium dark theme presentation.
 */
const StepCard: React.FC<StepCardProps> = ({
  icon,
  title,
  description,
  benefits,
}) => (
  <div
    className="relative rounded-2xl border border-gray-800 bg-gray-950/20 transition-all duration-300 ease-in-out group hover:scale-[1.03] hover:border-gray-700 hover:bg-white/[0.01]"
    style={{
      padding: '36px 32px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '340px'
    }}
  >
    {/* Icon */}
    <div 
      className="mb-6 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-800 text-white"
      style={{ width: '48px', height: '48px' }}
    >
      {icon}
    </div>
    
    {/* Title and Description */}
    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
      {title}
    </h3>
    <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '24px' }}>
      {description}
    </p>
    
    {/* Benefits List */}
    <ul className="space-y-3 mt-auto">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="flex flex-shrink-0 items-center justify-center rounded-full" style={{ width: '16px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="rounded-full bg-white" style={{ width: '6px', height: '6px' }}></div>
          </div>
          <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 300 }}>{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * A responsive "How It Works" section that displays a 3-step process.
 */
export const HowItWorks: React.FC<HowItWorksProps> = ({
  className,
  ...props
}) => {
  const stepsData = [
    {
      icon: <Sparkles style={{ width: '20px', height: '20px' }} strokeWidth={1.5} />,
      title: "1. Describe your idea",
      description:
        "Describe the interface or component you want to build in plain English using the input prompt area.",
      benefits: [
        "Smart text prompt auto-completion",
        "Supports detailed UI design directions",
        "Saves previous workspace history",
      ],
    },
    {
      icon: <Zap style={{ width: '20px', height: '20px' }} strokeWidth={1.5} />,
      title: "2. Watch real-time streaming",
      description:
        "Watch the AI model stream full React source code components in real-time, building out the architecture.",
      benefits: [
        "Powered by Groq for maximum speed",
        "Complete multi-file code generator",
        "Well-structured components",
      ],
    },
    {
      icon: <Play style={{ width: '20px', height: '20px' }} strokeWidth={1.5} />,
      title: "3. Preview and export",
      description:
        "Verify your React elements inside the interactive preview sandbox and download the code in one click.",
      benefits: [
        "Interactive live preview workspace",
        "Direct syntax-highlighted editor",
        "Clean export to local filesystem",
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className={cn("w-full bg-black border-t border-gray-900/60 relative z-20", className)}
      style={{
        paddingTop: '96px',
        paddingBottom: '96px',
        paddingLeft: '24px',
        paddingRight: '24px'
      }}
      {...props}
    >
      <div 
        className="mx-auto w-full max-w-5xl"
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '64px'
        }}
      >
        {/* Section Header */}
        <div 
          className="mx-auto text-center"
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '640px'
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
            How it works
          </h2>
          <p 
            style={{
              color: '#9ca3af',
              fontSize: '16px',
              fontWeight: 300,
              lineHeight: '1.6',
              margin: 0
            }}
          >
            Go from natural language ideas to interactive React applications in three simple steps.
          </p>
        </div>

        {/* Step Indicators with Connecting Line */}
        <div className="relative mx-auto w-full max-w-4xl hidden md:block" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px' }}>
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-[1px] w-[66.6667%] -translate-y-1/2 bg-gray-800"
          ></div>
          {/* Grid to align numbers */}
          <div className="relative grid grid-cols-3">
            {stepsData.map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-center justify-self-center rounded-full font-medium text-white border border-gray-800"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#000000',
                  boxShadow: '0 0 0 6px #000000',
                  fontSize: '14px'
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Steps Grid */}
        <div 
          className="mx-auto grid w-full gap-8 grid-cols-1 md:grid-cols-3"
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
        >
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              benefits={step.benefits}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

"use client";

import React, { useState } from "react";
import { SunIcon as Sunburst } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }

    setSubmitted(true);

    if (valid) {
      setLoading(true);
      setErrorMsg("");
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          window.location.href = "/editor";
        }
      } catch (err: any) {
        setErrorMsg("An unexpected error occurred during login.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen !flex !items-center !justify-center bg-black p-4 sm:p-6 md:p-12 relative overflow-hidden">
      {/* Grid Background Design */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_100%)]">
          <GridPattern
            width={24}
            height={24}
            x="-12"
            y="4"
            squares={[[4, 5], [10, 8], [12, 4], [2, 10], [6, 3], [8, 14], [15, 6]]}
            className="fill-white/[0.04] stroke-white/[0.12] absolute inset-0 h-full w-full"
          />
        </div>
      </div>

      <div className="w-full max-w-5xl !overflow-hidden !grid !grid-cols-1 md:!grid-cols-2 bg-zinc-950/80 rounded-3xl shadow-[0_0_50px_-12px_rgba(249,115,22,0.15)] border border-zinc-800/80 backdrop-blur-xl z-10">
        
        {/* Left Side: Solid Black Panel with Scoped Decorations */}
        <div className="hidden md:!flex bg-[#030303] text-white p-8 md:p-12 !relative !overflow-hidden !flex-col !justify-center md:min-h-[550px] border-r border-zinc-800/60">
          {/* Scoped Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black z-10 pointer-events-none"></div>

          {/* Vertical Stripe Lines (Scoped to Left Panel) */}
          <div className="flex absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
            <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-white/0 via-white/5 to-white/20 blur-xs transform -rotate-12"></div>
            <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-white/0 via-white/5 to-white/20 blur-xs transform -rotate-12"></div>
            <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-white/0 via-white/5 to-white/20 blur-xs transform -rotate-12"></div>
            <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-white/0 via-white/5 to-white/20 blur-xs transform -rotate-12"></div>
            <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-white/0 via-white/5 to-white/20 blur-xs transform -rotate-12"></div>
          </div>

          {/* Scoped Orange Glowing Orbs */}
          <div className="w-[20rem] h-[20rem] bg-orange-600/30 blur-3xl absolute -bottom-20 -left-20 rounded-full z-0 pointer-events-none"></div>
          <div className="w-[12rem] h-[12rem] bg-white/10 blur-2xl absolute -bottom-10 -left-10 rounded-full z-0 pointer-events-none"></div>

          <h1 className="text-2xl md:text-3xl font-medium leading-snug z-20 tracking-tight relative max-w-xs">
            Welcome back. Build premium interfaces with Cerebras GLM-4.7 speed.
          </h1>
        </div>

        {/* Right Side: Translucent Dark Panel with Spacing */}
        <div className="p-6 sm:p-8 md:p-16 !flex !flex-col !justify-center bg-[#0c0c0e]/80 text-white !z-20 !relative">
          <div className="w-full max-w-md mx-auto !space-y-8">
            {/* Header section */}
            <div className="!space-y-3 !flex !flex-col !items-start">
              <div className="text-orange-500 mb-1">
                <Sunburst className="h-10 w-10 animate-pulse" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-white mt-2">
                Sign In
              </h2>
              <p className="text-zinc-400 text-sm">
                Welcome back to RapidSketch — Log in to your account
              </p>
            </div>

            {/* Form */}
            <form className="!space-y-6" onSubmit={handleSubmit} noValidate>
              {errorMsg && (
                <div className="bg-red-950/30 border border-red-900/50 text-red-400 text-sm p-4 rounded-xl text-left">
                  {errorMsg}
                </div>
              )}

              <div className="!space-y-2.5 !flex !flex-col !text-left">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="hi@example.com"
                  className="text-base w-full py-3.5 px-4 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-zinc-950/60 text-white placeholder:text-zinc-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!emailError}
                  aria-describedby="email-error"
                />
                {emailError && (
                  <p id="email-error" className="text-red-400 text-xs mt-1">
                    {emailError}
                  </p>
                )}
              </div>

              <div className="!space-y-2.5 !flex !flex-col !text-left">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="text-base w-full py-3.5 px-4 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-zinc-950/60 text-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!passwordError}
                  aria-describedby="password-error"
                />
                {passwordError && (
                  <p id="password-error" className="text-red-400 text-xs mt-1">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg mt-2 cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="text-center text-zinc-400 text-sm pt-2">
                Don't have an account?{" "}
                <a href="/signup" className="text-white font-semibold underline hover:text-orange-500 transition-colors">
                  Sign Up
                </a>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<"svg"> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
  const patternId = React.useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={x * width} y={y * height} />
          ))}
        </svg>
      )}
    </svg>
  );
}
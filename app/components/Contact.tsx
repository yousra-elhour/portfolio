"use client";

import Image from "next/image";
import Link from "next/link";
import Email from "./Email";
import Nav from "./Nav";
import { Check, Copy, MoveUpRight } from "lucide-react";
import { PageClouds } from "./CloudsGL";
import { useState, useEffect } from "react";

const EMAIL = "elhour.yousra1910@gmail.com";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/yousra-elhour-978952220/" },
  { label: "Behance", href: "https://www.behance.net/kuroonekoob1fa" },
  { label: "Artstation", href: "https://www.artstation.com/cirrusyk" },
];

export default function Works() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the mailto link still works
    }
  };

  useEffect(() => {
    // Enable content visibility after animation completes (600ms delay like Works)
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="relative overflow-hidden ">
        <div className="page-bg-wrapper bg-gray-900" style={{ opacity: 1 }}>
          <div className={`relative isolate overflow-hidden  font-lead `}>
              <div 
                className="page-backdrop absolute bg-black/30 h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md pointer-events-none"
                style={{ 
                  opacity: 1, // Force immediate visibility
                  backfaceVisibility: 'hidden', // Prevent flickering
                  transform: 'translateZ(0)' // Force hardware acceleration
                }}
              >
                {""}
              </div>
          {/* Optimized background image with hardware acceleration */}
          <Image
            src="/clouds/bg.png"
            alt="Background"
            fill
            priority
            className="absolute inset-0 -z-30 h-full w-full object-cover"
            style={{ 
              transform: 'translateZ(0)', // Force hardware acceleration
              backfaceVisibility: 'hidden' // Prevent flickering
            }}
          />

          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
            style={{ backfaceVisibility: 'hidden' }} // Prevent flickering
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#e0aa88] to-[#8592bd] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                backfaceVisibility: 'hidden', // Prevent flickering
                transform: 'translateZ(0)' // Force hardware acceleration
              }}
            />
          </div>

            <div className="mx-auto max-w-3xl h-screen flex flex-col justify-center items-center lg:px-6 md:px-4 sm:px-2 px-2 "></div>
          </div>
        </div>

        <div className={`contact-content absolute top-[28%] left-[8%] right-[7%] works z-50 font-sans tracking-[.4rem] leading-9 text-lg max-w-full ${!animationComplete ? 'pointer-events-none' : ''}`}>
        <h1 className="contact-title lg:mb-8 md:mb-6 mb-4 font-extrabold lg:text-4xl md:text-3xl text-2xl">
          CONTACT
        </h1>
        <hr className="contact-divider border-0 border-white border-b w-full mb-5" />

        <p className="font-sans tracking-[.2em] lg:text-base text-sm text-white/70 mb-10 max-w-xl leading-7">
          Want to work together — or just talk tech, music, or art?
        </p>

        {/* Email as the centerpiece: large, clickable, copyable — and
            visible on every screen size (the old email row was hidden
            below md) */}
        <div className="flex items-center gap-5 mb-12 flex-wrap">
          <Link
            className="contact-text font-sans lg:text-3xl md:text-2xl text-base tracking-[.1em] border-b border-white/60 pb-2 hover:text-gray-300 transition-colors break-all"
            href={`mailto:${EMAIL}`}
          >
            {EMAIL}
          </Link>
          <button
            onClick={copyEmail}
            aria-label="Copy email address"
            className="flex items-center gap-2 border border-white/40 rounded-full px-4 py-2 text-xs font-sans tracking-[.2em] hover:bg-white/10 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> COPIED
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> COPY
              </>
            )}
          </button>
        </div>

        <ul className="contact-list flex flex-wrap gap-4">
          {SOCIALS.map((social) => (
            <li key={social.label}>
              <Link
                target="_blank"
                href={social.href}
                className="flex items-center gap-2 border border-white/40 rounded-full px-5 py-2.5 font-sans text-xs tracking-[.25em] hover:bg-white/10 transition-colors"
              >
                {social.label}
                <MoveUpRight className="contact-icon h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        </ul>
        </div>

        {/* Foreground clouds — same layers as before, now fluid like the
            hero's: stroke them and they tear into wisps */}
        <PageClouds />
      </div>
      
      <Email />
      <Nav />
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import HeroSection from "./HeroSection";
import About from "./About";
import Works from "./Works";
import Contact from "./Contact";
import CloudsAnimation from "./CloudsAnimation";

export default function ScrollPortfolio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sections = sectionsRef.current.filter(Boolean);
    
    // Simple fade-in animations as sections come into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(entry.target, 
              { 
                y: 50,
                opacity: 0 
              },
              {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out"
              }
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Background clouds that follow scroll */}
      <CloudsAnimation />
      
      {/* Section 1: Hero */}
      <section 
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="min-h-screen relative z-10"
        id="home"
      >
        <HeroSection />
      </section>

      {/* Cloud Transition Element */}
      <div className="h-[50vh] relative overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-100/20 to-transparent"
        />
        {/* Optional: Add floating cloud elements here */}
        <div className="text-white/30 text-center">
          <div className="w-16 h-0.5 bg-white/30 mx-auto"></div>
        </div>
      </div>

      {/* Section 2: About */}
      <section 
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="min-h-screen relative z-10"
        id="about"
      >
        <About />
      </section>

      {/* Cloud Transition Element */}
      <div className="h-[50vh] relative overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-100/20 to-transparent"
        />
        <div className="text-white/30 text-center">
          <div className="w-16 h-0.5 bg-white/30 mx-auto"></div>
        </div>
      </div>

      {/* Section 3: Works */}
      <section 
        ref={(el) => { sectionsRef.current[2] = el; }}
        className="min-h-screen relative z-10"
        id="works"
      >
        <Works />
      </section>

      {/* Cloud Transition Element */}
      <div className="h-[50vh] relative overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-100/20 to-transparent"
        />
        <div className="text-white/30 text-center">
          <div className="w-16 h-0.5 bg-white/30 mx-auto"></div>
        </div>
      </div>

      {/* Section 4: Contact */}
      <section 
        ref={(el) => { sectionsRef.current[3] = el; }}
        className="min-h-screen relative z-10"
        id="contact"
      >
        <Contact />
      </section>
    </div>
  );
}

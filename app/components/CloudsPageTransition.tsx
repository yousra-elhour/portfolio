"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface CloudTransitionProps {
  onComplete?: () => void;
  isVisible?: boolean;
  trigger?: boolean;
}

export default function CloudsPageTransition({ 
  onComplete, 
  isVisible = true,
  trigger = true 
}: CloudTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);
 
  const transitionClouds = [
    { src: "/clouds/high-clouds1.png", delay: 0, duration: 0.8, yStart: -180, opacity: 0.95 },
    { src: "/clouds/low-clouds1.png", delay: 0.15, duration: 1.0, yStart: -220, opacity: 0.9 },
    { src: "/clouds/high-clouds2.png", delay: 0.3, duration: 1.2, yStart: -160, opacity: 0.85 },
    { src: "/clouds/low-clouds2.png", delay: 0.45, duration: 1.4, yStart: -200, opacity: 0.8 },
    { src: "/clouds/low-clouds3.png", delay: 0.6, duration: 1.6, yStart: -140, opacity: 0.75 },
  ];

  useEffect(() => {
    if (!trigger) return;

    const clouds = cloudRefs.current.filter(Boolean);

    // Create main timeline
    const tl = gsap.timeline();

    // Set initial positions (clouds start above the screen)
    clouds.forEach((cloud, index) => {
      const cloudData = transitionClouds[index];
      gsap.set(cloud, {
        y: cloudData.yStart,
        opacity: 0,
        scale: 1.05,
        rotation: gsap.utils.random(-1, 1)
      });
    });

    // Phase 1: Clouds cascade down to cover the screen with staggered animation
    clouds.forEach((cloud, index) => {
      const cloudData = transitionClouds[index];
     
      tl.to(cloud, {
        y: 0, // Cover the screen completely
        opacity: cloudData.opacity,
        scale: 1.1,
        rotation: gsap.utils.random(-2, 2),
        ease: "power2.out",
        duration: cloudData.duration,
      }, cloudData.delay);
    });

    // Phase 2: Keep clouds visible (for persistent clouds)
    clouds.forEach((cloud) => {
      tl.to(cloud, { 
        duration: 9999 // Keep them visible indefinitely
      }, "+=0.5"); 
    });

    // Call onComplete when animation finishes
    tl.call(() => {
      if (onComplete) onComplete();
    });
   
  }, [trigger, onComplete]);

  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-[9999] pointer-events-none overflow-hidden"
      style={{ 
        opacity: 1
      }}
    >
      {transitionClouds.map((cloud, index) => (
        <div
          key={`${cloud.src}-${index}`}
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={cloud.src}
            alt={`Transition Cloud ${index + 1}`}
            fill
            className="object-cover"
            style={{ 
              filter: "brightness(1.05) contrast(1.02) saturate(0.9)",
              mixBlendMode: "normal"
            }}
            priority
          />
        </div>
      ))}
      
      {/* Subtle depth layers - reduced for cleaner look */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent"
        style={{ mixBlendMode: "soft-light" }}
      />
    </div>
  );
}

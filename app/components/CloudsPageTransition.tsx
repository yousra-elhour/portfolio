"use client";

import { useEffect, useRef } from "react";
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

  // Cloud layers for transition with more variety
  const transitionClouds = [
    { src: "/clouds/high-clouds1.png", delay: 0, duration: 0.8, yStart: -180, opacity: 0.95 },
    { src: "/clouds/low-clouds1.png", delay: 0.15, duration: 1.0, yStart: -220, opacity: 0.9 },
    { src: "/clouds/high-clouds2.png", delay: 0.3, duration: 1.2, yStart: -160, opacity: 0.85 },
    { src: "/clouds/low-clouds2.png", delay: 0.45, duration: 1.4, yStart: -200, opacity: 0.8 },
    { src: "/clouds/low-clouds3.png", delay: 0.6, duration: 1.6, yStart: -140, opacity: 0.75 },
  ];

  useEffect(() => {
    if (!containerRef.current || !trigger) return;

    const container = containerRef.current;
    const clouds = cloudRefs.current.filter(Boolean);

    // Create main timeline
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Initial setup - clouds start above viewport
    clouds.forEach((cloud, index) => {
      const cloudData = transitionClouds[index];
      if (!cloud || !cloudData) return;

      gsap.set(cloud, {
        y: cloudData.yStart,
        opacity: cloudData.opacity,
        scale: 1.3,
        rotation: gsap.utils.random(-5, 5),
      });
    });

    // Set container to be visible from start
    gsap.set(container, { opacity: 1 });

    // Phase 1: Clouds cascade down to cover the screen
    clouds.forEach((cloud, index) => {
      const cloudData = transitionClouds[index];
      if (!cloud || !cloudData) return;

      tl.to(cloud, {
        y: 0, // Cover the screen completely
        opacity: cloudData.opacity,
        scale: 1.1,
        rotation: gsap.utils.random(-2, 2),
        duration: cloudData.duration * 0.8,
        ease: "power2.out",
      }, cloudData.delay);
    });

    // Phase 2: Hold clouds in position to fully cover screen
    tl.to({}, { duration: 0.5 });

    // Phase 3: Clouds continue down to reveal new content
    clouds.forEach((cloud, index) => {
      const cloudData = transitionClouds[index];
      if (!cloud || !cloudData) return;

      tl.to(cloud, {
        y: window.innerHeight + 100,
        opacity: 0,
        scale: 1.4,
        rotation: gsap.utils.random(-8, 8),
        duration: cloudData.duration * 0.9,
        ease: "power2.in",
      }, `-=${cloudData.duration * 0.3}`);
    });

    // Phase 4: Hide container after clouds are gone
    tl.to(container, {
      opacity: 0,
      duration: 0.1,
      ease: "power2.inOut",
    }, "-=0.1");

    return () => {
      tl.kill();
    };
  }, [trigger, onComplete]);

  if (!isVisible) return null;

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

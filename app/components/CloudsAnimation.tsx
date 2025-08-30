"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
// import ThreeCloudParticles from "./ThreeCloudParticles";

// Register GSAP plugin (removed ScrollTrigger since we're not using scroll effects)
if (typeof window !== "undefined") {
  // No plugins needed for basic animations
}

interface CloudLayer {
  src: string;
  alt: string;
  opacity: number;
  speed: number;
  zIndex: number;
}

const cloudLayers: CloudLayer[] = [
  // Background clouds (behind text) - Further reduced opacity to minimize conflicts
  { src: "/clouds/lowCloud1.png", alt: "Low Clouds 1", opacity: 0.3, speed: 0.4, zIndex: -15 },
  { src: "/clouds/lowCloud2.png", alt: "Low Clouds 2", opacity: 0.25, speed: 0.6, zIndex: -12 },
  { src: "/clouds/highCloud1.png", alt: "High Clouds 1", opacity: 0.2, speed: 1.0, zIndex: -10 },
];

export default function CloudsAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const clouds = cloudRefs.current;
    
    // Kill any existing animations to prevent conflicts
    clouds.forEach(cloud => {
      if (cloud) gsap.killTweensOf(cloud);
    });

    clouds.forEach((cloud, index) => {
      if (!cloud) return;
      
      const layer = cloudLayers[index];
      const isReverse = index % 2 === 1; // Alternate direction for variety
      
      // Set initial scale and opacity with hardware acceleration
      gsap.set(cloud, { 
        scale: 1.1, // Reduced scale to prevent edge visibility
        opacity: layer.opacity,
        force3D: true // Enable hardware acceleration
      });

      // Create slower, more stable floating animation
      gsap.to(cloud, {
        x: isReverse ? -80 : 80, // Reduced movement
        y: gsap.utils.random(-30, 30), // Reduced vertical movement
        rotation: gsap.utils.random(-1, 1), // Minimal rotation
        scale: gsap.utils.random(1.05, 1.15), // Minimal scaling
        duration: 25 + (index * 3), // Much slower: increased from 8 + (index * 1.5)
        ease: "none", // Linear ease to prevent stuttering
        repeat: -1,
        yoyo: true,
        force3D: true
      });
    });

    // Simplified mouse parallax effect with throttling
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;
        
        clouds.forEach((cloud, index) => {
          if (!cloud) return;
          
          const layer = cloudLayers[index];
          
          // Reduced movement intensity for background clouds
          let xMovement, yMovement;
          if (layer.alt.includes('high') || layer.alt.includes('High')) {
            xMovement = xPercent * 8; // Greatly reduced from 25
            yMovement = yPercent * 5; // Greatly reduced from 15
          } else {
            xMovement = xPercent * 5; // Greatly reduced from 12
            yMovement = yPercent * 3; // Greatly reduced from 8
          }
          
          gsap.to(cloud, {
            x: `+=${xMovement}`,
            y: `+=${yMovement}`,
            duration: 2, // Slower response
            ease: "power1.out",
            overwrite: "auto",
            force3D: true
          });
        });
      }, 16); // Throttle to ~60fps
    };

    // Add mouse interactions
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    // Cleanup function
    return () => {
      clearTimeout(mouseTimeout);
      clouds.forEach(cloud => {
        if (cloud) gsap.killTweensOf(cloud);
      });
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      {/* Main Background */}
      <Image
        src="/clouds/bg.png"
        alt="Sky Background"
        fill
        priority
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        style={{ 
          transform: 'translateZ(0)', // Force hardware acceleration
          backfaceVisibility: 'hidden' // Prevent flickering
        }}
      />
      
      {/* Background Cloud Layers (behind text) */}
      {cloudLayers.map((layer, index) => (
        <div
          key={`${layer.src}-bg-${index}`} // More stable key
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
          className="absolute inset-0 h-full w-full overflow-hidden"
          style={{ 
            zIndex: layer.zIndex,
            willChange: 'transform', // Optimize for animations
            backfaceVisibility: 'hidden' // Prevent flickering
          }}
        >
          <Image
            src={layer.src}
            alt={layer.alt}
            fill
            className="h-full w-full object-cover"
            style={{ 
              opacity: layer.opacity,
              transform: 'translateZ(0)', // Force hardware acceleration
              backfaceVisibility: 'hidden' // Prevent flickering
            }}
          />
        </div>
      ))}
      
      {/* Simplified gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none"
        style={{ 
          zIndex: -5,
          backfaceVisibility: 'hidden' // Prevent flickering
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface CloudLayer {
  src: string;
  alt: string;
  opacity: number;
  speed: number;
  zIndex: number;
}

const backgroundCloudLayers: CloudLayer[] = [
  // Background clouds (behind text)
  { src: "/clouds/low-clouds1.png", alt: "Background Low Clouds 1", opacity: 0.8, speed: 0.4, zIndex: -15 },
  { src: "/clouds/low-clouds2.png", alt: "Background Low Clouds 2", opacity: 0.7, speed: 0.6, zIndex: -12 },
  { src: "/clouds/high-clouds1.png", alt: "Background High Clouds 1", opacity: 0.6, speed: 1.0, zIndex: -10 },
];

export default function BackgroundClouds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const clouds = cloudRefs.current;
    
    // Create main timeline for continuous floating animation
    const tl = gsap.timeline({ repeat: -1 });

    clouds.forEach((cloud, index) => {
      if (!cloud) return;
      
      const layer = backgroundCloudLayers[index];
      const isReverse = index % 2 === 1; // Alternate direction for variety
      
      // Set initial scale to prevent edge visibility and opacity
      gsap.set(cloud, { 
        scale: 1.2, // Scale up to prevent edges showing
        opacity: layer.opacity 
      });

      // Create floating animation for each cloud layer
      const cloudTl = gsap.timeline({ repeat: -1, yoyo: true });
      
      cloudTl.to(cloud, {
        x: isReverse ? -150 : 150,
        y: gsap.utils.random(-60, 60),
        rotation: gsap.utils.random(-3, 3),
        scale: gsap.utils.random(1.15, 1.25), // More dynamic scaling
        duration: 8 + (index * 1.5), // Faster: reduced from 12 + (index * 2)
        ease: "sine.inOut",
      });
    });

    // Smart mouse parallax effect with edge protection
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate mouse position as percentage from center (-1 to 1)
      const xPercent = (clientX / innerWidth - 0.5) * 2;
      const yPercent = (clientY / innerHeight - 0.5) * 2;
      
      // Calculate distance from center (0 to 1)
      const distanceFromCenter = Math.sqrt(xPercent * xPercent + yPercent * yPercent);
      
      // Reduce movement intensity when mouse is near edges
      const edgeProtection = Math.max(0.3, 1 - (distanceFromCenter * 0.5));
      
      clouds.forEach((cloud, index) => {
        if (!cloud) return;
        
        const layer = backgroundCloudLayers[index];
        
        // Apply edge protection to movement intensity
        let xMovement, yMovement;
        if (layer.alt.includes('High')) {
          // High clouds - with edge protection
          xMovement = xPercent * 25 * edgeProtection; // Increased from 20
          yMovement = yPercent * 15 * edgeProtection; // Increased from 12
        } else {
          // Low clouds - with stronger edge protection
          xMovement = xPercent * 12 * edgeProtection; // Increased from 8
          yMovement = yPercent * 8 * edgeProtection; // Increased from 5
        }
        
        gsap.to(cloud, {
          x: `+=${xMovement}`,
          y: `+=${yMovement}`,
          duration: 1.2, // Faster response from 1.5
          ease: "power2.out",
          overwrite: false,
        });
      });
    };

    // Add subtle mouse interactions
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Cleanup function
    return () => {
      tl.kill();
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
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      
      {/* Background Cloud Layers */}
      {backgroundCloudLayers.map((layer, index) => (
        <div
          key={layer.src}
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
          className="absolute inset-0 h-full w-full overflow-hidden"
          style={{ zIndex: layer.zIndex }}
        >
          <Image
            src={layer.src}
            alt={layer.alt}
            fill
            className="h-full w-full object-cover"
            style={{ opacity: layer.opacity }}
          />
        </div>
      ))}
    </div>
  );
}

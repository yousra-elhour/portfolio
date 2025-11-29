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

const heroForegroundCloudLayers: CloudLayer[] = [
  { src: "/clouds/lowCloud3.png", alt: "Foreground Low Clouds", opacity: 0.7, speed: 0.5, zIndex: 10 },
  { src: "/clouds/lowCloud1.png", alt: "Foreground Low Clouds", opacity: 0.4, speed: 0.5, zIndex: 12 },
  { src: "/clouds/highCloud2.png", alt: "Foreground High Clouds", opacity: 0.6, speed: 1.2, zIndex: 14 },
  { src: "/clouds/highCloud1.png", alt: "Top Layer High Clouds", opacity: 0.8, speed: 1.5, zIndex: 16 },
];

export default function HeroForegroundClouds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);
  const mouseAnimationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const clouds = cloudRefs.current;
    
    // Kill any existing animations to prevent conflicts
    clouds.forEach(cloud => {
      if (cloud) gsap.killTweensOf(cloud);
    });
    
    clouds.forEach((cloud, index) => {
      if (!cloud) return;
      
      const layer = heroForegroundCloudLayers[index];
      
      // Responsive positioning based on screen size
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      // Set initial positions with hardware acceleration
      gsap.set(cloud, { 
        scale: isMobile 
          ? (index === 0 ? 3 : index === 1 ? 2.5 : index === 2 ? 3 : 3)
          : isTablet
          ? (index === 0 ? 2.5 : index === 1 ? 2 : index === 2 ? 2.5 : 2.5)
          : (index === 0 ? 2 : index === 1 ? 1.5 : 2),
        opacity: layer.opacity,
        x: isMobile
          ? (index === 0 ? 0 : index === 1 ? -50 : index === 2 ? -100 : -150)
          : isTablet
          ? (index === 0 ? 200 : index === 1 ? 150 : index === 2 ? 100 : 50)
          : (index === 0 ? 350 : index === 1 ? 300 : index === 2 ? 200 : 100),
        y: isMobile
          ? (index === 0 ? 100 : index === 1 ? 100 : index === 2 ? 50 : -50)
          : isTablet
          ? (index === 0 ? 150 : index === 1 ? 150 : index === 2 ? 80 : -50)
          : (index === 0 ? 200 : index === 1 ? 200 : index === 2 ? 100 : -70),
        force3D: true, // Enable hardware acceleration
        transformOrigin: "center center"
      });
      
      // Create smoother animations with reduced complexity
      gsap.to(cloud, {
        x: isMobile
          ? (index === 0 ? -100 : index === 1 ? -150 : index === 2 ? -200 : -250)
          : isTablet
          ? (index === 0 ? 50 : index === 1 ? 0 : index === 2 ? -50 : -100)
          : (index === 0 ? 20 : index === 1 ? 20 : index === 2 ? -100 : -200),
        y: isMobile
          ? (index === 0 ? 80 : index === 1 ? 80 : index === 2 ? 30 : -70)
          : isTablet
          ? (index === 0 ? 130 : index === 1 ? 130 : index === 2 ? 70 : -70)
          : (index === 0 ? 180 : index === 1 ? 180 : index === 2 ? 100 : -100),
        rotation: index % 2 === 0 ? 1 : -1, // Subtle rotation
        scale: isMobile
          ? (index === 0 ? 3.5 : index === 1 ? 3 : index === 2 ? 3.5 : 3.5)
          : isTablet
          ? (index === 0 ? 3 : index === 1 ? 2.5 : index === 2 ? 3 : 3)
          : (index === 0 ? 2.5 : index === 1 ? 1.2 : index === 2 ? 2 : 2),
        duration: 30 + (index * 3), // Slower, more stable animation
        ease: "none", // Linear ease to prevent stuttering
        repeat: -1,
        yoyo: true,
        force3D: true
      });
    });

    // Optimized mouse movement with throttling
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;
        
        // Kill previous mouse animation
        if (mouseAnimationRef.current) {
          mouseAnimationRef.current.kill();
        }
        
        // Create new timeline for mouse movement
        mouseAnimationRef.current = gsap.timeline();
        
        clouds.forEach((cloud, index) => {
          if (!cloud) return;
          
          const layer = heroForegroundCloudLayers[index];
          let xMovement, yMovement;
          
          if (layer.alt.includes('High')) {
            xMovement = xPercent * 15; // Reduced movement
            yMovement = yPercent * 8;
          } else {
            xMovement = xPercent * 10;
            yMovement = yPercent * 5;
          }
          
          mouseAnimationRef.current?.to(cloud, {
            x: `+=${xMovement}`,
            y: `+=${yMovement}`,
            duration: 2, // Slower response
            ease: "power1.out",
            overwrite: "auto",
            force3D: true
          }, 0);
        });
      }, 16); // Throttle to ~60fps
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    return () => {
      clearTimeout(mouseTimeout);
      if (mouseAnimationRef.current) {
        mouseAnimationRef.current.kill();
      }
      clouds.forEach(cloud => {
        if (cloud) gsap.killTweensOf(cloud);
      });
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full z-[100] pointer-events-none overflow-hidden">      
      {heroForegroundCloudLayers.map((layer, index) => (
        <div
          key={`${layer.src}-${index}`} // More stable key
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
            priority
          />
        </div>
      ))}
    </div>
  );
}

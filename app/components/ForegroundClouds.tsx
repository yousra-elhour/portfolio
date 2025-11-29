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
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  scale: number;
}

const foregroundCloudLayers: CloudLayer[] = [
  { 
    src: "/clouds/lowCloud3.png", 
    alt: "Foreground Low Clouds", 
    opacity: 0.35, 
    speed: 0.3, 
    zIndex: 100000,
    scale: 0.8,
    position: { bottom: "5%", right: "0%" }
  },
  { 
    src: "/clouds/highCloud2.png", 
    alt: "Foreground High Clouds", 
    opacity: 0.25, 
    speed: 0.5, 
    zIndex: 48,
    scale: 0.6,
    position: { top: "10%", right: "10%" }
  },
  { 
    src: "/clouds/lowCloud2.png", 
    alt: "Mid Layer Clouds", 
    opacity: 0.3, 
    speed: 0.4, 
    zIndex: 46,
    scale: 0.7,
    position: { bottom: "20%", right: "20%" }
  },
];

export default function ForegroundClouds() {
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
      
      const layer = foregroundCloudLayers[index];
      
      // Set initial positions with hardware acceleration
      gsap.set(cloud, { 
        scale: layer.scale,
        opacity: layer.opacity,
        x: 0,
        y: 0,
        rotation: gsap.utils.random(-2, 2),
        force3D: true,
        transformOrigin: "center center"
      });
      
      // Create floating animations
      const isReverse = index % 2 === 1;
      gsap.to(cloud, {
        x: isReverse ? -30 : 30,
        y: gsap.utils.random(-20, 20),
        rotation: gsap.utils.random(-1, 1),
        scale: layer.scale + gsap.utils.random(-0.1, 0.1),
        duration: 25 + (index * 3),
        ease: "none",
        repeat: -1,
        yoyo: true,
        force3D: true,
        delay: index * 0.1,
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
          
          const layer = foregroundCloudLayers[index];
          let xMovement, yMovement;
          
          if (layer.alt.includes('High')) {
            xMovement = xPercent * 8;
            yMovement = yPercent * 5;
          } else {
            xMovement = xPercent * 5;
            yMovement = yPercent * 3;
          }
          
          mouseAnimationRef.current?.to(cloud, {
            x: `+=${xMovement}`,
            y: `+=${yMovement}`,
            duration: 2,
            ease: "power1.out",
            overwrite: "auto",
            force3D: true
          }, 0);
        });
      }, 16);
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
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
    >      
      {foregroundCloudLayers.map((layer, index) => (
        <div
          key={`foreground-cloud-${index}`}
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
          className="absolute overflow-hidden"
          style={{ 
            zIndex: layer.zIndex,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            ...layer.position,
            width: '100%',
            height: '100%',
          }}
        >
          <Image
            src={layer.src}
            alt={layer.alt}
            fill
            className="h-full w-full object-cover"
            style={{ 
              opacity: layer.opacity,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              mixBlendMode: 'normal',
            }}
            priority
          />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { usePathname } from 'next/navigation';

interface SeamlessCloudTransitionProps {
  onComplete?: () => void;
  fromHeroSection?: boolean;
}

interface CloudLayer {
  src: string;
  alt: string;
  opacity: number;
  zIndex: number;
  heroPosition: { x: number; y: number; scale: number };
  transitionPosition: { x: number; y: number; scale: number };
}

export default function SeamlessCloudTransition({ 
  onComplete,
  fromHeroSection = false
}: SeamlessCloudTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
 
  // Using exact same cloud layers as HeroSection ForegroundClouds for perfect continuity
  const cloudLayers: CloudLayer[] = [
    { 
      src: "/clouds/lowCloud3.png", 
      alt: "Foreground Low Clouds", 
      opacity: 0.9, 
      zIndex: 10,
      heroPosition: { x: 350, y: 200, scale: 2 },
      transitionPosition: { x: 20, y: 180, scale: 2.5 }
    },
    { 
      src: "/clouds/lowCloud1.png", 
      alt: "Foreground Low Clouds", 
      opacity: 0.5, 
      zIndex: 10,
      heroPosition: { x: 300, y: 200, scale: 1.5 },
      transitionPosition: { x: 20, y: 180, scale: 1.2 }
    },
    { 
      src: "/clouds/highCloud2.png", 
      alt: "Foreground High Clouds", 
      opacity: 0.8, 
      zIndex: 15,
      heroPosition: { x: 200, y: 100, scale: 2 },
      transitionPosition: { x: -100, y: 100, scale: 2 }
    },
    { 
      src: "/clouds/highCloud1.png", 
      alt: "Top Layer High Clouds", 
      opacity: 1, 
      zIndex: 25,
      heroPosition: { x: 100, y: -70, scale: 2 },
      transitionPosition: { x: -200, y: -100, scale: 2 }
    },
  ];

  // Trigger transition when navigating from home page
  useEffect(() => {
    if (fromHeroSection && pathname !== '/') {
      setIsActive(true);
      performSeamlessTransition();
    }
  }, [pathname, fromHeroSection]);

  const performSeamlessTransition = () => {
    if (!containerRef.current) return;

    const clouds = cloudRefs.current.filter(Boolean);
    const tl = gsap.timeline();

    // Set initial positions to match HeroSection ForegroundClouds exactly
    clouds.forEach((cloud, index) => {
      const layer = cloudLayers[index];
      gsap.set(cloud, {
        x: layer.heroPosition.x,
        y: layer.heroPosition.y,
        scale: layer.heroPosition.scale,
        opacity: layer.opacity,
        rotation: 0
      });
    });

    // Animate to transition positions smoothly
    clouds.forEach((cloud, index) => {
      const layer = cloudLayers[index];
      
      tl.to(cloud, {
        x: layer.transitionPosition.x,
        y: layer.transitionPosition.y,
        scale: layer.transitionPosition.scale,
        duration: 1.5,
        ease: "power2.inOut",
      }, index * 0.1);
    });

    // Start continuous floating animation after transition
    tl.call(() => {
      clouds.forEach((cloud, index) => {
        if (index === 0) {
          gsap.to(cloud, {
            x: 20,
            y: 180,
            rotation: 0,
            scale: 2.5,
            duration: 20,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          });
        }
        else if (index === 1) {
          gsap.to(cloud, {
            x: 20,
            y: 180,
            rotation: 0,
            scale: 1.2,
            duration: 20,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true
          });
        }
        else if (index === 2) {
          gsap.to(cloud, {
            x: -100,
            duration: 20,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          });
        }
        else if (index === 3) {
          gsap.to(cloud, {
            x: -200,
            y: -100,
            duration: 20,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true
          });
        }
      });

      // Add mouse interaction
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;
        
        clouds.forEach((cloud, index) => {
          if (!cloud) return;
          
          const layer = cloudLayers[index];
          let xMovement, yMovement;
          
          if (layer.alt.includes('High')) {
            xMovement = xPercent * 20;
            yMovement = yPercent * 12;
          } else {
            xMovement = xPercent * 15;
            yMovement = yPercent * 8;
          }
          
          gsap.to(cloud, {
            x: `+=${xMovement}`,
            y: `+=${yMovement}`,
            duration: 1.2,
            ease: "power2.out",
            overwrite: false,
          });
        });
      };

      if (typeof window !== "undefined") {
        window.addEventListener("mousemove", handleMouseMove);
      }
      
      if (onComplete) onComplete();
    });
  };

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-[9999] pointer-events-none overflow-hidden"
    >
      {/* Background Image - same as HeroSection */}
      <Image
        src="/clouds/bg.png"
        alt="Background"
        fill
        priority
        className="absolute inset-0 -z-30 h-full w-full object-cover"
      />
      
      {cloudLayers.map((cloud, index) => (
        <div
          key={`${cloud.src}-${index}`}
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: cloud.zIndex }}
        >
          <Image
            src={cloud.src}
            alt={cloud.alt}
            fill
            className="object-cover"
            priority
          />
        </div>
      ))}
    </div>
  );
}

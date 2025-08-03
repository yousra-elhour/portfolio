"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface SimplePersistentCloudsProps {
  show: boolean;
}

export default function SimplePersistentClouds({ show }: SimplePersistentCloudsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);

  const clouds = [
    { src: "/clouds/low-clouds1.png" },
    { src: "/clouds/high-clouds1.png" },
    { src: "/clouds/low-clouds2.png" },
  ];

  useEffect(() => {
    console.log('🧪 SimplePersistentClouds effect triggered, show:', show);
    
    if (!containerRef.current) {
      console.log('🧪 No container ref');
      return;
    }

    const container = containerRef.current;
    const cloudElements = cloudRefs.current.filter(Boolean);

    if (show) {
      console.log('🧪 Showing clouds, count:', cloudElements.length);
      
      // Make container visible
      gsap.set(container, { opacity: 1, zIndex: 10 });
      
      cloudElements.forEach((cloud, index) => {
        if (!cloud) return;
        
        console.log(`🧪 Setting up cloud ${index + 1}`);
        
        // Set initial position and opacity
        gsap.set(cloud, {
          opacity: 0.6,
          scale: 1.5,
          x: gsap.utils.random(-100, 100),
          y: gsap.utils.random(-50, 50),
        });

        // Add floating animation that should persist
        gsap.to(cloud, {
          x: `+=${gsap.utils.random(-30, 30)}`,
          y: `+=${gsap.utils.random(-20, 20)}`,
          rotation: gsap.utils.random(-5, 5),
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
      
      console.log('🧪 Clouds setup complete');
    } else {
      console.log('🧪 Hiding clouds');
      gsap.set(container, { opacity: 0 });
    }

    // Cleanup function
    return () => {
      console.log('🧪 Cleanup called, show was:', show);
      if (!show) {
        gsap.killTweensOf(cloudElements);
      }
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-[10] pointer-events-none overflow-hidden"
      style={{ opacity: 0 }}
    >
      <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-sm z-20">
        Simple Clouds Test: {show ? 'SHOWING' : 'HIDDEN'}
      </div>
      
      {clouds.map((cloud, index) => (
        <div
          key={`simple-cloud-${index}`}
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
          className="absolute w-96 h-96"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Image
            src={cloud.src}
            alt={`Simple Cloud ${index + 1}`}
            fill
            className="object-contain"
            style={{ opacity: 0.7 }}
            priority
          />
        </div>
      ))}
    </div>
  );
}

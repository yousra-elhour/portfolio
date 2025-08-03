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

const foregroundCloudLayers: CloudLayer[] = [
  { src: "/clouds/lowCloud3.png", alt: "Foreground Low Clouds", opacity: 0.9, speed: 0.5, zIndex: 10 },
  { src: "/clouds/lowCloud1.png", alt: "Foreground Low Clouds", opacity: 0.5, speed: 0.5, zIndex: 10 },
  { src: "/clouds/highCloud2.png", alt: "Foreground High Clouds", opacity: 0.8, speed: 1.2, zIndex: 15 },
  { src: "/clouds/highCloud1.png", alt: "Top Layer High Clouds", opacity: 1, speed: 1.5, zIndex: 25 },
];

export default function ForegroundClouds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const clouds = cloudRefs.current;
    
    clouds.forEach((cloud, index) => {
      if (!cloud) return;
      
      const layer = foregroundCloudLayers[index];
      
      // Individual control for each cloud layer
      if (index === 0) {
        // First cloud layer (low-clouds3.png)
        gsap.set(cloud, { 
          scale: 2,
          opacity: layer.opacity,
          x: 0,  // Custom X position
          y: 180   // Custom Y position
        });
        
        gsap.to(cloud, {
          x: 50,    // Where it moves to
          y: 80,     // Where it moves to
          rotation: 0,
          scale: 2.5,
          duration: 10,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      }
      
      else if (index === 1) {
        // Second cloud layer (low-cloud1.png)
        gsap.set(cloud, { 
         scale: 1.5,
          opacity: layer.opacity,
          x: 200,// Custom X position
          y: 200    // Custom Y position
        });
        
        gsap.to(cloud, {
          x: 20,     // Where it moves to
          y: 100,      // Where it moves to
          rotation: 0,
          scale: 1.2,
          duration: 25,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true
        });
      }
      
      else if (index === 2) {
        // Third cloud layer (high-cloud2.png)
        gsap.set(cloud, { 
          scale: 2,
          opacity: layer.opacity,
          x: 200,     // Custom X position
          y: 150    // Custom Y position
        });
        
        gsap.to(cloud, {
          x: -100,     // Where it moves to
          duration: 12,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      }
      
      else if (index === 3) {
        // Fourth cloud layer (high-clouds1.png)
        gsap.set(cloud, { 
          scale: 2,
          opacity: layer.opacity,
          x: 100,  // Custom X position
          y: -70     // Custom Y position
        });
        
        gsap.to(cloud, {
          x: -200,     // Where it moves to
          y: -100,     // Where it moves to
          duration: 20,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true
        });
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * 2;
      const yPercent = (clientY / innerHeight - 0.5) * 2;
      
      clouds.forEach((cloud, index) => {
        if (!cloud) return;
        
        const layer = foregroundCloudLayers[index];
        let xMovement, yMovement;
        
        if (layer.alt.includes('High')) {
          xMovement = xPercent * 20; // Reduced from 35 for more subtle movement
          yMovement = yPercent * 12; // Reduced from 20
        } else {
          xMovement = xPercent * 15; // Reduced from 18
          yMovement = yPercent * 8;  // Reduced from 12
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

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full z-[100] pointer-events-none">      
      {foregroundCloudLayers.map((layer, index) => (
        <div
          key={layer.src}
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
          className="absolute inset-0 h-full w-full overflow-hidden"
          style={{ 
            zIndex: layer.zIndex,
            // backgroundColor: index === 0 ? 'rgba(255,0,0,0.1)' : 
            //                index === 1 ? 'rgba(0,255,0,0.1)' : 
            //                index === 2 ? 'rgba(0,0,255,0.1)' : 
            //                'rgba(255,255,0,0.1)' // Yellow for the 4th layer
          }}
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

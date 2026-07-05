"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { optimizedImageUrl } from "../utils/preload";

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if all images are loaded
  useEffect(() => {
    if (!isClient) return;
    
    const checkImagesLoaded = () => {
      const allImages = [
        '/clouds/bg.png',
        ...cloudLayers.map(layer => layer.src)
      ];

      const imageLoadPromises = allImages.map(src => {
        return new Promise<boolean>((resolve) => {
          const img = document.createElement('img');
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true); // Continue even if some images fail
          // Probe the optimized URL the rendered <Image> actually uses —
          // probing the raw PNGs re-downloaded ~5.8MB that nothing displays.
          img.src = optimizedImageUrl(src);

          // If image is already cached/loaded
          if (img.complete && img.naturalHeight > 0) {
            resolve(true);
          }
        });
      });

      Promise.all(imageLoadPromises).then(() => {
        // Add a small delay to ensure everything is truly ready
        setTimeout(() => {
          setImagesLoaded(true);
        }, 100);
      });
    };

    checkImagesLoaded();
  }, [isClient]);

  useEffect(() => {
    if (!containerRef.current || !imagesLoaded || !isClient) return;

    const clouds = cloudRefs.current;
    
    // Kill any existing animations to prevent conflicts
    clouds.forEach(cloud => {
      if (cloud) gsap.killTweensOf(cloud);
    });

    // Set initial state - position clouds properly from the start
    clouds.forEach((cloud, index) => {
      if (!cloud) return;
      
      const layer = cloudLayers[index];
      
      // Set initial scale and opacity with hardware acceleration
      gsap.set(cloud, { 
        scale: 1.1,
        opacity: 0, // Start invisible to prevent flash
        x: 0,
        y: 0,
        rotation: 0,
        force3D: true
      });
    });

    // Wait a bit for images to be ready, then animate in
    const initTimer = setTimeout(() => {
      clouds.forEach((cloud, index) => {
        if (!cloud) return;
        
        const layer = cloudLayers[index];
        const isReverse = index % 2 === 1;
        
        // Animate the image opacity inside
        const imageEl = cloud.querySelector('img');
        if (imageEl) {
          gsap.to(imageEl, {
            opacity: layer.opacity,
            duration: 0.8,
            ease: "power2.out",
            delay: index * 0.1,
          });
        }
        
        // Start the floating animation
        gsap.to(cloud, {
          x: isReverse ? -80 : 80,
          y: gsap.utils.random(-30, 30),
          rotation: gsap.utils.random(-1, 1),
          scale: gsap.utils.random(1.05, 1.15),
          duration: 25 + (index * 3),
          ease: "none",
          repeat: -1,
          yoyo: true,
          force3D: true,
          delay: 0.5 + (index * 0.1), // Delay start of movement
        });
      });
      
      setIsInitialized(true);
    }, 300); // Slightly longer delay to ensure images are loaded

    // Simplified mouse parallax effect with throttling
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isInitialized) return; // Don't apply mouse effects until initialized
      
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
            xMovement = xPercent * 8;
            yMovement = yPercent * 5;
          } else {
            xMovement = xPercent * 5;
            yMovement = yPercent * 3;
          }
          
          gsap.to(cloud, {
            x: `+=${xMovement}`,
            y: `+=${yMovement}`,
            duration: 2,
            ease: "power1.out",
            overwrite: "auto",
            force3D: true
          });
        });
      }, 16);
    };

    // Add mouse interactions
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      clearTimeout(mouseTimeout);
      clouds.forEach(cloud => {
        if (cloud) gsap.killTweensOf(cloud);
      });
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [imagesLoaded, isInitialized, isClient]);

  // Don't render anything until we're on the client side
  if (!isClient) {
    return (
      <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: '#1f2937' }} />
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 w-full h-full clouds-container ${(isInitialized && imagesLoaded) ? 'initialized' : ''}`}
    >
      {/* Main Background */}
      <div 
        className="absolute inset-0 -z-20 h-full w-full bg-background-image"
        style={{ backgroundColor: '#1f2937' }} // Always show background color
      >
        <Image
          src="/clouds/bg.png"
          alt="Sky Background"
          fill
          priority
          className="h-full w-full object-cover bg-image"
          style={{ 
            opacity: 1, // Always show background image
            transform: 'translateZ(0)', // Force hardware acceleration
            backfaceVisibility: 'hidden', // Prevent flickering
          }}
        />
      </div>
      
      {/* Background Cloud Layers (behind text) */}
      {cloudLayers.map((layer, index) => (
        <div
          key={`${layer.src}-bg-${index}`} // More stable key
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
          className="absolute inset-0 h-full w-full overflow-hidden cloud-layer"
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
              opacity: 0, // Start hidden, GSAP will animate to correct opacity
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

"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface PageTransitionProps {
  children: React.ReactNode;
}

interface CloudLayer {
  src: string;
  alt: string;
  opacity: number;
  speed: number;
  zIndex: number;
}

// Using the same clouds as HeroSection ForegroundClouds, with duplicates for better coverage
const cloudLayers: CloudLayer[] = [
  // Original clouds
  { src: "/clouds/lowCloud3.png", alt: "Foreground Low Clouds", opacity: 0.9, speed: 0.5, zIndex: 9999 },
  { src: "/clouds/lowCloud1.png", alt: "Foreground Low Clouds", opacity: 0.5, speed: 0.5, zIndex: 9998 },
  { src: "/clouds/highCloud2.png", alt: "Foreground High Clouds", opacity: 0.8, speed: 1.2, zIndex: 9997 },
  { src: "/clouds/highCloud1.png", alt: "Top Layer High Clouds", opacity: 1, speed: 1.5, zIndex: 9996 },
  
  // Duplicate clouds for better coverage
  { src: "/clouds/lowCloud3.png", alt: "Duplicate Foreground Low Clouds", opacity: 0.7, speed: 0.5, zIndex: 9995 },
  { src: "/clouds/lowCloud1.png", alt: "Duplicate Foreground Low Clouds", opacity: 0.4, speed: 0.5, zIndex: 9994 },
  { src: "/clouds/highCloud2.png", alt: "Duplicate Foreground High Clouds", opacity: 0.6, speed: 1.2, zIndex: 9993 },
  { src: "/clouds/highCloud1.png", alt: "Duplicate Top Layer High Clouds", opacity: 0.8, speed: 1.5, zIndex: 9992 },
];

// Global state to capture DOM snapshot before navigation
let globalPreviousHTML: string = '';
let globalPreviousPath: string = '';

// Helper function to determine if clouds should be shown
const shouldShowClouds = (fromPath: string, toPath: string): boolean => {
  return fromPath === '/' && (toPath === '/works' || toPath === '/about' || toPath === '/contact');
};

// Helper function to determine if we should show project transition
const shouldShowProjectTransition = (fromPath: string, toPath: string): boolean => {
  return fromPath === '/works' && toPath.startsWith('/works/');
};

// Helper function to determine if we should show home transition (simple transition, no clouds)
const shouldShowHomeTransition = (fromPath: string, toPath: string): boolean => {
  return toPath === '/' && (fromPath === '/works' || fromPath === '/about' || fromPath === '/contact' || fromPath.startsWith('/works/'));
};

// Global function type declaration
declare global {
  interface Window {
    captureCurrentPageForTransition?: () => void;
  }
}

export default function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const newPageRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);
  const projectOverlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedContent, setDisplayedContent] = useState<React.ReactNode>(children);
  const [showClouds, setShowClouds] = useState(false);
  const [showProjectTransition, setShowProjectTransition] = useState(false);
  const [showHomeTransition, setShowHomeTransition] = useState(false);

  // Clouds animation setup
  useEffect(() => {
    if (!containerRef.current || !showClouds) return;

    const clouds = cloudRefs.current;
    
    // Delay the continuous animation to allow entrance animation to complete
    const setupContinuousAnimation = () => {
      clouds.forEach((cloud, index) => {
        if (!cloud) return;
        
        const layer = cloudLayers[index];
        const isOriginal = index < 4; // First 4 are originals, rest are duplicates
        const baseIndex = index % 4; // Get base cloud type (0-3)
        
        // Position duplicates differently for better coverage
        const offsetMultiplier = isOriginal ? 1 : -1;
        const scaleMultiplier = isOriginal ? 1 : 0.8;
        
        // Individual control for each cloud layer - START FROM CURRENT POSITION (no gsap.set)
        if (baseIndex === 0) {
          // First cloud layer (lowCloud3.png) - animate from where entrance left off
          gsap.to(cloud, {
            x: 20 + (offsetMultiplier * 150),
            y: 180 + (offsetMultiplier * 40),
            rotation: 0,
            scale: 2.5 * scaleMultiplier,
            duration: 20,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          });
        }
        else if (baseIndex === 1) {
          // Second cloud layer (lowCloud1.png) - animate from where entrance left off
          gsap.to(cloud, {
            x: 20 + (offsetMultiplier * 120),
            y: 180 + (offsetMultiplier * 50),
            rotation: 0,
            scale: 1.2 * scaleMultiplier,
            duration: 20,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true
          });
        }
        else if (baseIndex === 2) {
          // Third cloud layer (highCloud2.png) - animate from where entrance left off
          gsap.to(cloud, {
            x: -100 + (offsetMultiplier * 100),
            duration: 20,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          });
        }
        else if (baseIndex === 3) {
          // Fourth cloud layer (highCloud1.png) - animate from where entrance left off
          gsap.to(cloud, {
            x: -200 + (offsetMultiplier * 80),
            y: -100 + (offsetMultiplier * 40),
            duration: 20,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true
          });
        }
      });
    };

    // Start continuous animation after entrance animation
    const timeoutId = setTimeout(() => {
      setupContinuousAnimation();
    }, 1500);

    // Smart mouse parallax effect (matching ForegroundClouds exactly)
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * 2;
      const yPercent = (clientY / innerHeight - 0.5) * 2;
      
      clouds.forEach((cloud, index) => {
        if (!cloud) return;
        
        const layer = cloudLayers[index];
        const isOriginal = index < 4;
        const baseIndex = index % 4;
        
        // Get the original cloud type for movement calculation
        const originalLayer = cloudLayers[baseIndex];
        let xMovement, yMovement;
        
        if (originalLayer.alt.includes('High')) {
          xMovement = xPercent * (isOriginal ? 20 : 15); // Slightly different movement for duplicates
          yMovement = yPercent * (isOriginal ? 12 : 9);
        } else {
          xMovement = xPercent * (isOriginal ? 15 : 12);
          yMovement = yPercent * (isOriginal ? 8 : 6);
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

    // Add mouse interactions
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [showClouds]);

  useEffect(() => {
    // If this is a navigation (not initial load)
    if (globalPreviousPath && globalPreviousPath !== pathname) {
      // Check if we should show clouds for this transition
      const shouldShow = shouldShowClouds(globalPreviousPath, pathname);
      const shouldShowProject = shouldShowProjectTransition(globalPreviousPath, pathname);
      const shouldShowHome = shouldShowHomeTransition(globalPreviousPath, pathname);
      
      setShowClouds(shouldShow);
      setShowProjectTransition(shouldShowProject);
      setShowHomeTransition(shouldShowHome);
      
      if (shouldShow || shouldShowProject || shouldShowHome) {
        // CRITICAL FIX: Update content IMMEDIATELY before transition
        setDisplayedContent(children);
        setIsTransitioning(true);
      } else {
        // For non-transition navigations, just update content normally
        setDisplayedContent(children);
      }
    } else {
      // For initial load, don't show transitions
      setShowClouds(false);
      setShowProjectTransition(false);
      setShowHomeTransition(false);
      setDisplayedContent(children);
    }
    
    // After handling transition, update global state for next navigation
    setTimeout(() => {
      if (contentWrapperRef.current) {
        globalPreviousHTML = contentWrapperRef.current.innerHTML;
        globalPreviousPath = pathname;
      }
    }, 100);
    
  }, [pathname, children]);

  // Set up global capture function
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.captureCurrentPageForTransition = () => {
        if (contentWrapperRef.current) {
          globalPreviousHTML = contentWrapperRef.current.innerHTML;
          globalPreviousPath = pathname;
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.captureCurrentPageForTransition = undefined;
      }
    };
  }, [pathname]);

  useEffect(() => {
    // Handle transition animations
    if (isTransitioning) {
      if (showClouds && containerRef.current) {
        // Animate clouds and content entrance
        const clouds = cloudRefs.current;
        const contentWrapper = contentWrapperRef.current;
        
        // Set initial states to match HeroSection ForegroundClouds positions exactly
        clouds.forEach((cloud, index) => {
          const isOriginal = index < 4;
          const baseIndex = index % 4;
          const offsetMultiplier = isOriginal ? 1 : -1;
          const scaleMultiplier = isOriginal ? 1 : 0.8;
          
          if (baseIndex === 0) {
            // Start from exact HeroSection position for lowCloud3
            gsap.set(cloud, { 
              x: 350 + (offsetMultiplier * 100), 
              y: -600, // Start off-screen for diving effect
              scale: 6 * scaleMultiplier, 
              opacity: cloudLayers[index].opacity 
            });
          } else if (baseIndex === 1) {
            // Start from exact HeroSection position for lowCloud1  
            gsap.set(cloud, { 
              x: 300 + (offsetMultiplier * 120), 
              y: -650, 
              scale: 5 * scaleMultiplier, 
              opacity: cloudLayers[index].opacity 
            });
          } else if (baseIndex === 2) {
            // Start from exact HeroSection position for highCloud2
            gsap.set(cloud, { 
              x: 200 + (offsetMultiplier * 140), 
              y: -700, 
              scale: 4 * scaleMultiplier, 
              opacity: cloudLayers[index].opacity 
            });
          } else if (baseIndex === 3) {
            // Start from exact HeroSection position for highCloud1
            gsap.set(cloud, { 
              x: 100 + (offsetMultiplier * 160), 
              y: -750, 
              scale: 3.5 * scaleMultiplier, 
              opacity: cloudLayers[index].opacity 
            });
          }
        });
        
        gsap.set(contentWrapper, { opacity: 0, y: 0 });
        
        // Create entrance timeline with staggered cloud animations
        const entranceTl = gsap.timeline();
        
        // Animate clouds flowing downward to cover the screen (diving effect)
        clouds.forEach((cloud, index) => {
          const layer = cloudLayers[index];
          const isOriginal = index < 4;
          const baseIndex = index % 4;
          const offsetMultiplier = isOriginal ? 1 : -1;
         
          
          // Stagger timing for natural flow
          const delay = (baseIndex * 0.08) + (isOriginal ? 0 : 0.04);
          
          if (baseIndex === 0) {
            // Lower cloud flows down to cover screen
            entranceTl.to(cloud, {    
              y: 350 + (offsetMultiplier * 50),
              opacity: layer.opacity,
              duration: 1.8,
              ease: "power2.out",
            }, delay);
          } else if (baseIndex === 1) {
            // Another lower cloud flows down
            entranceTl.to(cloud, { 
              y: 120 + (offsetMultiplier * 60),
              opacity: layer.opacity,
              duration: 1.8,
              ease: "power2.out",
            }, delay);
          } else if (baseIndex === 2) {
            // High cloud flows down
            entranceTl.to(cloud, { 
              y: -10 + (offsetMultiplier * 40),    
              x: -50 + (offsetMultiplier * 20),      
              opacity: layer.opacity,
              duration: 1.8,
              ease: "power2.out",
            }, delay);
          } else if (baseIndex === 3) {
            // Top layer high cloud flows down
            entranceTl.to(cloud, { 
              y: 320 + (offsetMultiplier * 30),       
              opacity: layer.opacity,
              duration: 1.8,
              ease: "power2.out",
            }, delay);
          }
        });
        
        // Then animate content with a "emerging from clouds" effect
        entranceTl.to(contentWrapper, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          onComplete: () => {
            setIsTransitioning(false);
          }
        }, "-=1.0"); // Start content fade-in earlier for better diving effect
        
      } else if (showProjectTransition && containerRef.current) {
        // Project transition: Cloud parting effect
        const contentWrapper = contentWrapperRef.current;
        const overlay = projectOverlayRef.current;
        
        if (contentWrapper && overlay) {
          // Set initial states
          gsap.set(contentWrapper, { opacity: 0, scale: 0.9, y: 30 });
          gsap.set(overlay, { 
            opacity: 1,
            background: "radial-gradient(circle at center, rgba(135, 206, 235, 0.8) 0%, rgba(255, 255, 255, 0.9) 40%, rgba(240, 248, 255, 1) 100%)"
          });
          
          // Create project entrance timeline
          const projectTl = gsap.timeline();
          
          // Cloud parting effect - overlay fades and "parts" outward
          projectTl.to(overlay, {
            opacity: 0,
            scale: 1.2,
            duration: 1.0,
            ease: "power2.out"
          }, 0);
          
          // Content emerges from behind the "parting clouds"
          projectTl.to(contentWrapper, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.2,
            ease: "back.out(1.2)",
            onComplete: () => {
              setIsTransitioning(false);
            }
          }, 0.3);
        }
      } else if (showHomeTransition && containerRef.current) {
        // Simple home transition: Clean fade effect without clouds
        const contentWrapper = contentWrapperRef.current;
        
        if (contentWrapper) {
          // Set initial state
          gsap.set(contentWrapper, { opacity: 0, y: 20 });
          
          // Create simple fade-in timeline
          const homeTl = gsap.timeline();
          
          // Simple fade in with slight upward movement
          homeTl.to(contentWrapper, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              setIsTransitioning(false);
            }
          });
        }
      }
    }
  }, [isTransitioning, showClouds, showProjectTransition, showHomeTransition]);

  return (
    <div ref={containerRef} className="relative overflow-hidden min-h-screen">
      {/* Background Cloud Animation Layer - Only show for non-home transitions */}
      {showClouds && (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Main Background - same as HeroSection */}
          <Image
            src="/clouds/bg.png"
            alt="Sky Background"
            fill
            priority
            className="absolute inset-0 h-full w-full object-cover"
            style={{ zIndex: -10 }}
          />
          
          {/* Background Cloud Layers */}
          {cloudLayers.map((layer, index) => (
            <div
              key={`${layer.src}-${index}`}
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
                priority
              />
            </div>
          ))}
          
          {/* Gradient overlay for smooth transitions */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none"
            style={{ zIndex: 6 }}
          />
        </div>
      )}

      {/* Project Transition Overlay - Cloud parting effect */}
      {showProjectTransition && (
        <div 
          ref={projectOverlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 15 }}
        />
      )}

      {/* Page Content */}
      <div ref={newPageRef} className="relative w-full h-full" style={{ zIndex: 20 }}>
        <div ref={contentWrapperRef}>
          {displayedContent}
        </div>
      </div>
    </div>
  );
}

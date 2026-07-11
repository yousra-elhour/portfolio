"use client";

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// The transition decision must hide the incoming page BEFORE the browser
// paints it, or every navigation flashes one full-visibility frame.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
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

// Restored all cloud layers for transitions with anti-flickering optimizations
const cloudLayers: CloudLayer[] = [
  // Original clouds with optimized opacity values
  { src: "/clouds/lowCloud3.png", alt: "Foreground Low Clouds", opacity: 0.8, speed: 0.9, zIndex: 100000 },
  { src: "/clouds/lowCloud1.png", alt: "Foreground Low Clouds", opacity: 0.5, speed: 0.5, zIndex: 9997 },
  { src: "/clouds/highCloud2.png", alt: "Foreground High Clouds", opacity: 0.7, speed: 1.2, zIndex: 9997 },
  { src: "/clouds/highCloud1.png", alt: "Top Layer High Clouds", opacity: 0.9, speed: 1.5, zIndex: 9996 },
  
  // Duplicate clouds for better coverage with reduced opacity
  { src: "/clouds/lowCloud3.png", alt: "Duplicate Foreground Low Clouds", opacity: 0.6, speed: 0.5, zIndex: 9995 },
  { src: "/clouds/lowCloud1.png", alt: "Duplicate Foreground Low Clouds", opacity: 0.4, speed: 0.5, zIndex: 9994 },
  { src: "/clouds/highCloud2.png", alt: "Duplicate Foreground High Clouds", opacity: 0.5, speed: 1.2, zIndex: 9993 },
  { src: "/clouds/highCloud1.png", alt: "Duplicate Top Layer High Clouds", opacity: 0.7, speed: 1.5, zIndex: 9992 },
];

// Global state to track the previous route for transition decisions.
// (This used to also snapshot the page via innerHTML on every click/scroll
// and a 500ms interval — serializing the whole DOM constantly was a major
// source of main-thread jank, and the snapshot was never read anywhere.)
let globalPreviousPath: string = '';

// Helper function to determine if clouds should be shown
const shouldShowClouds = (fromPath: string, toPath: string): boolean => {
  return fromPath === '/' && (toPath === '/works' || toPath === '/about' || toPath === '/contact');
};

// Helper function to determine if we should show project transition
const shouldShowProjectTransition = (fromPath: string, toPath: string): boolean => {
  return fromPath === '/works' && toPath.startsWith('/works/');
};

// Helper function to determine if we should show project back transition (going back from project to works)
const shouldShowProjectBackTransition = (fromPath: string, toPath: string): boolean => {
  return fromPath.startsWith('/works/') && toPath === '/works';
};

// Helper function to determine if we should show home transition (simple transition, no clouds)
const shouldShowHomeTransition = (fromPath: string, toPath: string): boolean => {
  return toPath === '/' && (fromPath === '/works' || fromPath === '/about' || fromPath === '/contact' || fromPath.startsWith('/works/'));
};

// Staging (above the viewport) and covering positions for the transition
// cloud layers — shared by the pre-navigation cover sweep and the arrival
// entrance so both use the exact same choreography.
const cloudStageProps = (index: number) => {
  const isOriginal = index < 4;
  const baseIndex = index % 4;
  const offsetMultiplier = isOriginal ? 1 : -1;
  const scaleMultiplier = isOriginal ? 1 : 0.8;
  switch (baseIndex) {
    case 0:
      return { x: 350 + offsetMultiplier * 100, y: -600, scale: 6 * scaleMultiplier };
    case 1:
      return { x: 300 + offsetMultiplier * 120, y: -650, scale: 5 * scaleMultiplier };
    case 2:
      return { x: 200 + offsetMultiplier * 140, y: -700, scale: 4 * scaleMultiplier };
    default:
      return { x: 100 + offsetMultiplier * 160, y: -750, scale: 3.5 * scaleMultiplier };
  }
};

const cloudCoverProps = (index: number): { x?: number; y: number } => {
  const isOriginal = index < 4;
  const baseIndex = index % 4;
  const offsetMultiplier = isOriginal ? 1 : -1;
  switch (baseIndex) {
    case 0:
      return { x: 20 + offsetMultiplier * 150, y: 350 + offsetMultiplier * 50 };
    case 1:
      return { y: 120 + offsetMultiplier * 60 };
    case 2:
      return { x: -50 + offsetMultiplier * 20, y: -10 + offsetMultiplier * 40 };
    default:
      return { y: 320 + offsetMultiplier * 30 };
  }
};

// Dusk-tinted bloom for the universal transition — the old white-blue
// radial read as a harsh flash against the site's palette.
const DUSK_GRADIENT =
  "radial-gradient(circle at center, rgba(164, 156, 196, 0.92) 0%, rgba(205, 175, 178, 0.94) 45%, rgba(232, 213, 210, 0.97) 100%)";

// Global function type declaration
declare global {
  interface Window {
    captureCurrentPageForTransition?: () => void;
    /** cover the current page, then run the navigation behind the cover */
    beginPageCover?: (href: string, navigate: () => void) => void;
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
  const [showProjectBackTransition, setShowProjectBackTransition] = useState(false);
  const [showHomeTransition, setShowHomeTransition] = useState(false);
  // Cover-first navigation: links fade a dusk bloom IN over the outgoing
  // page, and only then push the route — so the swap happens behind an
  // opaque cover instead of hard-cutting (which read as a flash).
  const [isCovering, setIsCovering] = useState(false);
  const coveringRef = useRef(false);
  const cloudsActiveRef = useRef(false); // transition layers currently on screen
  const pendingNavRef = useRef<(() => void) | null>(null);
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]); // Track all timeouts
  const animationTimelinesRef = useRef<gsap.core.Timeline[]>([]); // Track all timelines
  const isInitializedRef = useRef(false); // Track if component is initialized
  const currentPathnameRef = useRef(pathname); // Track current pathname to prevent double execution

  // The wash overlay must be covering before its first paint — mounting it
  // empty and snapping it to full opacity in a post-paint effect flashed
  // one bright frame on works <-> project navigations.
  useIsomorphicLayoutEffect(() => {
    if (
      (showProjectTransition || showProjectBackTransition) &&
      projectOverlayRef.current
    ) {
      gsap.set(projectOverlayRef.current, {
        opacity: 1,
        scale: 1,
        background: DUSK_GRADIENT,
        force3D: true,
      });
    }
  }, [showProjectTransition, showProjectBackTransition]);

  // Clouds animation setup - restored full functionality with anti-flickering
  useEffect(() => {
    if (!containerRef.current || !showClouds) return;

    const clouds = cloudRefs.current;
    
    // Kill any existing animations to prevent conflicts
    clouds.forEach(cloud => {
      if (cloud) gsap.killTweensOf(cloud);
    });
    
    // Restored full continuous animation with optimizations
    const setupContinuousAnimation = () => {
      clouds.forEach((cloud, index) => {
        if (!cloud) return;
        
        const layer = cloudLayers[index];
        const isOriginal = index < 4; // First 4 are originals, rest are duplicates
        const baseIndex = index % 4; // Get base cloud type (0-3)
        
        // Position duplicates differently for better coverage
        const offsetMultiplier = isOriginal ? 1 : -1;
        const scaleMultiplier = isOriginal ? 1 : 0.8;
        
        // Individual control for each cloud layer with hardware acceleration
        if (baseIndex === 0) {
          // First cloud layer (lowCloud3.png) - animate from where entrance left off
          gsap.to(cloud, {
            x: 280 + (offsetMultiplier * 150),
            y: 180 + (offsetMultiplier * 40),
            rotation: 0,
            scale: 2.5 * scaleMultiplier,
            duration: 25, // Slower for stability
            ease: "none", // Linear ease to prevent stuttering
            repeat: -1,
            yoyo: true,
            force3D: true // Hardware acceleration
          });
        }
        else if (baseIndex === 1) {
          // Second cloud layer (lowCloud1.png) - animate from where entrance left off
          gsap.to(cloud, {
            x: 20 + (offsetMultiplier * 120),
            y: 180 + (offsetMultiplier * 50),
            rotation: 0,
            scale: 1.2 * scaleMultiplier,
            duration: 25,
            ease: "none",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
        else if (baseIndex === 2) {
          // Third cloud layer (highCloud2.png) - animate from where entrance left off
          gsap.to(cloud, {
            x: -100 + (offsetMultiplier * 100),
            duration: 25,
            ease: "none",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
        else if (baseIndex === 3) {
          // Fourth cloud layer (highCloud1.png) - animate from where entrance left off
          gsap.to(cloud, {
            x: -200 + (offsetMultiplier * 80),
            y: -100 + (offsetMultiplier * 40),
            duration: 25,
            ease: "none",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
      });
    };

    // Start continuous animation after entrance animation - only if not transitioning
    const timeoutId = setTimeout(() => {
      if (!isTransitioning) {
        setupContinuousAnimation();
      }
    }, 2200); // Increased delay to ensure entrance completes
    
    // Store timeout for cleanup
    animationTimeoutsRef.current.push(timeoutId);

    // Optimized mouse parallax effect with throttling
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        // Skip if still transitioning
        if (isTransitioning) return;
        
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
            xMovement = xPercent * (isOriginal ? 15 : 12); // Reduced movement for stability
            yMovement = yPercent * (isOriginal ? 8 : 6);
          } else {
            xMovement = xPercent * (isOriginal ? 12 : 10);
            yMovement = yPercent * (isOriginal ? 6 : 4);
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

    // Add mouse interactions only after entrance is done
    let mouseEventTimeout: NodeJS.Timeout;
    if (typeof window !== "undefined") {
      mouseEventTimeout = setTimeout(() => {
        if (!isTransitioning) {
          window.addEventListener("mousemove", handleMouseMove, { passive: true });
        }
      }, 2000);
      
      // Store timeout for cleanup
      animationTimeoutsRef.current.push(mouseEventTimeout);
    }

    // Cleanup function
    return () => {
      // Clear all timeouts
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimeoutsRef.current = [];
      
      clearTimeout(timeoutId);
      clearTimeout(mouseEventTimeout);
      clouds.forEach(cloud => {
        if (cloud) gsap.killTweensOf(cloud);
      });
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [showClouds, isTransitioning]); // Added isTransitioning dependency

  useIsomorphicLayoutEffect(() => {
    // Prevent double execution for the same pathname
    if (currentPathnameRef.current === pathname && isInitializedRef.current) {
      return;
    }
    
    // Kill any existing animations immediately to prevent conflicts
    animationTimelinesRef.current.forEach(timeline => timeline.kill());
    animationTimelinesRef.current = [];
    animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    animationTimeoutsRef.current = [];
    
    // If this is a navigation (not initial load)
    if (globalPreviousPath && globalPreviousPath !== pathname) {
      // The signature cloud sweep is THE site transition — every
      // navigation uses it, except the works <-> project pair which keeps
      // its softer wash (a "detail view" gesture rather than a journey).
      const shouldShowProject = shouldShowProjectTransition(globalPreviousPath, pathname);
      const shouldShowProjectBack = shouldShowProjectBackTransition(globalPreviousPath, pathname);
      const shouldShow = !shouldShowProject && !shouldShowProjectBack;
      const shouldShowHome = false;
      
      // Use a single state update to prevent multiple re-renders
      const newTransitionState = {
        showClouds: shouldShow,
        showProjectTransition: shouldShowProject,
        showProjectBackTransition: shouldShowProjectBack,
        showHomeTransition: shouldShowHome,
        isTransitioning: shouldShow || shouldShowProject || shouldShowProjectBack || shouldShowHome,
        displayedContent: children
      };
      
      // Batch all state updates
      setShowClouds(newTransitionState.showClouds);
      setShowProjectTransition(newTransitionState.showProjectTransition);
      setShowProjectBackTransition(newTransitionState.showProjectBackTransition);
      setShowHomeTransition(newTransitionState.showHomeTransition);
      setDisplayedContent(newTransitionState.displayedContent);
      
      if (newTransitionState.isTransitioning) {
        // Hide content immediately before starting transition
        if (contentWrapperRef.current) {
          gsap.set(contentWrapperRef.current, { opacity: 0 });
        }
        setIsTransitioning(true);
      }
    } else {
      // For initial/direct load - show transition animation if not on home page
      const isDirectLoad = !globalPreviousPath || !isInitializedRef.current;
      const isHomePage = pathname === '/';
      
      if (isDirectLoad && !isHomePage) {
        // Simulate coming from home page for direct access
        const shouldShow = shouldShowClouds('/', pathname);
        const shouldShowProject = shouldShowProjectTransition('/works', pathname);
        
        // Hide content immediately for direct access with transition
        if (contentWrapperRef.current && (shouldShow || shouldShowProject)) {
          gsap.set(contentWrapperRef.current, { opacity: 0 });
        }
        
        // Batch state updates
        setShowClouds(shouldShow);
        setShowProjectTransition(shouldShowProject);
        setShowProjectBackTransition(false);
        setShowHomeTransition(false);
        setDisplayedContent(children);
        setIsTransitioning(shouldShow || shouldShowProject);
      } else {
        // For home page or normal loads, don't show transitions
        setShowClouds(false);
        setShowProjectTransition(false);
        setShowProjectBackTransition(false);
        setShowHomeTransition(false);
        setDisplayedContent(children);
        setIsTransitioning(false);
        
        // Ensure content is visible for home page
        if (contentWrapperRef.current && isHomePage) {
          gsap.set(contentWrapperRef.current, { opacity: 1, y: 0, scale: 1 });
        }
      }
    }
    
    // Update tracking refs
    currentPathnameRef.current = pathname;
    isInitializedRef.current = true;
    
    // After handling transition, update global state for next navigation
    const globalStateTimeout = setTimeout(() => {
      if (contentWrapperRef.current) {
        globalPreviousPath = pathname;
      }
    }, 100);
    
    animationTimeoutsRef.current.push(globalStateTimeout);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, children]);

  // Set up global capture function
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.captureCurrentPageForTransition = () => {
        if (contentWrapperRef.current) {
          globalPreviousPath = pathname;
        }
      };
      window.beginPageCover = (href: string, navigate: () => void) => {
        // works <-> project keeps its wash (which handles its own timing);
        // every other navigation covers with the cloud sweep first
        if (
          coveringRef.current ||
          shouldShowProjectTransition(pathname, href) ||
          shouldShowProjectBackTransition(pathname, href)
        ) {
          navigate();
          return;
        }
        pendingNavRef.current = navigate;
        coveringRef.current = true;
        setShowClouds(true); // mount the transition layers for the cover
        setIsCovering(true);
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.captureCurrentPageForTransition = undefined;
        window.beginPageCover = undefined;
      }
    };
  }, [pathname]);

  // Play the cover: the transition clouds sweep in over the outgoing page
  // (same choreography as the arrival entrance, just quicker), then the
  // pending navigation runs behind them. The arrival entrance continues
  // from the covering positions once the new route mounts.
  useEffect(() => {
    if (!isCovering) return;
    const clouds = cloudRefs.current;
    if (!clouds.some(Boolean)) {
      pendingNavRef.current?.();
      pendingNavRef.current = null;
      coveringRef.current = false;
      setIsCovering(false);
      return;
    }

    const pathAtCover = currentPathnameRef.current;
    gsap.ticker.wake();
    clouds.forEach((cloud) => cloud && gsap.killTweensOf(cloud));
    // fresh layers start above the screen; layers persisting from an
    // earlier navigation sweep back to cover from wherever they drifted
    if (!cloudsActiveRef.current) {
      clouds.forEach((cloud, index) => {
        if (!cloud) return;
        gsap.set(cloud, {
          ...cloudStageProps(index),
          opacity: cloudLayers[index].opacity,
          force3D: true,
        });
      });
    }
    cloudsActiveRef.current = true;

    const coverTl = gsap.timeline({
      onComplete: () => {
        pendingNavRef.current?.();
        pendingNavRef.current = null;
      },
    });
    // Never gate navigation solely on an animation callback: in throttled
    // windows (occluded/background) rAF can tick once every few seconds,
    // so back the cover with a wall-clock trigger. Both paths null the
    // pending nav, so whichever fires first wins.
    const navTimer = setTimeout(() => {
      pendingNavRef.current?.();
      pendingNavRef.current = null;
    }, 1050);
    animationTimeoutsRef.current.push(navTimer);
    animationTimelinesRef.current.push(coverTl);
    clouds.forEach((cloud, index) => {
      if (!cloud) return;
      coverTl.to(cloud, {
        ...cloudCoverProps(index),
        opacity: cloudLayers[index].opacity,
        duration: 0.7,
        ease: "power2.in",
        force3D: true,
      }, (index % 4) * 0.05);
    });

    // never leave the page stuck under the cover if navigation fails
    const safety = setTimeout(() => {
      if (coveringRef.current && currentPathnameRef.current === pathAtCover) {
        pendingNavRef.current = null;
        coveringRef.current = false;
        setIsCovering(false);
        setShowClouds(false);
        cloudsActiveRef.current = false;
      }
    }, 3000);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCovering]);

  // Handle browser back/forward navigation and continuous state capture
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Continuously update the global state so back button always has the previous page
    const updateGlobalState = () => {
      if (contentWrapperRef.current && !isTransitioning) {
        globalPreviousPath = pathname;
      }
    };

    // Update immediately
    updateGlobalState();

    // Set up an interval to capture state periodically (fallback)
    const intervalId = setInterval(updateGlobalState, 500);

    // Also capture on user interactions
    const handleInteraction = (e: Event) => {
      updateGlobalState();
    };

    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('scroll', handleInteraction, { passive: true });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [pathname, isTransitioning]);

  useEffect(() => {
    // Handle transition animations - add guard to prevent double execution
    if (!isTransitioning || !contentWrapperRef.current) {
      return;
    }
    
    const contentWrapper = contentWrapperRef.current;
    gsap.ticker.wake();

    if (showClouds && containerRef.current) {
      // Animate clouds and content entrance
      const clouds = cloudRefs.current;
      
      // Ensure content is hidden initially, with a slight offset so it
      // rises into place as it fades in (a flat fade read less smooth)
      gsap.set(contentWrapper, { opacity: 0, y: 24, scale: 1 });
      
      // When arriving behind a cover (link click), the layers are already
      // sweeping over the screen — the entrance continues from there.
      // Otherwise (home burst, back/forward, direct load) stage them
      // above the viewport for the diving entrance.
      const arrivedCovered = coveringRef.current;
      if (!arrivedCovered) {
        clouds.forEach((cloud, index) => {
          if (!cloud) return;
          // staged and transparent: the layers fade in over the first
          // moments of the dive instead of popping in at full opacity
          gsap.set(cloud, {
            ...cloudStageProps(index),
            opacity: 0,
            force3D: true,
          });
        });
      }
      cloudsActiveRef.current = true;
      
      // Create entrance timeline with staggered cloud animations and hardware acceleration
      const entranceTl = gsap.timeline({
        onComplete: () => {
          setIsTransitioning(false);
          coveringRef.current = false;
          setIsCovering(false);
        }
      });
      animationTimelinesRef.current.push(entranceTl); // Track timeline
      
      // Add fallback timeout to ensure animation completes
      const fallbackTimeout = setTimeout(() => {
        gsap.set(contentWrapper, { opacity: 1, y: 0 });
        setIsTransitioning(false);
        coveringRef.current = false;
        setIsCovering(false);
      }, 3500); // 3.5 seconds fallback
      
      animationTimeoutsRef.current.push(fallbackTimeout); // Track timeout
      
      if (!arrivedCovered) {
        // Animate all clouds flowing downward to cover the screen,
        // fading in as they start to move
        clouds.forEach((cloud, index) => {
          if (!cloud) return;
          const delay = ((index % 4) * 0.08) + (index < 4 ? 0 : 0.04);
          entranceTl.to(cloud, {
            opacity: cloudLayers[index].opacity,
            duration: 0.45,
            ease: "power1.out",
            force3D: true
          }, delay);
          entranceTl.to(cloud, {
            ...cloudCoverProps(index),
            duration: 1.8,
            ease: "power2.out",
            force3D: true
          }, delay);
        });
      } else {
        // Already covering from the pre-navigation sweep: continue the
        // dive with the same momentum — the clouds keep flowing down and
        // decelerate while the new page emerges above them. (A tiny settle
        // here read as the transition stopping mid-flight.)
        clouds.forEach((cloud, index) => {
          if (!cloud) return;
          const baseIndex = index % 4;
          entranceTl.to(cloud, {
            y: `+=${260 + baseIndex * 45}`,
            x: `+=${index % 2 === 0 ? 45 : -45}`,
            duration: 1.7,
            ease: "power2.out",
            force3D: true
          }, baseIndex * 0.05);
        });
      }
      
      // Then animate content with a "emerging from clouds" effect
      entranceTl.to(contentWrapper, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        onComplete: () => {
          clearTimeout(fallbackTimeout);
        }
      }, arrivedCovered ? 0.3 : "-=1.0");
      
    } else if (showProjectTransition && containerRef.current) {
      // Improved project transition: Smoother fade effect
      const overlay = projectOverlayRef.current;
      
      if (overlay) {
        // Ensure content is hidden initially
        gsap.set(contentWrapper, { opacity: 0, scale: 0.95, y: 20 });
        
        // Add fallback timeout
        const fallbackTimeout = setTimeout(() => {
          gsap.set(contentWrapper, { opacity: 1, scale: 1, y: 0 });
          gsap.set(overlay, { opacity: 0 });
          setIsTransitioning(false);
          setShowProjectTransition(false);
        }, 1500);
        
        animationTimeoutsRef.current.push(fallbackTimeout); // Track timeout
        
        // (the overlay is already covering — set pre-paint in the layout
        // effect above, dusk-tinted like the rest of the site)

        // Create smoother project entrance timeline
        const projectTl = gsap.timeline({
          onComplete: () => {
            clearTimeout(fallbackTimeout);
            setIsTransitioning(false);
            // unmount the overlay once content is fully opaque above it
            setShowProjectTransition(false);
          }
        });
        animationTimelinesRef.current.push(projectTl); // Track timeline
        
        // Smoother overlay fade - reduced intensity and faster
        projectTl.to(overlay, {
          opacity: 0,
          scale: 1.1, // Reduced scale change
          duration: 0.6, // Faster transition
          ease: "power1.out", // Smoother easing
          force3D: true
        }, 0);
        
        // Content emerges more smoothly
        projectTl.to(contentWrapper, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8, // Slightly longer content fade
          ease: "power1.out", // Smoother easing
          force3D: true
        }, 0.2); // Slightly later start for smoother overlap
      }
    } else if (showProjectBackTransition && containerRef.current) {
      // Project back transition: same choreography as the forward project
      // transition, playing over the cloud backdrop (rendered below the
      // overlay) so the wash reads as sky instead of a flat gray flash.
      const overlay = projectOverlayRef.current;

      if (overlay) {
        // Ensure content is hidden initially
        gsap.set(contentWrapper, { opacity: 0, scale: 0.95, y: 20 });

        // Add fallback timeout
        const fallbackTimeout = setTimeout(() => {
          gsap.set(contentWrapper, { opacity: 1, scale: 1, y: 0 });
          gsap.set(overlay, { opacity: 0 });
          setIsTransitioning(false);
          setShowProjectBackTransition(false);
          coveringRef.current = false;
          setIsCovering(false);
        }, 1500);

        animationTimeoutsRef.current.push(fallbackTimeout);

        // (overlay already covering — set pre-paint in the layout effect)

        // Create project back timeline
        const projectBackTl = gsap.timeline({
          onComplete: () => {
            clearTimeout(fallbackTimeout);
            setIsTransitioning(false);
            // Unmount the overlay + backdrop once done (content is fully
            // opaque above them by now, so this swap is invisible).
            setShowProjectBackTransition(false);
            coveringRef.current = false;
            setIsCovering(false);
          }
        });
        animationTimelinesRef.current.push(projectBackTl);

        // Overlay fade out
        projectBackTl.to(overlay, {
          opacity: 0,
          scale: 1.1,
          duration: 0.6,
          ease: "power1.out",
          force3D: true
        }, 0);

        // Content emerges more smoothly
        projectBackTl.to(contentWrapper, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power1.out",
          force3D: true
        }, 0.2);
      }
    } else if (showHomeTransition && containerRef.current) {
      // Simple home transition: Clean fade effect without clouds
      // Ensure content is hidden initially
      gsap.set(contentWrapper, { opacity: 0, y: 20, scale: 1 });
      
      // Add fallback timeout
      const fallbackTimeout = setTimeout(() => {
        gsap.set(contentWrapper, { opacity: 1, y: 0 });
        setIsTransitioning(false);
      }, 1200);
      
      animationTimeoutsRef.current.push(fallbackTimeout); // Track timeout
      
      // Create simple fade-in timeline
      const homeTl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallbackTimeout);
          setIsTransitioning(false);
        }
      });
      animationTimelinesRef.current.push(homeTl); // Track timeline
      
      // Simple fade in with slight upward movement
      homeTl.to(contentWrapper, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }, [isTransitioning, showClouds, showProjectTransition, showProjectBackTransition, showHomeTransition]);

  // Handle children prop changes separately to prevent double animations
  useEffect(() => {
    if (!isTransitioning && !showClouds && !showProjectTransition && !showProjectBackTransition && !showHomeTransition) {
      setDisplayedContent(children);
      // Ensure content is visible when not transitioning
      if (contentWrapperRef.current) {
        gsap.set(contentWrapperRef.current, { opacity: 1, y: 0, scale: 1 });
      }
    }
  }, [children, isTransitioning, showClouds, showProjectTransition, showProjectBackTransition, showHomeTransition]);

  // GSAP's ticker can end up asleep with its internal wake-on-new-tween
  // broken (observed after hidden-tab loads / bfcache restores): tweens
  // then sit at progress 0 forever and only fallback timeouts hard-set
  // final states — transitions look broken. A permanent no-op listener
  // keeps the ticker running for the app's lifetime (one rAF no-op per
  // frame), and explicit wakes cover tab-restore events.
  useEffect(() => {
    // In throttled windows GSAP's default lagSmoothing turns sparse rAF
    // ticks into a near-frozen clock; with 0 the clock always tracks real
    // time (a decorative cloud jumping after a hiccup is fine — a
    // transition that never finishes is not).
    gsap.ticker.lagSmoothing(0);
    const heartbeat = () => {};
    gsap.ticker.add(heartbeat);
    const wake = () => gsap.ticker.wake();
    wake();
    window.addEventListener("pageshow", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      gsap.ticker.remove(heartbeat);
      window.removeEventListener("pageshow", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);

  // Cleanup on unmount to prevent memory leaks and stuck animations
  useEffect(() => {
    return () => {
      // Clear all tracked timeouts
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimeoutsRef.current = [];
      
      // Kill all tracked timelines
      animationTimelinesRef.current.forEach(timeline => timeline.kill());
      animationTimelinesRef.current = [];
      
      // Kill any remaining GSAP animations on cloud refs
      cloudRefs.current.forEach(cloud => {
        if (cloud) gsap.killTweensOf(cloud);
      });
      
      // Ensure content is visible
      if (contentWrapperRef.current) {
        gsap.set(contentWrapperRef.current, { opacity: 1, y: 0, scale: 1 });
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden min-h-screen">
      {/* Background Cloud Animation Layer - Only show for non-home transitions */}
      {showClouds && (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Main Background - same as HeroSection and pages */}
          <Image
            src="/clouds/bg.png"
            alt="Sky Background"
            fill
            priority
            className="absolute inset-0 h-full w-full object-cover"
            style={{ zIndex: -10 }}
          />
          
          {/* Background Cloud Layers - Simplified */}
          {cloudLayers.map((layer, index) => (
            <div
              key={`transition-${layer.src}-${index}`}
              ref={(el) => {
                if (el) cloudRefs.current[index] = el;
              }}
              className="absolute inset-0 h-full w-full overflow-hidden"
              style={{ 
                zIndex: layer.zIndex,
                willChange: 'transform', // Optimize for animations
                backfaceVisibility: 'hidden', // Prevent flickering
                // born already staged: without this the layer paints one
                // frame untransformed (a full-screen flash) before GSAP
                // positions it
                transform: `translate3d(${cloudStageProps(index).x}px, ${cloudStageProps(index).y}px, 0) scale(${cloudStageProps(index).scale})`
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
          
          {/* Gradient overlay for smooth transitions */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none"
            style={{ zIndex: 6 }}
          />
        </div>
      )}

      {/* Cloud backdrop for the project back transition — the page content
          is hidden while the overlay plays, so without this the gradient
          washes over the dark body background instead of the sky. */}
      {showProjectBackTransition && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 12 }}
        >
          <Image
            src="/clouds/bg.png"
            alt=""
            fill
            sizes="100vw"
            priority
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Project Transition Overlay - Optimized fade effect */}
      {(showProjectTransition || showProjectBackTransition) && (
        <div 
          ref={projectOverlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ 
            zIndex: 30, // above the page content so the cover can hide it
            backfaceVisibility: 'hidden', // Prevent flickering
            transform: 'translateZ(0)' // Force hardware acceleration
          }}
        />
      )}

      {/* Page Content */}
      <div ref={newPageRef} className="relative w-full h-full" style={{ zIndex: 20 }}>
        <div 
          ref={contentWrapperRef}
          className={isTransitioning ? "opacity-0" : ""}
          style={{ 
            backfaceVisibility: 'hidden', // Prevent flickering
            transform: 'translateZ(0)', // Force hardware acceleration
            opacity: (!isTransitioning && !showClouds && !showProjectTransition && !showProjectBackTransition && !showHomeTransition) ? 1 : undefined
          }}
        >
          {displayedContent}
        </div>
      </div>
    </div>
  );
}

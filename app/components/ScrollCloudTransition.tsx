"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollCloudTransitionProps {
  children: React.ReactNode;
}

export default function ScrollCloudTransition({ children }: ScrollCloudTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !cloudsRef.current) return;

    const container = containerRef.current;
    const clouds = cloudsRef.current;

    // Create scroll-triggered cloud transition effect
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        pin: false,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Animate clouds moving up and fading out as user scrolls
          gsap.to(clouds, {
            y: -200 * progress,
            opacity: 1 - progress * 0.6,
            scale: 1 + progress * 0.2,
            duration: 0.3,
            ease: "none",
          });

          // Add a subtle rotation effect
          gsap.to(clouds.children, {
            rotation: progress * 5,
            duration: 0.3,
            ease: "none",
          });
        },
      },
    });

    // Cleanup
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div ref={cloudsRef} className="relative">
        {children}
      </div>
    </div>
  );
}

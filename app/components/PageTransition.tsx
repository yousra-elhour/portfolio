"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Global state to capture DOM snapshot before navigation
let globalPreviousHTML: string = '';
let globalPreviousPath: string = '';

// Global function type declaration
declare global {
  interface Window {
    captureCurrentPageForTransition?: () => void;
  }
}

export default function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef<HTMLDivElement>(null);
  const newPageRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousHTML, setPreviousHTML] = useState<string>('');
  const [displayedContent, setDisplayedContent] = useState<React.ReactNode>(children);

  useEffect(() => {
    // If this is a navigation (not initial load)
    if (globalPreviousPath && globalPreviousPath !== pathname) {
      // Use the globally captured HTML
      setPreviousHTML(globalPreviousHTML);
      setIsTransitioning(true);
    }
    
    // After handling transition, update global state for next navigation
    setTimeout(() => {
      if (contentWrapperRef.current) {
        globalPreviousHTML = contentWrapperRef.current.innerHTML;
        globalPreviousPath = pathname;
      }
    }, 100);
    
  }, [pathname]);

  // Update displayed content when children change
  useEffect(() => {
    if (!isTransitioning) {
      setDisplayedContent(children);
    }
  }, [children, isTransitioning]);

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
    const container = containerRef.current;
    const previousPage = previousPageRef.current;
    const newPage = newPageRef.current;
    if (!container || !newPage) return;
    
    if (previousHTML && previousPage && isTransitioning) {
      gsap.set(newPage, { y: '100%', opacity: 1 });
      gsap.set(previousPage, { y: 0, opacity: 1 });
      
      const tl = gsap.timeline({
        onComplete: () => {
          setPreviousHTML('');
          setIsTransitioning(false);
          setDisplayedContent(children);
        }
      });
      
      tl.to(previousPage, { y: '-100%', duration: 0.8, ease: 'power2.inOut' })
        .to(newPage, { y: 0, duration: 0.8, ease: 'power2.inOut' }, 0);
    } else if (!previousHTML && !isTransitioning) {
      gsap.set(newPage, { y: 0, opacity: 1 });
    }
  }, [previousHTML, isTransitioning]);

  return (
    <div ref={containerRef} className="relative overflow-hidden min-h-screen">
      {previousHTML && (
        <div ref={previousPageRef} className="absolute inset-0 z-20 w-full h-full">
          <div dangerouslySetInnerHTML={{ __html: previousHTML }} />
        </div>
      )}
      <div ref={newPageRef} className="relative z-10 w-full h-full">
        <div ref={contentWrapperRef}>
          {displayedContent}
        </div>
      </div>
    </div>
  );
}

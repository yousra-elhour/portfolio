"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef<HTMLDivElement>(null);
  const newPageRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevPathname, setPrevPathname] = useState<string>(pathname);
  const [previousContent, setPreviousContent] = useState<React.ReactNode>(null);
  const [displayedContent, setDisplayedContent] = useState<React.ReactNode>(children);

  useEffect(() => {
    console.log('Content useEffect:', { isTransitioning, hasChildren: !!children });
    if (!isTransitioning) {
      setDisplayedContent(children);
    }
  }, [children, isTransitioning]);

  useEffect(() => {
    console.log('Pathname changed:', { from: prevPathname, to: pathname, isTransitioning, hasPreviousContent: !!previousContent });
    if (prevPathname === pathname) return;
    if (prevPathname !== '') {
      console.log('Starting transition');
      setPreviousContent(displayedContent);
      setIsTransitioning(true);
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname, isTransitioning, displayedContent]);

  useEffect(() => {
    const container = containerRef.current;
    const previousPage = previousPageRef.current;
    const newPage = newPageRef.current;
    if (!container || !newPage) return;
    if (previousContent && previousPage && isTransitioning) {
      gsap.set(newPage, { x: '100%', opacity: 1 });
      gsap.set(previousPage, { x: 0, opacity: 1 });
      const tl = gsap.timeline({
        onComplete: () => {
          setPreviousContent(null);
          setIsTransitioning(false);
        }
      });
      tl.to(previousPage, { x: '-100%', duration: 0.8, ease: 'power2.inOut' })
        .to(newPage, { x: 0, duration: 0.8, ease: 'power2.inOut' }, 0);
    } else if (!previousContent && !isTransitioning) {
      gsap.set(newPage, { x: 0, opacity: 1 });
    }
  }, [previousContent, isTransitioning]);

  return (
    <div ref={containerRef} className="relative overflow-hidden min-h-screen">
      {previousContent && (
        <div ref={previousPageRef} className="absolute inset-0 z-20 w-full h-full" 
             style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '3px solid red' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'red', fontWeight: 'bold', zIndex: 9999, backgroundColor: 'white', padding: '5px' }}>
            PREVIOUS PAGE
          </div>
          {previousContent}
        </div>
      )}
      <div ref={newPageRef} className="relative z-10 w-full h-full"
           style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)', border: '3px solid green' }}>
        <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'green', fontWeight: 'bold', zIndex: 9999, backgroundColor: 'white', padding: '5px' }}>
          NEW PAGE
        </div>
        {displayedContent}
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
}

export default function TransitionLink({ 
  href, 
  children, 
  className,
  target 
}: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Don't animate external links
    if (target === "_blank" || href.startsWith('http')) {
      return;
    }

    e.preventDefault();
    
    // Capture current page state BEFORE navigation — the capture is
    // synchronous, so no artificial delay is needed before pushing.
    if (typeof window !== 'undefined' && window.captureCurrentPageForTransition) {
      window.captureCurrentPageForTransition();
    }

    router.push(href);
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={className}
      target={target}
    >
      {children}
    </Link>
  );
}
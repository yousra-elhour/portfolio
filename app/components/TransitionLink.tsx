"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Don't animate external links
    if (target === "_blank" || href.startsWith('http')) {
      return;
    }
    // let cmd/ctrl/shift-clicks open tabs/windows natively
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    if (href === pathname) return;

    // Capture current page state BEFORE navigation — the capture is
    // synchronous, so no artificial delay is needed before pushing.
    if (typeof window !== 'undefined' && window.captureCurrentPageForTransition) {
      window.captureCurrentPageForTransition();
    }

    // Navigate immediately — the original behavior. The clouds dive in on
    // the new page exactly as they always did; the swap itself is kept
    // flash-free by PageTransition hiding the incoming content before
    // paint (a cover phase before the swap changed the animation's feel
    // and was rejected).
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
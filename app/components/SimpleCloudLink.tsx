"use client";

import Link from 'next/link';
import { useCloudTransition } from './CloudTransitionProvider';

interface SimpleCloudLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function SimpleCloudLink({ 
  href, 
  children, 
  className 
}: SimpleCloudLinkProps) {
  const { navigateWithClouds } = useCloudTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithClouds(href);
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}

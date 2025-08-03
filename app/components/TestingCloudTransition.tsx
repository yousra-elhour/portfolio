"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface TestingCloudTransitionProps {
  onComplete?: () => void;
  isVisible?: boolean;
  trigger?: boolean;
  shouldPersist?: boolean;
}

export default function TestingCloudTransition({ 
  onComplete, 
  isVisible = true,
  trigger = true,
  shouldPersist = false
}: TestingCloudTransitionProps) {
  const cloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cloudRef.current || !trigger) return;
    
    const cloud = cloudRef.current;
    
    // Simple GSAP animation
    gsap.fromTo(cloud, 
      { opacity: 0 }, 
      { opacity: 1, duration: 1 }
    );
  }, [trigger]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 w-full h-full z-[9999] pointer-events-none">
      {/* <div
        ref={cloudRef}
        className="absolute w-full h-full"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Image
          src="/clouds/low-clouds1.png"
          alt="Cloud"
          fill
          className="object-cover"
          priority
        />
      </div> */}
    </div>
  );
}
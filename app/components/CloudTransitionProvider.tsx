"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import CloudsPageTransition from "./CloudsPageTransition";

interface CloudTransitionContextType {
  navigateWithClouds: (href: string) => void;
}

const CloudTransitionContext = createContext<CloudTransitionContextType | undefined>(undefined);

export function CloudTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const navigateWithClouds = useCallback((href: string) => {
    setIsTransitioning(true);
    
    // Wait for clouds to cover screen, then navigate
    setTimeout(() => {
      router.push(href);
    }, 1200); // Adjust based on your cloud animation timing
    
    // Reset after transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 3000);
  }, [router]);

  return (
    <CloudTransitionContext.Provider value={{ navigateWithClouds }}>
      {children}
      {isTransitioning && (
        <CloudsPageTransition 
          onComplete={() => setIsTransitioning(false)}
          isVisible={isTransitioning}
          trigger={isTransitioning}
        />
      )}
    </CloudTransitionContext.Provider>
  );
}

export function useCloudTransition() {
  const context = useContext(CloudTransitionContext);
  if (context === undefined) {
    throw new Error("useCloudTransition must be used within a CloudTransitionProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import TestingCloudTransition from "./TestingCloudTransition";

interface TestingCloudTransitionContextType {
  navigateWithTestingClouds: (href: string) => void;
}

const TestingCloudTransitionContext = createContext<
  TestingCloudTransitionContextType | undefined
>(undefined);

export function TestingCloudTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  const navigateWithTestingClouds = (href: string) => {
    // Simple navigation function - you can add logic here later
    console.log('Navigate to:', href);
  };

  // Check if we're on a works page
  const showClouds = pathname?.includes('/testing/works');

  return (
    <TestingCloudTransitionContext.Provider value={{ navigateWithTestingClouds }}>
      {children}
      
      {/* Simple cloud component */}
      {showClouds && (
        <TestingCloudTransition
          isVisible={showClouds}
          trigger={showClouds}
          shouldPersist={showClouds}
        />
      )}
    </TestingCloudTransitionContext.Provider>
  );
}

export function useTestingCloudTransition() {
  const context = useContext(TestingCloudTransitionContext);
  if (context === undefined) {
    throw new Error(
      "useTestingCloudTransition must be used within a TestingCloudTransitionProvider"
    );
  }
  return context;
}

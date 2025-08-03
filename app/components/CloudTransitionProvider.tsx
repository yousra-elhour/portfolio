"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import CloudsPageTransition from "./CloudsPageTransition";

interface CloudTransitionContextType {
  navigateWithClouds: (href: string) => void;
}

const CloudTransitionContext = createContext<
  CloudTransitionContextType | undefined
>(undefined);

export function CloudTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on the testing/works page
  const isTestingWorksPage = pathname?.includes('/testing/works');

  const navigateWithClouds = useCallback(
    (href: string) => {
      setIsTransitioning(true);

      setTimeout(() => {
        router.push(href);
      }, 2000); // Increased timeout to allow animation to complete

    
    },
    [router]
  );

  return (
    <CloudTransitionContext.Provider value={{ navigateWithClouds }}>
      {children}
      {/* Only show clouds on testing/works page, not during transitions on other pages */}
      {isTestingWorksPage && (
        <CloudsPageTransition
          onComplete={() => {
            // Don't set isTransitioning to false on testing/works page
            // This allows clouds to persist
          }}
          isVisible={isTestingWorksPage}
          trigger={isTestingWorksPage}
        />
      )}
      {/* Show transition clouds only during navigation and not on testing/works page */}
      {isTransitioning && !isTestingWorksPage && (
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
    throw new Error(
      "useCloudTransition must be used within a CloudTransitionProvider"
    );
  }
  return context;
}

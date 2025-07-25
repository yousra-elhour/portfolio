"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface TransitionContextType {
  triggerTransition: (callback?: () => void) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const triggerTransition = useCallback((callback?: () => void) => {
    setIsTransitioning(true);
    
    // Execute callback after transition covers screen
    setTimeout(() => {
      if (callback) callback();
    }, 1500); // Adjust timing based on transition duration
    
    // Reset transition state after it's complete
    setTimeout(() => {
      setIsTransitioning(false);
    }, 3000); // Total transition duration
  }, []);

  return (
    <TransitionContext.Provider value={{ triggerTransition, isTransitioning }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }
  return context;
}

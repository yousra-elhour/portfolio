"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import CloudsPageTransition from "./CloudsPageTransition";

export const PageWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [showTransition, setShowTransition] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Always show transition on mount
    setShowTransition(true);
    setContentVisible(false);
  }, []);

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setContentVisible(true);
  };

  return (
    <div className={className}>
      {/* Page Content */}
      <AnimatePresence mode="wait">
        {contentVisible && (
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.2
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cloud Transition Overlay */}
      <CloudsPageTransition 
        onComplete={handleTransitionComplete}
        isVisible={showTransition}
        trigger={showTransition}
      />
    </div>
  );
};

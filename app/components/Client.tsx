"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function Client({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.1 
          }}
        >
          {" "}
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

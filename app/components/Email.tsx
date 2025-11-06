"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Email() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const emailVariants = {
    hidden: { 
      opacity: 0, 
      y: 0 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        delay: 0.8,
        ease: [0.65, 0, 0.35, 1], // power2.out equivalent
      },
    },
  };

  const emailContent = (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-10 left-[8%] right-[8%] font-sans lg:tracking-[.4em] md:tracking-[.4em] tracking-[.3em] text-xs pointer-events-auto"
        style={{ zIndex: 99999 }}
        variants={emailVariants}
        initial="hidden"
        animate="visible"
      >
        <Link 
          href={"mailto:elhour.yousra1910@gmail.com"}
          className="relative"
          style={{ zIndex: 99999 }}
        >
          elhour.yousra1910@gmail.com
        </Link>
      </motion.div>
    </AnimatePresence>
  );

  return mounted ? createPortal(emailContent, document.body) : null;
}

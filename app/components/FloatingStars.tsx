"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

// Static starfield: stars twinkle in place (CSS animation) in the open sky
// above the cloud banks — they don't drift, so they never read as specks
// moving across the clouds. Hovering near a star still makes it glow.
export default function FloatingStars() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);

  // Initialize stars (and regenerate on resize, as before)
  useEffect(() => {
    const generateStars = () => {
      const starCount = window.innerWidth < 768 ? 30 : 50;
      const newStars: Star[] = [];

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * window.innerWidth,
          // upper ~half of the viewport: open sky, above the cloud field
          y: Math.random() * window.innerHeight * 0.52,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 2 + 1,
        });
      }

      setStars(newStars);
    };

    generateStars();

    window.addEventListener("resize", generateStars);
    return () => window.removeEventListener("resize", generateStars);
  }, []);

  // Hover glow: rAF-throttled proximity check on mousemove — positions are
  // static, so there's no per-frame work while the mouse is still.
  useEffect(() => {
    if (!stars.length || !containerRef.current) return;

    const els = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(".floating-star")
    );
    const hovered = new Array<boolean>(els.length).fill(false);
    let rafId = 0;
    let pending = false;
    let mouseX = -1e4;
    let mouseY = -1e4;

    const applyHover = () => {
      pending = false;
      els.forEach((el, i) => {
        const star = stars[i];
        if (!star) return;
        const dx = star.x - mouseX;
        const dy = star.y - mouseY;
        const isNear = dx * dx + dy * dy < 100 * 100;
        if (isNear !== hovered[i]) {
          hovered[i] = isNear;
          el.classList.toggle("star-hovered", isNear);
        }
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(applyHover);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [stars]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 20 }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="floating-star absolute rounded-full bg-white"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            ["--star-opacity" as string]: star.opacity,
            animationDuration: `${star.twinkleSpeed}s`,
            animationDelay: `${(star.id % 10) * 0.3}s`,
          }}
        />
      ))}

      {/* Shooting stars for extra magic */}
      <ShootingStars />
    </div>
  );
}

function ShootingStars() {
  const [shootingStars, setShootingStars] = useState<
    Array<{ id: number; left: number; drift: number }>
  >([]);

  useEffect(() => {
    // Generate shooting stars every 3-8 seconds
    const interval = setInterval(() => {
      const id = Date.now();
      setShootingStars((prev) => [
        ...prev,
        {
          id,
          left: Math.random() * window.innerWidth,
          drift: Math.random() * 200 - 100,
        },
      ]);

      // Remove shooting star after animation
      setTimeout(() => {
        setShootingStars((prev) => prev.filter((star) => star.id !== id));
      }, 2000);
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {shootingStars.map((shootingStar) => (
        <motion.div
          key={shootingStar.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: shootingStar.left,
            top: -10,
            boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: shootingStar.drift,
            y:
              typeof window !== "undefined" ? window.innerHeight + 100 : 1000,
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

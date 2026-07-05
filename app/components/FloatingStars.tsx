"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number; // upward drift in px per 50ms, same scale as before
  twinkleSpeed: number;
}

// Same star field as before (counts, sizes, twinkle, drift, hover glow),
// but without re-rendering every star through React 20 times a second:
// twinkle runs as a CSS animation, and one rAF loop applies the upward
// drift and the 100px mouse-proximity glow directly to the DOM nodes.
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
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1,
          twinkleSpeed: Math.random() * 2 + 1,
        });
      }

      setStars(newStars);
    };

    generateStars();

    window.addEventListener("resize", generateStars);
    return () => window.removeEventListener("resize", generateStars);
  }, []);

  // Drift + hover proximity: one rAF loop, no React state per frame.
  useEffect(() => {
    if (!stars.length || !containerRef.current) return;

    const els = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(".floating-star")
    );
    const offsets = new Float32Array(els.length);
    const hovered = new Array<boolean>(els.length).fill(false);
    let mouseX = -1e4;
    let mouseY = -1e4;
    let last = performance.now();
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const h = window.innerHeight;

      els.forEach((el, i) => {
        const star = stars[i];
        if (!star) return;

        // original: y -= speed every 50ms => speed * 20 px per second
        let offset = offsets[i] - star.speed * 20 * dt;
        const y = star.y + offset;
        // wrap: once above the viewport, re-enter from below (as before)
        if (y <= -10) offset = h + 10 - star.y;
        offsets[i] = offset;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;

        const dx = star.x - mouseX;
        const dy = star.y + offset - mouseY;
        const isNear = dx * dx + dy * dy < 100 * 100;
        if (isNear !== hovered[i]) {
          hovered[i] = isNear;
          el.classList.toggle("star-hovered", isNear);
        }
      });

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [stars]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
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
          // position chosen at spawn time (was re-randomized every render)
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

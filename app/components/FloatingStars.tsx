"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  hovered: boolean;
}

export default function FloatingStars() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Initialize stars
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
          hovered: false,
        });
      }
      
      setStars(newStars);
    };

    generateStars();
    
    // Regenerate stars on window resize
    const handleResize = () => {
      generateStars();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate stars floating and check for hover
  useEffect(() => {
    const animateStars = () => {
      setStars(prevStars => 
        prevStars.map(star => {
          // Check if mouse is near star (within 100px radius)
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - star.x, 2) + 
            Math.pow(mousePosition.y - star.y, 2)
          );
          const isHovered = distance < 100;

          return {
            ...star,
            y: star.y <= -10 ? window.innerHeight + 10 : star.y - star.speed,
            hovered: isHovered,
          };
        })
      );
    };

    const interval = setInterval(animateStars, 50);
    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
    >
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.x,
            top: star.y,
            width: star.hovered ? star.size * 2 : star.size,
            height: star.hovered ? star.size * 2 : star.size,
          }}
          animate={{
            opacity: star.hovered 
              ? [star.opacity, 1, star.opacity] 
              : [star.opacity, star.opacity * 0.3, star.opacity],
            scale: star.hovered ? 1.5 : 1,
            boxShadow: star.hovered 
              ? "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)"
              : "0 0 10px rgba(255, 255, 255, 0.3)",
          }}
          transition={{
            opacity: {
              duration: star.twinkleSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            },
            scale: {
              duration: 0.3,
              ease: "easeOut",
            },
            boxShadow: {
              duration: 0.3,
              ease: "easeOut",
            },
          }}
        />
      ))}
      
      {/* Shooting stars for extra magic */}
      <ShootingStars />
    </div>
  );
}

function ShootingStars() {
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; delay: number }>>([]);

  useEffect(() => {
    // Generate shooting stars every 3-8 seconds
    const generateShootingStar = () => {
      const id = Date.now();
      setShootingStars(prev => [...prev, { id, delay: 0 }]);
      
      // Remove shooting star after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== id));
      }, 2000);
    };

    const interval = setInterval(generateShootingStar, Math.random() * 5000 + 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {shootingStars.map((shootingStar) => (
        <motion.div
          key={shootingStar.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: Math.random() * window.innerWidth,
            top: -10,
            boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * 200 - 100,
            y: window.innerHeight + 100,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

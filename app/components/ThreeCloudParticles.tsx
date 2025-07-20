"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

interface ThreeCloudParticlesProps {
  enabled?: boolean;
}

export default function ThreeCloudParticles({ enabled = false }: ThreeCloudParticlesProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationFrameRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const particleSystemRef = useRef<THREE.Points>();

  useEffect(() => {
    if (!enabled || !mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    mountRef.current.appendChild(renderer.domElement);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create cloud particles
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Initialize particle positions and properties
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 20;     // x
      positions[i3 + 1] = (Math.random() - 0.5) * 10; // y
      positions[i3 + 2] = (Math.random() - 0.5) * 10; // z
      
      // Color (cloud-like whites and light blues)
      colors[i3] = 0.9 + Math.random() * 0.1;     // r
      colors[i3 + 1] = 0.9 + Math.random() * 0.1; // g
      colors[i3 + 2] = 0.95 + Math.random() * 0.05; // b
      
      // Size (make particles even smaller)
      sizes[i] = Math.random() * 0.03 + 0.01; // Further reduced from 0.05 + 0.02 to 0.03 + 0.01
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create particle material (even smaller base size)
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03, // Further reduced from 0.05 to 0.03
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.6, // Slightly reduced opacity for subtlety
      blending: THREE.AdditiveBlending,
    });

    // Create particle system
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    // Position camera
    camera.position.z = 5;

    // Mouse interaction with edge protection
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-1 to +1)
      const rawX = (event.clientX / window.innerWidth) * 2 - 1;
      const rawY = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Calculate distance from center for edge protection
      const distanceFromCenter = Math.sqrt(rawX * rawX + rawY * rawY);
      const edgeProtection = Math.max(0.2, 1 - (distanceFromCenter * 0.7));
      
      // Apply edge protection to mouse values
      mouseRef.current.x = rawX * edgeProtection;
      mouseRef.current.y = rawY * edgeProtection;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Rotate particle system slowly
      particleSystem.rotation.y += 0.001;
      particleSystem.rotation.x += 0.0005;
      
      // Even more subtle mouse parallax effect on particle system
      const targetRotationX = mouseRef.current.y * 0.025; // Reduced from 0.04
      const targetRotationY = mouseRef.current.x * 0.025; // Reduced from 0.04
      
      // Base rotation plus very subtle mouse influence
      particleSystem.rotation.x += 0.0005 + (targetRotationX - particleSystem.rotation.x) * 0.03; // Reduced from 0.05
      particleSystem.rotation.y += 0.001 + (targetRotationY - particleSystem.rotation.y) * 0.03; // Reduced from 0.05
      
      // Move particles with very subtle mouse interaction
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Keep the same base floating movement
        positions[i3] += Math.sin(Date.now() * 0.001 + i) * 0.00015;
        positions[i3 + 1] += Math.cos(Date.now() * 0.001 + i) * 0.00015;
        
        // More subtle mouse influence on individual particles
        const mouseInfluence = 0.00015; // Reduced from 0.0002
        positions[i3] += mouseRef.current.x * mouseInfluence;
        positions[i3 + 1] += mouseRef.current.y * mouseInfluence;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -3 }}
    />
  );
}

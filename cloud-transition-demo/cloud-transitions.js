// Professional Cloud Transition System
// Used by award-winning websites for impressive page transitions

class CloudTransitionEngine {
  constructor() {
    this.canvas = document.getElementById("cloudCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.animationId = null;
    this.isTransitioning = false;

    this.setupCanvas();
    this.initializeParticles();
    this.setupScrollAnimations();

    // Resize handler
    window.addEventListener("resize", () => this.setupCanvas());
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // TECHNIQUE 1: Advanced SVG Cloud Morphing
  morphCloudTransition() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const morphingCloud = document.getElementById("morphingCloud");
    const backgroundClouds = document.getElementById("backgroundClouds");

    // Define different cloud shapes for morphing
    const cloudShapes = [
      "M200,400 Q400,300 600,400 Q800,350 1000,400 Q1200,320 1400,400 Q1600,380 1720,400 L1720,1080 L200,1080 Z",
      "M0,600 Q300,200 600,500 Q900,100 1200,450 Q1500,250 1920,500 L1920,1080 L0,1080 Z",
      "M0,300 Q480,150 960,300 Q1440,450 1920,300 L1920,1080 L0,1080 Z",
      "M0,500 Q240,200 480,500 Q720,800 960,500 Q1200,200 1440,500 Q1680,800 1920,500 L1920,1080 L0,1080 Z",
    ];

    // GSAP Timeline for complex orchestration
    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
        gsap.set(morphingCloud, { opacity: 0 });
        gsap.set(backgroundClouds, { opacity: 0 });
      },
    });

    // Phase 1: Cloud emergence with elastic easing
    tl.to(morphingCloud, {
      opacity: 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)",
    })

      // Phase 2: Background clouds float in
      .to(
        backgroundClouds,
        {
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
        },
        "-=0.6"
      )

      // Phase 3: Dynamic morphing sequence
      .to(morphingCloud, {
        morphSVG: cloudShapes[1],
        duration: 1.5,
        ease: "power2.inOut",
      })
      .to(
        morphingCloud,
        {
          morphSVG: cloudShapes[2],
          duration: 1.2,
          ease: "sine.inOut",
        },
        "-=0.3"
      )
      .to(
        morphingCloud,
        {
          morphSVG: cloudShapes[3],
          duration: 1.8,
          ease: "power3.inOut",
        },
        "-=0.4"
      )

      // Phase 4: Parallax cloud movement
      .to(
        backgroundClouds.children,
        {
          x: (i) => (i % 2 === 0 ? 300 : -200),
          y: (i) => Math.sin(i) * 100,
          rotation: (i) => i * 15,
          duration: 2,
          ease: "power2.inOut",
          stagger: 0.1,
        },
        "-=1.5"
      )

      // Phase 5: Final morphing and fade
      .to(
        morphingCloud,
        {
          morphSVG: cloudShapes[0],
          duration: 1.5,
          ease: "power3.out",
        },
        "-=1"
      )
      .to(
        [morphingCloud, backgroundClouds],
        {
          opacity: 0,
          duration: 1,
          ease: "power2.in",
        },
        "-=0.5"
      );

    return tl;
  }

  // TECHNIQUE 2: Physics-Based Particle Cloud System
  initializeParticles() {
    this.particles = [];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 200,
        size: Math.random() * 8 + 2,
        speedX: (Math.random() - 0.5) * 2,
        speedY: -Math.random() * 3 - 1,
        opacity: Math.random() * 0.8 + 0.2,
        life: 1,
        maxLife: Math.random() * 300 + 200,
        wind: Math.random() * 0.02 + 0.01,
        cohesion: Math.random() * 0.02 + 0.005,
      });
    }
  }

  particleCloudTransition() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const container = document.getElementById("particleContainer");
    container.innerHTML = "";

    // Create advanced particle system
    const particleCount = 200;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      const size = Math.random() * 12 + 4;
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight + 100;

      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.left = startX + "px";
      particle.style.top = startY + "px";
      particle.style.opacity = "0";

      container.appendChild(particle);
      particles.push({
        element: particle,
        x: startX,
        y: startY,
        size: size,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight * 0.7,
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    // Animate particles with flocking behavior
    gsap.set(
      particles.map((p) => p.element),
      { opacity: 0 }
    );

    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
        container.innerHTML = "";
      },
    });

    // Phase 1: Particle emergence
    tl.to(
      particles.map((p) => p.element),
      {
        opacity: 0.8,
        duration: 0.8,
        stagger: 0.02,
        ease: "power2.out",
      }
    );

    // Phase 2: Complex particle movement with physics
    particles.forEach((particle, i) => {
      const delay = i * 0.01;

      tl.to(
        particle.element,
        {
          x: () => particle.targetX - particle.x,
          y: () => particle.targetY - particle.y,
          rotation: Math.random() * 360,
          scale: Math.random() * 1.5 + 0.5,
          duration: 3 + Math.random() * 2,
          ease: "power2.inOut",
          motionPath: {
            path: `M0,0 Q${Math.random() * 200 - 100},${
              Math.random() * 200 - 100
            } ${particle.targetX - particle.x},${
              particle.targetY - particle.y
            }`,
            autoRotate: false,
          },
        },
        delay
      );
    });

    // Phase 3: Particle clustering and swirl effect
    tl.to(
      particles.map((p) => p.element),
      {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        scale: 0.3,
        rotation: 720,
        duration: 2,
        ease: "power3.inOut",
        stagger: {
          each: 0.02,
          from: "center",
        },
      },
      "-=1"
    )

      // Phase 4: Dispersal
      .to(
        particles.map((p) => p.element),
        {
          opacity: 0,
          scale: 0,
          rotation: 1080,
          duration: 1.5,
          ease: "power2.in",
          stagger: 0.01,
        },
        "-=0.5"
      );

    return tl;
  }

  // TECHNIQUE 3: Liquid Cloud Flow Transition
  liquidCloudTransition() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const waves = [];
    const waveCount = 8;

    // Create multiple wave layers
    for (let i = 0; i < waveCount; i++) {
      waves.push({
        amplitude: 50 + i * 20,
        frequency: 0.01 + i * 0.002,
        phase: (i * Math.PI) / 4,
        speed: 0.05 + i * 0.01,
        opacity: 0.1 + i * 0.1,
        y: this.canvas.height * 0.7 + i * 30,
      });
    }

    let animationTime = 0;
    const animationDuration = 5000; // 5 seconds

    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Create gradient background
      const gradient = this.ctx.createLinearGradient(
        0,
        0,
        0,
        this.canvas.height
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.3)");

      waves.forEach((wave, index) => {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);

        // Create smooth wave curve
        for (let x = 0; x <= this.canvas.width; x += 5) {
          const y =
            wave.y +
            Math.sin(
              x * wave.frequency + wave.phase + animationTime * wave.speed
            ) *
              wave.amplitude +
            Math.sin(
              x * wave.frequency * 2 + animationTime * wave.speed * 1.5
            ) *
              (wave.amplitude * 0.3);

          if (x === 0) {
            this.ctx.lineTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();

        // Apply wave styling
        this.ctx.fillStyle = `rgba(255, 255, 255, ${wave.opacity})`;
        this.ctx.fill();

        // Add wave glow effect
        this.ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
        this.ctx.shadowBlur = 20;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });

      animationTime += 16; // ~60fps

      if (animationTime < animationDuration) {
        requestAnimationFrame(animate);
      } else {
        this.isTransitioning = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    animate();
  }

  // TECHNIQUE 4: 3D Cloud Environment
  cloud3DTransition() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const container = document.getElementById("particleContainer");
    container.innerHTML = "";

    // Create 3D cloud layers
    const layers = 5;
    const cloudsPerLayer = 20;

    for (let layer = 0; layer < layers; layer++) {
      for (let i = 0; i < cloudsPerLayer; i++) {
        const cloud = document.createElement("div");
        cloud.className = "particle";

        const depth = layer / layers;
        const size = (20 + Math.random() * 30) * (1 - depth * 0.5);
        const opacity = (0.8 - depth * 0.4) * (0.5 + Math.random() * 0.5);

        cloud.style.width = size + "px";
        cloud.style.height = size + "px";
        cloud.style.borderRadius = "50%";
        cloud.style.background = `rgba(255, 255, 255, ${opacity})`;
        cloud.style.filter = `blur(${depth * 3}px)`;
        cloud.style.left = Math.random() * window.innerWidth + "px";
        cloud.style.top = Math.random() * window.innerHeight + "px";

        container.appendChild(cloud);

        // Animate with 3D perspective
        gsap.fromTo(
          cloud,
          {
            scale: 0,
            rotationX: -90,
            z: -1000 * depth,
          },
          {
            scale: 1,
            rotationX: 0,
            z: 0,
            duration: 2 + Math.random(),
            ease: "power3.out",
            delay: Math.random() * 2,
          }
        );

        // Add floating animation
        gsap.to(cloud, {
          x: `+=${Math.random() * 200 - 100}`,
          y: `+=${Math.random() * 100 - 50}`,
          rotation: Math.random() * 360,
          duration: 8 + Math.random() * 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 2,
        });
      }
    }

    // Cleanup after 8 seconds
    setTimeout(() => {
      gsap.to(container.children, {
        opacity: 0,
        scale: 0,
        duration: 2,
        stagger: 0.05,
        ease: "power2.in",
        onComplete: () => {
          container.innerHTML = "";
          this.isTransitioning = false;
        },
      });
    }, 8000);
  }

  // Scroll-triggered cloud animations
  setupScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Parallax clouds on scroll
    const sections = document.querySelectorAll(".demo-section");

    sections.forEach((section, index) => {
      // Create floating background clouds for each section
      if (index > 0) {
        this.createFloatingClouds(section, index);
      }
    });
  }

  createFloatingClouds(section, sectionIndex) {
    const cloudCount = 5;

    for (let i = 0; i < cloudCount; i++) {
      const cloud = document.createElement("div");
      cloud.style.position = "absolute";
      cloud.style.width = 30 + Math.random() * 40 + "px";
      cloud.style.height = 20 + Math.random() * 25 + "px";
      cloud.style.background = "rgba(255, 255, 255, 0.2)";
      cloud.style.borderRadius = "50px";
      cloud.style.filter = "blur(1px)";
      cloud.style.left = Math.random() * 100 + "%";
      cloud.style.top = Math.random() * 100 + "%";
      cloud.style.pointerEvents = "none";

      section.appendChild(cloud);

      // Parallax animation
      gsap.to(cloud, {
        x: Math.random() * 200 - 100,
        y: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        duration: 10 + Math.random() * 10,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });

      // Scroll-based movement
      gsap.to(cloud, {
        x: `+=${Math.random() * 300 - 150}`,
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
  }
}

// Initialize the cloud transition engine
let cloudEngine;

document.addEventListener("DOMContentLoaded", () => {
  cloudEngine = new CloudTransitionEngine();
});

// Global functions for demo buttons
function triggerCloudMorph() {
  if (cloudEngine) {
    cloudEngine.morphCloudTransition();
  }
}

function triggerParticleTransition() {
  if (cloudEngine) {
    cloudEngine.particleCloudTransition();
  }
}

function triggerLiquidTransition() {
  if (cloudEngine) {
    cloudEngine.liquidCloudTransition();
  }
}

function trigger3DTransition() {
  if (cloudEngine) {
    cloudEngine.cloud3DTransition();
  }
}

// Auto-trigger random transitions every 15 seconds
setInterval(() => {
  if (cloudEngine && !cloudEngine.isTransitioning) {
    const transitions = [
      triggerCloudMorph,
      triggerParticleTransition,
      triggerLiquidTransition,
      trigger3DTransition,
    ];

    const randomTransition =
      transitions[Math.floor(Math.random() * transitions.length)];
    randomTransition();
  }
}, 15000);

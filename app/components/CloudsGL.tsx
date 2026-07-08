"use client";

import { useEffect, useRef } from "react";

// Interactive volumetric-feel cloud field (Phase 3).
//
// ~90 large, soft instanced sprites textured from the same painted cloud
// PNGs as the rest of the site, distributed across three depth bands for
// parallax. The cursor is unprojected into each band's plane and applies a
// radial repulsion + tangential swirl force; a damped spring pulls each
// sprite home, so clouds part around the pointer and slowly reform behind it.
//
// three.js is imported dynamically so it ships as an async chunk after
// hydration. The loop renders only while the host is on screen, and the
// whole system disposes cleanly on unmount. Reduced-motion users keep the
// static painted clouds instead.

interface BandConfig {
  src: string;
  z: number;
  count: number;
  countCoarse: number;
  opacity: number;
  scaleMin: number;
  scaleMax: number;
  /** vertical placement range as fractions of the view half-height */
  yMin: number;
  yMax: number;
  /** interaction force multiplier — near clouds react the most */
  force: number;
  driftAmp: number;
}

const BANDS: BandConfig[] = [
  // far band — big slow wisps high in the frame
  {
    src: "/clouds/highCloud2.png", z: -4, count: 30, countCoarse: 14,
    opacity: 0.28, scaleMin: 2.6, scaleMax: 5.0, yMin: -1.05, yMax: 0.75,
    force: 0.45, driftAmp: 0.32,
  },
  // mid band
  {
    src: "/clouds/lowCloud1.png", z: 0, count: 30, countCoarse: 12,
    opacity: 0.38, scaleMin: 1.6, scaleMax: 3.2, yMin: -1.05, yMax: 0.35,
    force: 0.8, driftAmp: 0.24,
  },
  // near band — fastest parallax and strongest reaction
  {
    src: "/clouds/lowCloud3.png", z: 3, count: 22, countCoarse: 8,
    opacity: 0.5, scaleMin: 1.1, scaleMax: 2.4, yMin: -1.1, yMax: 0.1,
    force: 1.25, driftAmp: 0.16,
  },
];

const CAMERA_Z = 8;
const SPRING_K = 2.4;
const DAMPING = 1.6;
const REPEL = 5.2;
const SWIRL = 0.55;

const optimizedUrl = (src: string) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;

export default function CloudsGL() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const host = hostRef.current;
      if (disposed || !host) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
      } catch {
        return; // no WebGL — the painted background clouds remain
      }

      const finePointer = window.matchMedia("(pointer: fine)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        55,
        host.clientWidth / Math.max(host.clientHeight, 1),
        0.1,
        60
      );
      camera.position.z = CAMERA_Z;

      const loadTexture = async (src: string) => {
        const img = new window.Image();
        img.src = optimizedUrl(src);
        // onload rather than decode(): decode() promises can be starved
        // indefinitely in background tabs; drawImage decodes synchronously.
        await new Promise<void>((resolve, reject) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`failed to load ${src}`));
        });
        const width = 1024;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * width);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      };

      let textures: InstanceType<typeof THREE.CanvasTexture>[];
      try {
        textures = await Promise.all(BANDS.map((b) => loadTexture(b.src)));
      } catch {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      if (disposed) {
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }

      interface Band {
        mesh: InstanceType<typeof THREE.InstancedMesh>;
        count: number;
        z: number;
        force: number;
        home: Float32Array; // x, y, z per instance
        offset: Float32Array; // x, y displacement
        vel: Float32Array;
        rot: Float32Array; // angle, angularVel
        drift: Float32Array; // phase, speed, amp
        scale: Float32Array;
        halfW: number;
        halfH: number;
      }

      const dummy = new THREE.Object3D();
      const bands: Band[] = [];

      // Bands are seeded from real host dimensions. If the component mounts
      // in a background tab the host can measure 0x0 — in that case building
      // is deferred to the first ResizeObserver callback with a real size,
      // otherwise every home position would collapse onto the center line.
      const buildBands = (width: number, height: number) => {
        const viewAspect = width / Math.max(height, 1);

        BANDS.forEach((cfg, bandIndex) => {
          const texture = textures[bandIndex];
          const img = texture.image as HTMLCanvasElement;
          const texAspect = img.width / img.height;
          const count = finePointer ? cfg.count : cfg.countCoarse;

          const dist = CAMERA_Z - cfg.z;
          const halfH = Math.tan((55 * Math.PI) / 360) * dist;
          const halfW = halfH * viewAspect;

          const geometry = new THREE.PlaneGeometry(texAspect, 1);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: cfg.opacity,
            depthTest: false,
            depthWrite: false,
          });
          const mesh = new THREE.InstancedMesh(geometry, material, count);
          mesh.renderOrder = bandIndex;
          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

          const band: Band = {
            mesh, count, z: cfg.z, force: cfg.force,
            home: new Float32Array(count * 3),
            offset: new Float32Array(count * 2),
            vel: new Float32Array(count * 2),
            rot: new Float32Array(count * 2),
            drift: new Float32Array(count * 3),
            scale: new Float32Array(count),
            halfW, halfH,
          };

          for (let i = 0; i < count; i++) {
            band.home[i * 3] = (Math.random() * 2 - 1) * halfW * 1.15;
            const yr = cfg.yMin + Math.random() * (cfg.yMax - cfg.yMin);
            band.home[i * 3 + 1] = yr * halfH;
            band.home[i * 3 + 2] = cfg.z + (Math.random() * 2 - 1) * 0.5;
            band.rot[i * 2] = (Math.random() * 2 - 1) * 0.35;
            band.rot[i * 2 + 1] = (Math.random() * 2 - 1) * 0.02;
            band.drift[i * 3] = Math.random() * Math.PI * 2;
            band.drift[i * 3 + 1] = 0.04 + Math.random() * 0.05;
            band.drift[i * 3 + 2] = cfg.driftAmp * (0.6 + Math.random() * 0.8);
            band.scale[i] =
              cfg.scaleMin + Math.random() * (cfg.scaleMax - cfg.scaleMin);
          }

          scene.add(mesh);
          bands.push(band);
        });
      };

      if (host.clientWidth > 0 && host.clientHeight > 0) {
        buildBands(host.clientWidth, host.clientHeight);
      }

      // Pointer tracked on window — the canvas itself is pointer-events:none.
      const mouseNDC = { x: 10, y: 10, active: false };
      const onPointerMove = (e: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        if (
          e.clientY < rect.top || e.clientY > rect.bottom ||
          e.clientX < rect.left || e.clientX > rect.right
        ) {
          mouseNDC.active = false;
          return;
        }
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseNDC.active = true;
      };
      const onPointerLeave = () => {
        mouseNDC.active = false;
      };
      if (finePointer) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onPointerLeave);
      }

      const clock = new THREE.Clock();
      let rafId = 0;
      let running = false;

      const frame = () => {
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

        bands.forEach((band) => {
          // Unproject the cursor onto this band's depth plane — NDC maps
          // linearly to the view rectangle at that depth.
          let mx = 0;
          let my = 0;
          if (mouseNDC.active) {
            mx = mouseNDC.x * band.halfW;
            my = mouseNDC.y * band.halfH;
          }
          const radius = band.halfH * 0.55;

          for (let i = 0; i < band.count; i++) {
            const hx = band.home[i * 3];
            const hy = band.home[i * 3 + 1];
            let ox = band.offset[i * 2];
            let oy = band.offset[i * 2 + 1];
            let vx = band.vel[i * 2];
            let vy = band.vel[i * 2 + 1];

            // gentle ambient drift
            const phase = band.drift[i * 3];
            const speed = band.drift[i * 3 + 1];
            const amp = band.drift[i * 3 + 2];
            const dx = Math.sin(t * speed * 6 + phase) * amp;
            const dy = Math.cos(t * speed * 4.6 + phase * 1.3) * amp * 0.55;

            // mouse force field: repel + swirl, falling off with distance
            if (mouseNDC.active) {
              const px = hx + ox + dx;
              const py = hy + oy + dy;
              const rx = px - mx;
              const ry = py - my;
              const d = Math.sqrt(rx * rx + ry * ry) || 1e-4;
              if (d < radius) {
                const falloff = (1 - d / radius) ** 2;
                const f = band.force * falloff * dt;
                const nx = rx / d;
                const ny = ry / d;
                vx += nx * REPEL * f - ny * SWIRL * REPEL * f;
                vy += ny * REPEL * f + nx * SWIRL * REPEL * f;
                band.rot[i * 2 + 1] += falloff * dt * 0.12 * (nx > 0 ? 1 : -1);
              }
            }

            // damped spring back home — clouds slowly reform
            vx += -ox * SPRING_K * dt;
            vy += -oy * SPRING_K * dt;
            const decay = Math.exp(-DAMPING * dt);
            vx *= decay;
            vy *= decay;
            ox += vx * dt;
            oy += vy * dt;

            band.offset[i * 2] = ox;
            band.offset[i * 2 + 1] = oy;
            band.vel[i * 2] = vx;
            band.vel[i * 2 + 1] = vy;

            // angular velocity eases back so swirl spin settles
            band.rot[i * 2 + 1] *= decay;
            band.rot[i * 2] += band.rot[i * 2 + 1] * dt * 60;

            dummy.position.set(hx + ox + dx, hy + oy + dy, band.home[i * 3 + 2]);
            dummy.rotation.set(0, 0, band.rot[i * 2]);
            dummy.scale.setScalar(band.scale[i]);
            dummy.updateMatrix();
            band.mesh.setMatrixAt(i, dummy.matrix);
          }
          band.mesh.instanceMatrix.needsUpdate = true;
        });

        renderer.render(scene, camera);
        if (running) rafId = requestAnimationFrame(frame);
      };

      const start = () => {
        if (running) return;
        running = true;
        clock.getDelta();
        rafId = requestAnimationFrame(frame);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(rafId);
      };

      // Render only while the hero is on screen.
      const io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0.01 }
      );
      io.observe(host);

      const ro = new ResizeObserver(() => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (bands.length === 0) {
          buildBands(w, h);
          return;
        }
        bands.forEach((band) => {
          band.halfW = band.halfH * (w / h);
        });
      });
      ro.observe(host);

      if (process.env.NODE_ENV === "development") {
        (window as unknown as { __cloudsGL?: object }).__cloudsGL = {
          renderFrame: frame,
          bands,
        };
      }

      cleanup = () => {
        stop();
        io.disconnect();
        ro.disconnect();
        if (finePointer) {
          window.removeEventListener("pointermove", onPointerMove);
          document.documentElement.removeEventListener(
            "pointerleave",
            onPointerLeave
          );
        }
        bands.forEach((band) => {
          band.mesh.geometry.dispose();
          (band.mesh.material as InstanceType<typeof THREE.MeshBasicMaterial>).dispose();
          scene.remove(band.mesh);
        });
        textures.forEach((tex) => tex.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 30 }}
      aria-hidden="true"
    />
  );
}

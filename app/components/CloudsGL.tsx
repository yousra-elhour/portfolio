"use client";

import { useEffect, useRef } from "react";

// Interactive cloud field (three.js).
//
// Each sprite is an individual cloud mass cut from the site's painted cloud
// PNGs (feathered crop regions), not the whole painting — so sprites read as
// single clouds at believable sizes. Clouds never rotate: they drift with a
// slow directional wind, billow (a gentle scale breathing), and part around
// the cursor with a repel + curl force before a damped spring reforms them.
//
// three.js is imported dynamically so it ships as an async chunk after
// hydration. The loop renders only while the host is on screen, and the
// whole system disposes cleanly on unmount. Reduced-motion users keep the
// static painted clouds instead.

interface CropConfig {
  src: string;
  /** crop rectangle as fractions of the source painting */
  x: number;
  y: number;
  w: number;
  h: number;
}

// Individual cloud masses inside the two clean paintings. lowCloud3's top
// strip (streak artifacts) and highCloud2 (opaque sky patch + hard-edged
// mask blobs) are deliberately excluded — as repeated sprite textures they
// read as glitchy floating cards.
const CROPS: CropConfig[] = [
  // lowCloud1.png — one long wispy mass, center-left of the canvas
  { src: "/clouds/lowCloud1.png", x: 0.16, y: 0.38, w: 0.3, h: 0.38 },
  { src: "/clouds/lowCloud1.png", x: 0.3, y: 0.36, w: 0.28, h: 0.38 },
  { src: "/clouds/lowCloud1.png", x: 0.5, y: 0.4, w: 0.26, h: 0.3 },
  // lowCloud3.png — wide soft bank across the lower half
  { src: "/clouds/lowCloud3.png", x: 0.1, y: 0.38, w: 0.26, h: 0.36 },
  { src: "/clouds/lowCloud3.png", x: 0.3, y: 0.36, w: 0.26, h: 0.36 },
  { src: "/clouds/lowCloud3.png", x: 0.52, y: 0.36, w: 0.28, h: 0.36 },
  { src: "/clouds/lowCloud3.png", x: 0.62, y: 0.4, w: 0.3, h: 0.34 },
];

interface BandConfig {
  z: number;
  count: number;
  countCoarse: number;
  opacity: number;
  scaleMin: number;
  scaleMax: number;
  /** vertical placement range as fractions of the view half-height */
  yMin: number;
  yMax: number;
  force: number;
  /** directional wind, world units/s — nearer bands move faster (parallax) */
  wind: number;
  bob: number;
}

const BANDS: BandConfig[] = [
  // far band — big slow masses
  {
    z: -4, count: 12, countCoarse: 6, opacity: 0.32,
    scaleMin: 3.4, scaleMax: 5.8, yMin: -1.15, yMax: 0.35,
    force: 0.45, wind: 0.05, bob: 0.12,
  },
  // mid band
  {
    z: 0, count: 10, countCoarse: 5, opacity: 0.42,
    scaleMin: 2.4, scaleMax: 4.2, yMin: -1.1, yMax: 0.0,
    force: 0.8, wind: 0.09, bob: 0.09,
  },
  // near band — fastest wind and strongest reaction
  {
    z: 3, count: 8, countCoarse: 4, opacity: 0.52,
    scaleMin: 1.7, scaleMax: 3.0, yMin: -1.15, yMax: -0.35,
    force: 1.25, wind: 0.14, bob: 0.06,
  },
];

const CAMERA_Z = 8;
const SPRING_K = 2.4;
const DAMPING = 1.6;
const REPEL = 5.2;
const SWIRL = 0.55;
const BILLOW = 0.035; // ±3.5% slow scale breathing

const optimizedUrl = (src: string) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;

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

      const loadImage = async (src: string) => {
        const img = new window.Image();
        img.src = optimizedUrl(src);
        // onload rather than decode(): decode() promises can be starved
        // indefinitely in background tabs; drawImage decodes synchronously.
        await new Promise<void>((resolve, reject) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`failed to load ${src}`));
        });
        return img;
      };

      // Cut a feathered cloud crop out of a painting. The elliptical alpha
      // fade guarantees soft edges even where the crop bisects paint.
      const buildCropTexture = (
        img: HTMLImageElement,
        crop: CropConfig
      ) => {
        const sw = img.naturalWidth * crop.w;
        const sh = img.naturalHeight * crop.h;
        const width = 640;
        const height = Math.max(Math.round((sh / sw) * width), 8);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(
          img,
          img.naturalWidth * crop.x,
          img.naturalHeight * crop.y,
          sw,
          sh,
          0,
          0,
          width,
          height
        );

        // destination-in with a radial gradient, stretched to an ellipse
        ctx.globalCompositeOperation = "destination-in";
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(1, height / width);
        const fade = ctx.createRadialGradient(0, 0, 0, 0, 0, width / 2);
        fade.addColorStop(0, "rgba(0,0,0,1)");
        fade.addColorStop(0.55, "rgba(0,0,0,1)");
        fade.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fade;
        ctx.fillRect(-width / 2, (-height / 2) * (width / height), width, height * (width / height));
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return { texture, aspect: width / height };
      };

      let crops: { texture: InstanceType<typeof THREE.CanvasTexture>; aspect: number }[];
      try {
        const sources = Array.from(new Set(CROPS.map((c) => c.src)));
        const images = new Map(
          await Promise.all(
            sources.map(async (src) => [src, await loadImage(src)] as const)
          )
        );
        crops = CROPS.map((c) => buildCropTexture(images.get(c.src)!, c));
      } catch {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      if (disposed) {
        crops.forEach((c) => c.texture.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }

      // Sprites are grouped into one InstancedMesh per (band, crop) pair.
      interface SpriteGroup {
        mesh: InstanceType<typeof THREE.InstancedMesh>;
        count: number;
        z: number;
        force: number;
        wind: number;
        bob: number;
        aspect: number;
        home: Float32Array; // x, y, z per instance
        offset: Float32Array; // x, y displacement
        vel: Float32Array;
        drift: Float32Array; // phase, billowSpeed
        scale: Float32Array;
        mirror: Float32Array; // ±1 horizontal flip for variety
        halfW: number;
        halfH: number;
      }

      const dummy = new THREE.Object3D();
      const groups: SpriteGroup[] = [];

      // Groups are seeded from real host dimensions. If the component mounts
      // in a background tab the host can measure 0x0 — in that case building
      // is deferred to the first ResizeObserver callback with a real size.
      const buildGroups = (width: number, height: number) => {
        const viewAspect = width / Math.max(height, 1);

        BANDS.forEach((cfg, bandIndex) => {
          const total = finePointer ? cfg.count : cfg.countCoarse;
          const dist = CAMERA_Z - cfg.z;
          const halfH = Math.tan((55 * Math.PI) / 360) * dist;
          const halfW = halfH * viewAspect;

          // deal sprites across crops so no two neighbours repeat a texture
          const perCrop = new Array(crops.length).fill(0);
          for (let i = 0; i < total; i++) {
            perCrop[(i + bandIndex) % crops.length]++;
          }

          perCrop.forEach((count, cropIndex) => {
            if (count === 0) return;
            const { texture, aspect } = crops[cropIndex];

            const geometry = new THREE.PlaneGeometry(aspect, 1);
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              opacity: cfg.opacity,
              depthTest: false,
              depthWrite: false,
              side: THREE.DoubleSide, // mirrored sprites stay visible
            });
            const mesh = new THREE.InstancedMesh(geometry, material, count);
            mesh.renderOrder = bandIndex;
            mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

            const group: SpriteGroup = {
              mesh, count, z: cfg.z, force: cfg.force, wind: cfg.wind,
              bob: cfg.bob, aspect,
              home: new Float32Array(count * 3),
              offset: new Float32Array(count * 2),
              vel: new Float32Array(count * 2),
              drift: new Float32Array(count * 2),
              scale: new Float32Array(count),
              mirror: new Float32Array(count),
              halfW, halfH,
            };

            for (let i = 0; i < count; i++) {
              group.home[i * 3] = (Math.random() * 2 - 1) * halfW * 1.2;
              const yr = cfg.yMin + Math.random() * (cfg.yMax - cfg.yMin);
              group.home[i * 3 + 1] = yr * halfH;
              group.home[i * 3 + 2] = cfg.z + (Math.random() * 2 - 1) * 0.5;
              group.drift[i * 2] = Math.random() * Math.PI * 2;
              group.drift[i * 2 + 1] = 0.05 + Math.random() * 0.06;
              group.scale[i] =
                cfg.scaleMin + Math.random() * (cfg.scaleMax - cfg.scaleMin);
              group.mirror[i] = Math.random() < 0.5 ? -1 : 1;
            }

            scene.add(mesh);
            groups.push(group);
          });
        });
      };

      if (host.clientWidth > 0 && host.clientHeight > 0) {
        buildGroups(host.clientWidth, host.clientHeight);
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

        groups.forEach((group) => {
          // Unproject the cursor onto this band's depth plane — NDC maps
          // linearly to the view rectangle at that depth.
          let mx = 0;
          let my = 0;
          if (mouseNDC.active) {
            mx = mouseNDC.x * group.halfW;
            my = mouseNDC.y * group.halfH;
          }
          const radius = group.halfH * 0.55;

          for (let i = 0; i < group.count; i++) {
            // directional wind: homes migrate and wrap past the view edge,
            // so the sky is always slowly moving even without the cursor
            let hx = group.home[i * 3] + group.wind * dt;
            const spriteHalfW = group.scale[i] * group.aspect * 0.55;
            const wrapX = group.halfW * 1.05 + spriteHalfW;
            if (hx > wrapX) hx = -wrapX;
            group.home[i * 3] = hx;
            const hy = group.home[i * 3 + 1];

            let ox = group.offset[i * 2];
            let oy = group.offset[i * 2 + 1];
            let vx = group.vel[i * 2];
            let vy = group.vel[i * 2 + 1];

            // gentle vertical bob — no rotation, ever
            const phase = group.drift[i * 2];
            const dy = Math.sin(t * 0.25 + phase * 1.7) * group.bob;

            // mouse force field: repel + curl, falling off with distance
            if (mouseNDC.active) {
              const px = hx + ox;
              const py = hy + oy + dy;
              const rx = px - mx;
              const ry = py - my;
              const d = Math.sqrt(rx * rx + ry * ry) || 1e-4;
              if (d < radius) {
                const falloff = (1 - d / radius) ** 2;
                const f = group.force * falloff * dt;
                const nx = rx / d;
                const ny = ry / d;
                vx += nx * REPEL * f - ny * SWIRL * REPEL * f;
                vy += ny * REPEL * f + nx * SWIRL * REPEL * f;
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

            group.offset[i * 2] = ox;
            group.offset[i * 2 + 1] = oy;
            group.vel[i * 2] = vx;
            group.vel[i * 2 + 1] = vy;

            // billow: slow scale breathing, phase-offset per cloud
            const billowSpeed = group.drift[i * 2 + 1];
            const s =
              group.scale[i] * (1 + Math.sin(t * billowSpeed + phase) * BILLOW);

            dummy.position.set(hx + ox, hy + oy + dy, group.home[i * 3 + 2]);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(s * group.mirror[i], s, 1);
            dummy.updateMatrix();
            group.mesh.setMatrixAt(i, dummy.matrix);
          }

          group.mesh.instanceMatrix.needsUpdate = true;
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
        if (groups.length === 0) {
          buildGroups(w, h);
          return;
        }
        groups.forEach((group) => {
          group.halfW = group.halfH * (w / h);
        });
      });
      ro.observe(host);

      if (process.env.NODE_ENV === "development") {
        (window as unknown as { __cloudsGL?: object }).__cloudsGL = {
          renderFrame: frame,
          groups,
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
        groups.forEach((group) => {
          group.mesh.geometry.dispose();
          (group.mesh.material as InstanceType<typeof THREE.MeshBasicMaterial>).dispose();
          scene.remove(group.mesh);
        });
        crops.forEach((c) => c.texture.dispose());
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

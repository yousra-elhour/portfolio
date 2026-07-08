"use client";

import { useEffect, useRef } from "react";
import { optimizedImageUrl } from "../utils/preload";

// Interactive cloud layer (three.js): fluid-distorted paintings.
//
// The painted cloud strips render at their natural full-screen size (like
// the DOM layers), and a small GPU fluid simulation deforms their texture:
//
//  - velocity field: mouse strokes splat velocity along the motion vector;
//    the field advects ITSELF semi-Lagrangian style (Stam's stable fluids),
//    which is what makes trails curl like real vapor.
//  - displacement field: advected by the velocity and slowly healed, so
//    stroking a cloud drags wisps out of it that linger, swirl, and then
//    relax back into the original painting.
//  - the display shader adds faint time-varying turbulence so the vapor is
//    never perfectly still, and smears samples along the local flow for a
//    feathered, wispy tear instead of a rigid shift.
//
// Nothing translates: clouds deform in place. Input is velocity-based, so
// a resting cursor does nothing — only movement stirs the cloud.

const SIM_WIDTH = 192; // fluid grid width; height follows the host aspect
const VELOCITY_DISSIPATION = 0.96; // per-second-ish decay of stirred motion
const DISPLACEMENT_HEAL = 0.32; // fraction healed per second — cloud reforms
const DISPLACEMENT_GAIN = 0.75; // how strongly flow drags the texture
const SPLAT_RADIUS = 0.11; // stroke brush size, fraction of view height
const SPLAT_FORCE = 0.9; // stroke strength (kept subtle)
const MAX_DISPLACEMENT = 0.22; // clamp so wisps never tear the painting apart

interface LayerConfig {
  src: string;
  opacity: number;
  /** displacement multiplier — nearer layers deform more */
  strength: number;
  /** ambient turbulence amplitude (UV units) */
  turbulence: number;
  /** GSAP-equivalent wind drift (px/scale, per breakpoint: [mobile, tablet, desktop]) */
  from: { scale: number[]; x: number[]; y: number[] };
  to: { scale: number[]; x: number[]; y: number[] };
  duration: number;
  /** mouse parallax strength in px, like the old DOM layers */
  parallax: [number, number];
}

// These are the site's existing foreground cloud layers — same textures,
// same opacities, and the same slow wind choreography the GSAP version
// used (HeroForegroundClouds). The GL version replaces those DOM layers
// one-for-one and adds the fluid deformation on top of the drift.
const LAYERS: LayerConfig[] = [
  {
    src: "/clouds/lowCloud3.png", opacity: 0.7, strength: 1.0, turbulence: 0.003,
    from: { scale: [3, 2.5, 2], x: [0, 200, 350], y: [100, 150, 200] },
    to: { scale: [3.5, 3, 2.5], x: [-100, 50, 20], y: [80, 130, 180] },
    duration: 30, parallax: [10, 5],
  },
  {
    src: "/clouds/lowCloud1.png", opacity: 0.4, strength: 0.85, turbulence: 0.002,
    from: { scale: [2.5, 2, 1.5], x: [-50, 150, 300], y: [100, 150, 200] },
    to: { scale: [3, 2.5, 1.2], x: [-150, 0, 20], y: [80, 130, 180] },
    duration: 33, parallax: [10, 5],
  },
  {
    src: "/clouds/highCloud2.png", opacity: 0.6, strength: 0.35, turbulence: 0.002,
    from: { scale: [3, 2.5, 2], x: [-100, 100, 200], y: [50, 80, 100] },
    to: { scale: [3.5, 3, 2], x: [-200, -50, -100], y: [30, 70, 100] },
    duration: 36, parallax: [15, 8],
  },
  {
    src: "/clouds/highCloud1.png", opacity: 0.8, strength: 0.4, turbulence: 0.0015,
    from: { scale: [3, 2.5, 2], x: [-150, 50, 100], y: [-50, -50, -70] },
    to: { scale: [3.5, 3, 2], x: [-250, -100, -200], y: [-70, -70, -100] },
    duration: 39, parallax: [15, 8],
  },
];

const breakpointIndex = (width: number) =>
  width < 768 ? 0 : width < 1024 ? 1 : 2;

const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// velocity: self-advection + dissipation + mouse splat
const VELOCITY_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVel;
  uniform float uDt;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec2 uMouseVel;
  uniform float uRadius;

  void main() {
    vec2 vel = texture2D(uVel, vUv).xy;
    vec2 back = vUv - vel * uDt;
    vec2 v = texture2D(uVel, back).xy;
    v *= pow(${VELOCITY_DISSIPATION.toFixed(4)}, uDt * 60.0);

    vec2 d = vUv - uMouse;
    d.x *= uAspect;
    float g = exp(-dot(d, d) / (uRadius * uRadius));
    v += uMouseVel * g * uDt;

    gl_FragColor = vec4(v, 0.0, 1.0);
  }
`;

// displacement: advected by velocity, fed by it, healing toward zero
const DISPLACEMENT_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uDisp;
  uniform sampler2D uVel;
  uniform float uDt;

  void main() {
    vec2 vel = texture2D(uVel, vUv).xy;
    vec2 back = vUv - vel * uDt;
    vec2 disp = texture2D(uDisp, back).xy;
    disp *= exp(-${DISPLACEMENT_HEAL.toFixed(4)} * uDt);
    disp += vel * uDt * ${DISPLACEMENT_GAIN.toFixed(4)};
    float len = length(disp);
    if (len > ${MAX_DISPLACEMENT.toFixed(4)}) {
      disp *= ${MAX_DISPLACEMENT.toFixed(4)} / len;
    }
    gl_FragColor = vec4(disp, 0.0, 1.0);
  }
`;

// display: cover-fit painting deformed by the flow. What separates a cloud
// from a paint smudge: the drag breaks into irregular turbulent wisps
// (noise-perturbed taps, detail appearing only where the vapor is
// disturbed) and stretched vapor THINS as it disperses (alpha falls with
// displacement) instead of keeping full smeared density.
const LAYER_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform sampler2D uDisp;
  uniform sampler2D uVel;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;
  uniform vec2 uTranslate; // wind drift + parallax, in screen-UV units
  uniform float uZoom;     // wind drift scale, about the viewport center
  uniform float uOpacity;
  uniform float uStrength;
  uniform float uTurbulence;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  // two-octave turbulence vector, centered on zero
  vec2 turb(vec2 p, float t) {
    return vec2(
      vnoise(p * 6.0 + vec2(t * 0.05, 0.0)) +
        0.5 * vnoise(p * 14.0 + vec2(0.0, t * 0.08)) - 0.75,
      vnoise(p * 6.0 + vec2(31.7, t * 0.06)) +
        0.5 * vnoise(p * 14.0 + vec2(t * 0.07, 53.1)) - 0.75
    );
  }

  void main() {
    vec2 disp = texture2D(uDisp, vUv).xy * uStrength;
    vec2 vel = texture2D(uVel, vUv).xy;
    float stir = length(disp);

    vec2 suv = (vUv - uTranslate - 0.5) / uZoom + 0.5;
    vec2 mapUv = suv * uUvScale + uUvOffset;

    // ambient vapor: gentle warps — the cloud shimmers in place
    vec2 amb = vec2(
      sin(mapUv.y * 21.0 + uTime * 0.21) + sin(mapUv.y * 9.0 - uTime * 0.13),
      sin(mapUv.x * 17.0 + uTime * 0.17) + sin(mapUv.x * 7.0 + uTime * 0.11)
    ) * uTurbulence;

    // wisp turbulence: fine-scale curling detail, present only where the
    // vapor is actually disturbed — the untouched painting stays pristine
    vec2 wisp = turb(mapUv, uTime) * stir * 0.9;

    vec2 base = mapUv - amb;
    vec2 smear = disp + vel * 0.05 * uStrength;

    // taps scattered along the flow, each bent by its own turbulence so
    // the drag feathers into ragged wisps instead of one coherent streak.
    // rgb is alpha-weighted: taps landing on transparent paint must not
    // drag the hidden matte color in (that read as weird dirty hues).
    vec4 acc = vec4(0.0);
    vec4 s0 = texture2D(uMap, base - smear * 0.7 - wisp * 0.25);
    vec4 s1 = texture2D(uMap, base - smear * 0.85 + wisp * 0.45);
    vec4 s2 = texture2D(uMap, base - smear * 1.0 - wisp * 0.6);
    vec4 s3 = texture2D(uMap, base - smear * 1.15 + wisp * 0.8);
    vec4 s4 = texture2D(uMap, base - smear * 1.3 - wisp * 1.0);
    acc.rgb += s0.rgb * s0.a; acc.a += s0.a;
    acc.rgb += s1.rgb * s1.a; acc.a += s1.a;
    acc.rgb += s2.rgb * s2.a; acc.a += s2.a;
    acc.rgb += s3.rgb * s3.a; acc.a += s3.a;
    acc.rgb += s4.rgb * s4.a; acc.a += s4.a;
    vec3 rgb = acc.a > 1e-4 ? acc.rgb / acc.a : vec3(0.0);

    // stretched vapor disperses: thin the cloud where it's pulled hardest
    float thin = clamp(stir * 9.0, 0.0, 1.0);
    float alpha = (acc.a * 0.2) * uOpacity * (1.0 - thin * 0.5);

    gl_FragColor = vec4(rgb, alpha);
  }
`;

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
      if (!renderer.capabilities.isWebGL2) {
        // half-float render targets are guaranteed in WebGL2; anything older
        // keeps the static painted clouds.
        renderer.dispose();
        return;
      }

      const finePointer = window.matchMedia("(pointer: fine)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 0.9s ease-out;";
      renderer.autoClear = false;
      host.appendChild(renderer.domElement);

      const loadTexture = async (src: string) => {
        const img = new window.Image();
        // same optimizer variant preload.ts warms — served straight from cache
        img.src = optimizedImageUrl(src);
        await new Promise<void>((resolve, reject) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`failed to load ${src}`));
        });
        const width = 2048;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * width);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        // no sRGB decode: the shader passes pixels through untouched, so
        // decoding without re-encoding would render darker/oversaturated
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        return { texture, aspect: canvas.width / canvas.height };
      };

      let paintings: { texture: InstanceType<typeof THREE.CanvasTexture>; aspect: number }[];
      try {
        paintings = await Promise.all(LAYERS.map((l) => loadTexture(l.src)));
      } catch {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      if (disposed) {
        paintings.forEach((p) => p.texture.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }

      // ---- simulation render targets (ping-pong pairs) ----
      const makeTarget = (w: number, h: number) =>
        new THREE.WebGLRenderTarget(w, h, {
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          wrapS: THREE.ClampToEdgeWrapping,
          wrapT: THREE.ClampToEdgeWrapping,
          depthBuffer: false,
        });

      let simW = SIM_WIDTH;
      let simH = Math.max(
        Math.round((host.clientHeight / Math.max(host.clientWidth, 1)) * SIM_WIDTH),
        16
      );
      let velA = makeTarget(simW, simH);
      let velB = makeTarget(simW, simH);
      let dispA = makeTarget(simW, simH);
      let dispB = makeTarget(simW, simH);

      const simScene = new THREE.Scene();
      const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const simGeometry = new THREE.PlaneGeometry(2, 2);

      const velMaterial = new THREE.ShaderMaterial({
        vertexShader: QUAD_VERT,
        fragmentShader: VELOCITY_FRAG,
        uniforms: {
          uVel: { value: null },
          uDt: { value: 0.016 },
          uAspect: { value: 1 },
          uMouse: { value: new THREE.Vector2(-10, -10) },
          uMouseVel: { value: new THREE.Vector2(0, 0) },
          uRadius: { value: SPLAT_RADIUS },
        },
        depthTest: false,
        depthWrite: false,
      });
      const dispMaterial = new THREE.ShaderMaterial({
        vertexShader: QUAD_VERT,
        fragmentShader: DISPLACEMENT_FRAG,
        uniforms: {
          uDisp: { value: null },
          uVel: { value: null },
          uDt: { value: 0.016 },
        },
        depthTest: false,
        depthWrite: false,
      });
      const simMesh = new THREE.Mesh(simGeometry, velMaterial);
      simScene.add(simMesh);

      // ---- display layers ----
      const displayScene = new THREE.Scene();
      const layerMaterials: InstanceType<typeof THREE.ShaderMaterial>[] = [];

      LAYERS.forEach((cfg, i) => {
        const material = new THREE.ShaderMaterial({
          vertexShader: QUAD_VERT,
          fragmentShader: LAYER_FRAG,
          uniforms: {
            uMap: { value: paintings[i].texture },
            uDisp: { value: null },
            uVel: { value: null },
            uUvScale: { value: new THREE.Vector2(1, 1) },
            uUvOffset: { value: new THREE.Vector2(0, 0) },
            uTranslate: { value: new THREE.Vector2(0, 0) },
            uZoom: { value: 1 },
            uOpacity: { value: cfg.opacity },
            uStrength: { value: cfg.strength },
            uTurbulence: { value: cfg.turbulence },
            uTime: { value: 0 },
          },
          transparent: true,
          depthTest: false,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(simGeometry, material);
        mesh.renderOrder = i;
        displayScene.add(mesh);
        layerMaterials.push(material);
      });

      // object-cover fit: painting fills the host, cropping the overflow.
      // (uv 0..1 spans the host; scale/offset map it into painting space)
      const fitLayers = () => {
        const hostAspect =
          host.clientWidth / Math.max(host.clientHeight, 1);
        layerMaterials.forEach((material, i) => {
          const imgAspect = paintings[i].aspect;
          const scale = material.uniforms.uUvScale.value as { x: number; y: number };
          const offset = material.uniforms.uUvOffset.value as { x: number; y: number };
          if (hostAspect > imgAspect) {
            scale.x = 1;
            scale.y = imgAspect / hostAspect;
            offset.x = 0;
            offset.y = (1 - scale.y) / 2;
          } else {
            scale.x = hostAspect / imgAspect;
            scale.y = 1;
            offset.x = (1 - scale.x) / 2;
            offset.y = 0;
          }
        });
      };
      fitLayers();

      // ---- pointer: velocity-based input, in host uv space ----
      const mouse = { x: -10, y: -10, px: -10, py: -10, has: false };
      const onPointerMove = (e: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        if (
          e.clientY < rect.top || e.clientY > rect.bottom ||
          e.clientX < rect.left || e.clientX > rect.right
        ) {
          mouse.has = false;
          return;
        }
        mouse.x = (e.clientX - rect.left) / rect.width;
        mouse.y = 1 - (e.clientY - rect.top) / rect.height;
        if (!mouse.has) {
          mouse.px = mouse.x;
          mouse.py = mouse.y;
          mouse.has = true;
        }
      };
      const onPointerLeave = () => {
        mouse.has = false;
      };
      if (finePointer) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onPointerLeave);
      }

      const clock = new THREE.Clock();
      let rafId = 0;
      let running = false;
      let revealed = false;

      // smoothed pointer for the parallax (matches the old GSAP easing feel)
      const parallax = { x: 0, y: 0 };

      const frame = () => {
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

        const hostW = Math.max(host.clientWidth, 1);
        const hostH = Math.max(host.clientHeight, 1);
        const bp = breakpointIndex(hostW);

        // ease the parallax toward the pointer (normalized -1..1 from center)
        const targetPx = mouse.has ? mouse.x * 2 - 1 : 0;
        const targetPy = mouse.has ? mouse.y * 2 - 1 : 0;
        const k = 1 - Math.exp(-2.5 * dt);
        parallax.x += (targetPx - parallax.x) * k;
        parallax.y += (targetPy - parallax.y) * k;

        // stroke velocity in uv/s, clamped so fast flicks stay graceful
        const mv = velMaterial.uniforms.uMouseVel.value as {
          x: number; y: number; set: (x: number, y: number) => void;
        };
        if (mouse.has && dt > 0) {
          let vx = ((mouse.x - mouse.px) / dt) * SPLAT_FORCE;
          let vy = ((mouse.y - mouse.py) / dt) * SPLAT_FORCE;
          const len = Math.hypot(vx, vy);
          const cap = 1.2;
          if (len > cap) {
            vx *= cap / len;
            vy *= cap / len;
          }
          mv.set(vx, vy);
          (velMaterial.uniforms.uMouse.value as { set: (x: number, y: number) => void })
            .set(mouse.x, mouse.y);
        } else {
          mv.set(0, 0);
        }
        mouse.px = mouse.x;
        mouse.py = mouse.y;

        velMaterial.uniforms.uDt.value = dt;
        velMaterial.uniforms.uAspect.value = simW / simH;
        dispMaterial.uniforms.uDt.value = dt;

        // velocity pass
        simMesh.material = velMaterial;
        velMaterial.uniforms.uVel.value = velA.texture;
        renderer.setRenderTarget(velB);
        renderer.render(simScene, simCamera);
        [velA, velB] = [velB, velA];

        // displacement pass
        simMesh.material = dispMaterial;
        dispMaterial.uniforms.uVel.value = velA.texture;
        dispMaterial.uniforms.uDisp.value = dispA.texture;
        renderer.setRenderTarget(dispB);
        renderer.render(simScene, simCamera);
        [dispA, dispB] = [dispB, dispA];

        // display: wind drift (GSAP-equivalent yoyo between from/to),
        // parallax, and the fluid fields
        layerMaterials.forEach((material, i) => {
          const cfg = LAYERS[i];

          // sine-eased yoyo phase, like gsap yoyo with sine.inOut
          const cycle = (t / cfg.duration) % 2;
          const lin = cycle < 1 ? cycle : 2 - cycle;
          const e = 0.5 - 0.5 * Math.cos(Math.PI * lin);

          const scale = cfg.from.scale[bp] + (cfg.to.scale[bp] - cfg.from.scale[bp]) * e;
          const xPx =
            cfg.from.x[bp] + (cfg.to.x[bp] - cfg.from.x[bp]) * e +
            parallax.x * cfg.parallax[0];
          const yPx =
            cfg.from.y[bp] + (cfg.to.y[bp] - cfg.from.y[bp]) * e -
            parallax.y * cfg.parallax[1];

          // the image's on-screen displacement in uv (screen uv is y-up,
          // DOM px are y-down); the shader inverts it before the zoom, so
          // positions match the old GSAP translate+scale exactly
          (material.uniforms.uTranslate.value as { set: (x: number, y: number) => void })
            .set(xPx / hostW, -yPx / hostH);
          material.uniforms.uZoom.value = scale;

          material.uniforms.uDisp.value = dispA.texture;
          material.uniforms.uVel.value = velA.texture;
          material.uniforms.uTime.value = t;
        });
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(displayScene, simCamera);
        if (!revealed) {
          revealed = true;
          renderer.domElement.style.opacity = "1";
        }

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
        const newSimH = Math.max(Math.round((h / w) * SIM_WIDTH), 16);
        if (newSimH !== simH) {
          simH = newSimH;
          [velA, velB, dispA, dispB].forEach((rt) => rt.dispose());
          velA = makeTarget(simW, simH);
          velB = makeTarget(simW, simH);
          dispA = makeTarget(simW, simH);
          dispB = makeTarget(simW, simH);
        }
        fitLayers();
      });
      ro.observe(host);

      if (process.env.NODE_ENV === "development") {
        (window as unknown as { __cloudsGL?: object }).__cloudsGL = {
          renderFrame: frame,
          layers: layerMaterials,
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
        [velA, velB, dispA, dispB].forEach((rt) => rt.dispose());
        simGeometry.dispose();
        velMaterial.dispose();
        dispMaterial.dispose();
        layerMaterials.forEach((m) => m.dispose());
        paintings.forEach((p) => p.texture.dispose());
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

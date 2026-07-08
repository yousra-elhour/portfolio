"use client";

import { useEffect, useRef } from "react";

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
const DISPLACEMENT_HEAL = 0.4; // fraction healed per second — cloud reforms
const DISPLACEMENT_GAIN = 0.55; // how strongly flow drags the texture
const SPLAT_RADIUS = 0.11; // stroke brush size, fraction of view height
const SPLAT_FORCE = 0.55; // stroke strength (kept subtle)
const MAX_DISPLACEMENT = 0.16; // clamp so wisps never tear the painting apart

interface LayerConfig {
  src: string;
  opacity: number;
  /** displacement multiplier — nearer layers deform more */
  strength: number;
  /** ambient turbulence amplitude (UV units) */
  turbulence: number;
  /** shifts the painting down the screen (UV fraction) */
  yShift: number;
}

const LAYERS: LayerConfig[] = [
  { src: "/clouds/lowCloud1.png", opacity: 0.5, strength: 0.7, turbulence: 0.002, yShift: 0.16 },
  { src: "/clouds/lowCloud3.png", opacity: 0.75, strength: 1.0, turbulence: 0.003, yShift: 0.08 },
];

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

// display: cover-fit painting, offset by displacement + gentle turbulence,
// with a short smear along the local flow for feathered wisps
const LAYER_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform sampler2D uDisp;
  uniform sampler2D uVel;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;
  uniform float uOpacity;
  uniform float uStrength;
  uniform float uTurbulence;
  uniform float uTime;

  void main() {
    vec2 disp = texture2D(uDisp, vUv).xy * uStrength;
    vec2 vel = texture2D(uVel, vUv).xy;

    vec2 mapUv = vUv * uUvScale + uUvOffset;

    // ambient vapor: two slow, layered warps — the cloud shimmers in place
    vec2 amb = vec2(
      sin(mapUv.y * 21.0 + uTime * 0.21) + sin(mapUv.y * 9.0 - uTime * 0.13),
      sin(mapUv.x * 17.0 + uTime * 0.17) + sin(mapUv.x * 7.0 + uTime * 0.11)
    ) * uTurbulence;

    vec2 base = mapUv - amb;

    // 5-tap smear along displacement + flow: wisps feather instead of shift
    vec2 smear = disp + vel * 0.05 * uStrength;
    vec4 c = vec4(0.0);
    c += texture2D(uMap, base - smear * 0.6);
    c += texture2D(uMap, base - smear * 0.8);
    c += texture2D(uMap, base - smear * 1.0);
    c += texture2D(uMap, base - smear * 1.25);
    c += texture2D(uMap, base - smear * 1.5);
    c *= 0.2;

    gl_FragColor = vec4(c.rgb, c.a * uOpacity);
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
        "position:absolute;inset:0;width:100%;height:100%;";
      renderer.autoClear = false;
      host.appendChild(renderer.domElement);

      const loadTexture = async (src: string) => {
        const img = new window.Image();
        img.src = `/_next/image?url=${encodeURIComponent(src)}&w=2048&q=75`;
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
            offset.y = (1 - scale.y) / 2 + LAYERS[i].yShift;
          } else {
            scale.x = hostAspect / imgAspect;
            scale.y = 1;
            offset.x = (1 - scale.x) / 2;
            offset.y = LAYERS[i].yShift;
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

      const frame = () => {
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

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

        // display
        layerMaterials.forEach((material) => {
          material.uniforms.uDisp.value = dispA.texture;
          material.uniforms.uVel.value = velA.texture;
          material.uniforms.uTime.value = t;
        });
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(displayScene, simCamera);

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

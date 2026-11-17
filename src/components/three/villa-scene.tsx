"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sky } from "@react-three/drei";
import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { MotionValue } from "motion/react";

/**
 * An illustrative modern villa stepped into a Buda hillside at blue hour, built from code
 * (no model files). The camera flies along a spline driven by scroll progress: the hill,
 * the pool terrace, through the open glass door into the living floor, up the stair void,
 * through the bedroom, out over the balcony and up above the city lights.
 */

type V3 = [number, number, number];

// Camera stations: [position, look-at target]. Order is the scroll story.
const STATIONS: [V3, V3][] = [
  [[36, 20, 54], [-9, 6, 0]], //  0 aerial; villa sits right of the headline
  [[22, 8, 34], [2, 3, 6]], //    1 descend toward the pool terrace
  [[8, 2.4, 16.5], [2, 4, 0]], // 2 pool edge, looking up at the glass
  [[3, 4.8, 8.2], [1, 4.7, -2]], // 3 at the open slider
  [[1.5, 4.8, 1.5], [-6, 4.5, -5]], // 4 inside: kitchen, fireplace
  [[-5.8, 4.9, 0.2], [-7.4, 8.6, -5.5]], // 5 stair foot, looking up the void
  [[-7.2, 8.5, -3.8], [0, 8.1, -2]], // 6 top of the stair, bedroom floor
  [[-1.5, 8.4, 1.8], [1, 7.8, 20]], // 7 bedroom glass, the view
  [[-1, 8.4, 5.9], [0, 7, 40]], // 8 out on the balcony
  [[0, 13.5, 9], [0, 2, 70]], //   9 rise above the roof, city lights
  [[-34, 22, 54], [0, 4, 0]], //  10 pull back
];

export const STATION_COUNT = STATIONS.length;

const C = {
  render: "#ece8df",
  trim: "#1b1b1d",
  wood: "#7b5b3f",
  stone: "#3b3936",
  fabric: "#d4cdc1",
  deck: "#9c8b78",
  grass: "#1f2a1c",
  warm: "#ffc98a",
};

function useMats() {
  return useMemo(
    () => ({
      render: new THREE.MeshStandardMaterial({ color: C.render, roughness: 0.82 }),
      trim: new THREE.MeshStandardMaterial({ color: C.trim, roughness: 0.35, metalness: 0.7 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#a9c2d6", transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0.2, envMapIntensity: 2, side: THREE.DoubleSide, depthWrite: false }),
      wood: new THREE.MeshStandardMaterial({ color: C.wood, roughness: 0.55 }),
      stone: new THREE.MeshStandardMaterial({ color: C.stone, roughness: 0.6, metalness: 0.1 }),
      fabric: new THREE.MeshStandardMaterial({ color: C.fabric, roughness: 1 }),
      darkFabric: new THREE.MeshStandardMaterial({ color: "#4a4540", roughness: 1 }),
      deck: new THREE.MeshStandardMaterial({ color: C.deck, roughness: 0.75 }),
      grass: new THREE.MeshStandardMaterial({ color: C.grass, roughness: 1 }),
      leaf: new THREE.MeshStandardMaterial({ color: "#26361f", roughness: 0.9 }),
      bark: new THREE.MeshStandardMaterial({ color: "#3a2d22", roughness: 1 }),
      water: new THREE.MeshPhysicalMaterial({ color: "#0f8ea3", emissive: "#0a5f70", emissiveIntensity: 1.1, roughness: 0.05, metalness: 0.1, clearcoat: 1 }),
      lamp: new THREE.MeshStandardMaterial({ color: C.warm, emissive: C.warm, emissiveIntensity: 6 }),
      spa: new THREE.MeshStandardMaterial({ color: "#3a2a1c", emissive: "#ffb46b", emissiveIntensity: 0.3, roughness: 0.8 }),
      fire: new THREE.MeshStandardMaterial({ color: "#ff8a3d", emissive: "#ff6a1a", emissiveIntensity: 8 }),
      art: new THREE.MeshStandardMaterial({ color: "#b5563c", roughness: 0.9 }),
      art2: new THREE.MeshStandardMaterial({ color: "#c9a96e", roughness: 0.9 }),
      linen: new THREE.MeshStandardMaterial({ color: "#f4f1ea", roughness: 1 }),
      black: new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.3, metalness: 0.4 }),
    }),
    [],
  );
}
type Mats = ReturnType<typeof useMats>;

function Box({ p, s, m, cast = true, receive = true }: { p: V3; s: V3; m: THREE.Material; cast?: boolean; receive?: boolean }) {
  return (
    <mesh position={p} castShadow={cast} receiveShadow={receive} material={m}>
      <boxGeometry args={s} />
    </mesh>
  );
}

/** Glass wall along x at depth z, with an open gap [gx0, gx1] and black mullions every ~2 m. */
function GlassFront({ x0, x1, y0, y1, z, gap, m }: { x0: number; x1: number; y0: number; y1: number; z: number; gap?: [number, number]; m: Mats }) {
  const h = y1 - y0;
  const panes: [number, number][] = gap ? [[x0, gap[0]], [gap[1], x1]] : [[x0, x1]];
  const mullions: number[] = [];
  for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.round((x1 - x0) / 2)) mullions.push(x);
  return (
    <group>
      {panes.map(([a, b], i) => (
        <mesh key={i} position={[(a + b) / 2, y0 + h / 2, z]} material={m.glass}>
          <planeGeometry args={[b - a, h]} />
        </mesh>
      ))}
      {mullions.filter((x) => !gap || x <= gap[0] + 0.01 || x >= gap[1] - 0.01).map((x, i) => (
        <Box key={i} p={[x, y0 + h / 2, z]} s={[0.06, h, 0.08]} m={m.trim} receive={false} />
      ))}
      <Box p={[(x0 + x1) / 2, y0 + 0.04, z]} s={[x1 - x0, 0.08, 0.1]} m={m.trim} />
    </group>
  );
}

function Lamp({ p, intensity = 6, distance = 9 }: { p: V3; intensity?: number; distance?: number }) {
  const m = useMats();
  return (
    <group position={p}>
      <mesh material={m.lamp}>
        <sphereGeometry args={[0.16, 16, 12]} />
      </mesh>
      <Box p={[0, 0.5, 0]} s={[0.012, 1, 0.012]} m={m.black} cast={false} />
      <pointLight color={C.warm} intensity={intensity} distance={distance} decay={1.6} />
    </group>
  );
}

function Tree({ p, s = 1 }: { p: V3; s?: number }) {
  const m = useMats();
  return (
    <group position={p} scale={s}>
      <Box p={[0, 1.2, 0]} s={[0.25, 2.4, 0.25]} m={m.bark} />
      <mesh position={[0, 3.6, 0]} castShadow material={m.leaf}>
        <icosahedronGeometry args={[1.7, 1]} />
      </mesh>
      <mesh position={[0.6, 4.6, 0.2]} castShadow material={m.leaf}>
        <icosahedronGeometry args={[1.1, 1]} />
      </mesh>
    </group>
  );
}

function Villa() {
  const m = useMats();
  // Level 0 (base + pool terrace) y 0..3, level 1 (living) floor 3..6.6, level 2 (bedrooms) floor 6.6..9.8.
  return (
    <group>
      {/* Plinth and terrace */}
      <Box p={[1, -0.25, 3]} s={[30, 0.5, 26]} m={m.deck} cast={false} />
      {/* Pool */}
      <Box p={[3, -0.05, 11.5]} s={[13, 0.2, 4.2]} m={m.water} cast={false} />
      <Box p={[3, 0.06, 9.3]} s={[13.4, 0.12, 0.2]} m={m.render} />
      <Box p={[3, 0.06, 13.7]} s={[13.4, 0.12, 0.2]} m={m.render} />
      <pointLight position={[3, 0.4, 11.5]} color="#3fd2e6" intensity={8} distance={9} decay={1.5} />
      {/* Loungers */}
      {[-1, 1.4].map((x) => (
        <group key={x} position={[x - 5, 0.25, 11]}>
          <Box p={[0, 0, 0]} s={[0.8, 0.12, 2]} m={m.fabric} />
          <Box p={[0, 0.3, -0.85]} s={[0.8, 0.6, 0.12]} m={m.fabric} />
        </group>
      ))}

      {/* Level 0: garage / spa, glass band */}
      <Box p={[0, 1.5, -1]} s={[16, 3, 12]} m={m.render} />
      <Box p={[0, 1.5, 5.02]} s={[12, 1.6, 0.04]} m={m.glass} cast={false} receive={false} />
      <Box p={[0, 1.5, 5.05]} s={[12, 1.6, 0.02]} m={m.spa} cast={false} receive={false} />
      <pointLight position={[0, 1.5, 6]} color={C.warm} intensity={4} distance={8} decay={1.8} />

      {/* Level 1: living. Floor, ceiling, back and side walls; glass front with an open slider. */}
      <Box p={[1, 3.0, -1]} s={[18, 0.24, 13]} m={m.wood} />
      {/* Level 1 ceiling with a stair void at x -8.3..-6.2, z -7..0.5 */}
      <Box p={[2.05, 6.6, -0.5]} s={[16.5, 0.4, 14]} m={m.render} />
      <Box p={[-7.25, 6.6, 3.5]} s={[2.1, 0.4, 6]} m={m.render} />
      <Box p={[1, 4.8, -7.6]} s={[18, 3.6, 0.3]} m={m.render} />
      <Box p={[-8.1, 4.8, -1]} s={[0.3, 3.6, 13]} m={m.render} />
      <Box p={[10.1, 4.8, -1]} s={[0.3, 3.6, 13]} m={m.render} />
      <GlassFront x0={-8} x1={10} y0={3.1} y1={6.4} z={5.5} gap={[1.6, 4.6]} m={m} />
      {/* Living furniture */}
      <Box p={[1.5, 3.13, -1.5]} s={[6, 0.02, 4.5]} m={m.darkFabric} cast={false} />
      <Box p={[1.5, 3.45, -3.6]} s={[5, 0.5, 1]} m={m.fabric} />
      <Box p={[1.5, 3.85, -4.05]} s={[5, 0.6, 0.25]} m={m.fabric} />
      <Box p={[-1.3, 3.45, -2]} s={[1, 0.5, 3]} m={m.fabric} />
      <Box p={[1.8, 3.35, -1.2]} s={[2.2, 0.3, 1.1]} m={m.black} />
      {/* Fireplace column + fire */}
      <Box p={[5.5, 4.8, -3]} s={[1.4, 3.6, 1.4]} m={m.stone} />
      <Box p={[5.5, 3.9, -2.29]} s={[0.9, 0.35, 0.02]} m={m.fire} cast={false} />
      <pointLight position={[5.5, 3.9, -1.6]} color="#ff8a3d" intensity={5} distance={7} decay={1.6} />
      {/* Kitchen island and dining */}
      <Box p={[-4.5, 3.6, -5.6]} s={[4.5, 1, 1]} m={m.stone} />
      <Box p={[-4.5, 3.6, -3]} s={[3.2, 1, 1.1]} m={m.black} />
      <Box p={[7.5, 3.85, 1.5]} s={[1.2, 0.08, 3]} m={m.wood} />
      {[0.4, 1.5, 2.6].map((z) => (
        <Box key={z} p={[6.7, 3.55, z]} s={[0.5, 0.9, 0.5]} m={m.black} />
      ))}
      {/* Art and plants */}
      <Box p={[1.5, 5.1, -7.43]} s={[3.2, 1.8, 0.04]} m={m.art} cast={false} />
      <Box p={[-1.3, 5.3, -7.43]} s={[1.2, 1.2, 0.04]} m={m.art2} cast={false} />
      {[[8.8, -6.4], [-7.2, 3.8]].map(([x, z]) => (
        <group key={`${x}`} position={[x, 3.1, z]}>
          <Box p={[0, 0.3, 0]} s={[0.6, 0.6, 0.6]} m={m.stone} />
          <mesh position={[0, 1.3, 0]} castShadow material={m.leaf}>
            <icosahedronGeometry args={[0.7, 1]} />
          </mesh>
        </group>
      ))}
      <Lamp p={[1.5, 5.6, -1.5]} intensity={7} />
      <Lamp p={[-4.5, 5.6, -3]} />
      <Lamp p={[7.5, 5.6, 1.5]} />
      <Lamp p={[-4.5, 5.6, -5.6]} intensity={4} />

      {/* Stair to level 2 (x -8..-6.4, rising toward -z) */}
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={i} p={[-7.2, 3.15 + i * 0.3, -0.2 - i * 0.48]} s={[1.6, 0.06, 0.5]} m={m.wood} />
      ))}
      <Box p={[-6.38, 4.8, -2.9]} s={[0.02, 1, 5.8]} m={m.glass} cast={false} receive={false} />

      {/* Level 2: bedrooms, set back. Floor slab has a void over the stair. */}
      <Box p={[-0.6, 6.81, -2]} s={[11.2, 0.02, 11]} m={m.wood} cast={false} />
      <Box p={[-2, 9.95, -2]} s={[14.4, 0.4, 11.4]} m={m.render} />
      <Box p={[-2, 8.3, -7.6]} s={[14, 3.2, 0.3]} m={m.render} />
      <Box p={[-9.1, 8.3, -2]} s={[0.3, 3.2, 11]} m={m.render} />
      <Box p={[5.1, 8.3, -2]} s={[0.3, 3.2, 11]} m={m.render} />
      <GlassFront x0={-9} x1={5} y0={6.8} y1={9.75} z={3.5} gap={[-2.6, 0.4]} m={m} />
      {/* Balcony glass balustrade on the level 1 roof */}
      <Box p={[1, 7.35, 6.75]} s={[18.4, 1.1, 0.03]} m={m.glass} cast={false} receive={false} />
      <Box p={[1, 7.92, 6.75]} s={[18.4, 0.05, 0.06]} m={m.trim} />
      {/* Bedroom */}
      <Box p={[1.5, 7.1, -4.5]} s={[2.6, 0.5, 3]} m={m.linen} />
      <Box p={[1.5, 7.7, -6.1]} s={[2.9, 1.3, 0.2]} m={m.darkFabric} />
      <Box p={[1.5, 6.84, -4]} s={[3.8, 0.02, 4.4]} m={m.fabric} cast={false} />
      {[-0.3, 3.3].map((x) => (
        <group key={x}>
          <Box p={[x, 7.05, -5.9]} s={[0.6, 0.5, 0.5]} m={m.wood} />
          <Lamp p={[x, 7.6, -5.9]} intensity={3} distance={6} />
        </group>
      ))}
      <Box p={[-4, 8.2, -7.2]} s={[3.5, 2.8, 0.6]} m={m.wood} />
      {/* Roof terrace */}
      <Box p={[-2, 10.7, 3.6]} s={[14.4, 1.1, 0.03]} m={m.glass} cast={false} receive={false} />
      <Box p={[-6, 10.4, -1]} s={[2.4, 0.4, 0.9]} m={m.fabric} />

      {/* Warm downlights on the facade */}
      {[-6, -2, 2, 6].map((x) => (
        <Box key={x} p={[x, 2.9, 5.6]} s={[0.25, 0.04, 0.25]} m={m.lamp} cast={false} receive={false} />
      ))}

      {/* Garden */}
      <Tree p={[-13, 0, 8]} s={1.2} />
      <Tree p={[-15, 0, -2]} s={1.5} />
      <Tree p={[15, 0, 2]} s={1.3} />
      <Tree p={[13, 0, -9]} s={1.6} />
      <Tree p={[-10, 0, 14]} s={0.9} />
      <Tree p={[17, 0, 12]} s={1.1} />
    </group>
  );
}

/** Hillside: flat around the house, rising behind it, falling away toward the city. */
function Terrain() {
  const m = useMats();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(520, 520, 160, 160);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const noise = Math.sin(x * 0.045) * Math.cos(z * 0.06) * 2.4 + Math.sin(x * 0.11 + z * 0.07) * 0.9;
      const behind = z < -12 ? (-12 - z) * 0.32 : 0;
      const below = z > 20 ? -Math.min((z - 20) * 0.42, 36) : 0;
      const flat = Math.abs(x) < 24 && z > -12 && z < 20 ? 0 : 1;
      pos.setY(i, -0.5 + behind + below + noise * flat);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={m.grass} receiveShadow />;
}

/** Budapest below: thousands of warm and white points that bloom at blue hour. */
function CityLights() {
  const pts = useMemo(() => {
    const n = 11000;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const warm = new THREE.Color("#ffc16e");
    const white = new THREE.Color("#dfe8ff");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const z = 70 + rnd() * 380;
      // Leave a dark ribbon for the Danube.
      let x = (rnd() - 0.5) * (300 + z * 1.2);
      if (Math.abs(x - (z - 200) * 0.25) < 14) x += 30;
      pos.set([x, -37 + rnd() * 1.5, z], i * 3);
      const c = rnd() < 0.7 ? warm : white;
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <points geometry={pts}>
      <pointsMaterial size={1.5} vertexColors sizeAttenuation toneMapped={false} transparent opacity={0.95} />
    </points>
  );
}

const _p = new THREE.Vector3();
const _t = new THREE.Vector3();

function Rig({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const { camera, pointer } = useThree();
  const posCurve = useMemo(() => new THREE.CatmullRomCurve3(STATIONS.map(([p]) => new THREE.Vector3(...p)), false, "centripetal"), []);
  const tgtCurve = useMemo(() => new THREE.CatmullRomCurve3(STATIONS.map(([, t]) => new THREE.Vector3(...t)), false, "centripetal"), []);
  const t = useRef(progress.get());
  const look = useRef(new THREE.Vector3(0, 5, 0));

  useFrame((_, dt) => {
    const target = THREE.MathUtils.clamp(progress.get(), 0, 1);
    t.current = still ? target : THREE.MathUtils.damp(t.current, target, 3.2, Math.min(dt, 0.05));
    // Same parameter for both curves, eased per segment so the camera settles at each station.
    const seg = (STATIONS.length - 1) * t.current;
    const i = Math.min(Math.floor(seg), STATIONS.length - 2);
    const f = seg - i;
    const u = (i + f * f * (3 - 2 * f)) / (STATIONS.length - 1);
    posCurve.getPoint(u, _p);
    tgtCurve.getPoint(u, _t);
    if (!still) {
      _p.x += pointer.x * 0.25;
      _p.y += pointer.y * 0.15;
    }
    camera.position.copy(_p);
    look.current.lerp(_t, still ? 1 : 1 - Math.exp(-8 * Math.min(dt, 0.05)));
    camera.lookAt(look.current);
  });
  return null;
}

export default function VillaScene({ progress, active, still }: { progress: MotionValue<number>; active: boolean; still: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 1200, position: STATIONS[0][0] }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      aria-hidden
    >
      <color attach="background" args={["#0d1320"]} />
      <fog attach="fog" args={["#1a2234", 90, 520]} />
      <Sky distance={4500} sunPosition={[-300, 6, -500]} turbidity={9} rayleigh={3} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <hemisphereLight args={["#6f86b8", "#1a1f14", 0.55]} />
      <directionalLight
        position={[-40, 30, -20]}
        intensity={1.3}
        color="#ffb27a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ffd6a8" position={[-10, 6, -20]} scale={[30, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#7d9bd6" position={[20, 15, 20]} scale={[40, 20, 1]} />
        <Lightformer form="ring" intensity={3} color="#ffb070" position={[0, 10, 30]} scale={6} />
      </Environment>

      <Terrain />
      <Villa />
      <CityLights />
      <Rig progress={progress} still={still} />

      <EffectComposer multisampling={0}>
        <SMAA />
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.82} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.22} darkness={0.75} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}

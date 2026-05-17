'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function IridescentOrb() {
  const meshRef  = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    const t = time.current;

    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.12;
      meshRef.current.rotation.y += delta * 0.18;
      meshRef.current.rotation.z += delta * 0.04;
      // Mouse tracking
      meshRef.current.rotation.x += state.mouse.y * 0.008;
      meshRef.current.rotation.y += state.mouse.x * 0.008;

      // Cycle emissive color for iridescent effect
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissive) {
        mat.emissive.setHSL((t * 0.08) % 1, 1, 0.15);
      }
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.1;
      innerRef.current.rotation.x += delta * 0.07;
      const mat2 = innerRef.current.material as THREE.MeshStandardMaterial;
      if (mat2 && mat2.emissive) {
        mat2.emissive.setHSL(((t * 0.08) + 0.5) % 1, 1, 0.2);
      }
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.6}>
      {/* Outer iridescent distorted sphere */}
      <mesh ref={meshRef} scale={1.35}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#1aff60"
          emissive="#004400"
          emissiveIntensity={0.4}
          metalness={1.0}
          roughness={0.0}
          distort={0.38}
          speed={2.5}
          transparent
          opacity={0.95}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Inner wireframe core */}
      <mesh ref={innerRef} scale={0.72}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#007aff"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.5}
          wireframe
        />
      </mesh>

      {/* Outer ghost shell — backside glow */}
      <mesh scale={1.75}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#7700ff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </Float>
  );
}

function WireframeRings() {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (r1.current) { r1.current.rotation.x += delta * 0.12; r1.current.rotation.z += delta * 0.06; }
    if (r2.current) { r2.current.rotation.y += delta * 0.09; r2.current.rotation.z -= delta * 0.08; }
    if (r3.current) { r3.current.rotation.x -= delta * 0.07; r3.current.rotation.y += delta * 0.11; }
  });

  return (
    <>
      <mesh ref={r1} scale={2.1}>
        <torusGeometry args={[0.85, 0.015, 4, 90]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.35} />
      </mesh>
      <mesh ref={r2} scale={1.75}>
        <torusGeometry args={[0.85, 0.01, 4, 90]} />
        <meshBasicMaterial color="#f700ff" transparent opacity={0.25} />
      </mesh>
      <mesh ref={r3} scale={1.4}>
        <torusGeometry args={[0.85, 0.007, 4, 60]} />
        <meshBasicMaterial color="#39ff14" transparent opacity={0.22} />
      </mesh>
    </>
  );
}

export default function HolographicOrb({ size = 220 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {/* Multi-layer glow halo */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(57,255,20,0.18) 0%, rgba(0,240,255,0.08) 45%, transparent 70%)',
        filter: 'blur(20px)',
        transform: 'scale(1.35)',
      }} />
      {/* Chromatic aberration — R shift */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle at 54% 46%, rgba(255,0,80,0.06) 0%, transparent 55%)',
        filter: 'blur(6px)', transform: 'translate(3px, 2px)', mixBlendMode: 'screen',
      }} />
      {/* Chromatic aberration — B shift */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle at 46% 54%, rgba(0,80,255,0.06) 0%, transparent 55%)',
        filter: 'blur(6px)', transform: 'translate(-3px, -2px)', mixBlendMode: 'screen',
      }} />

      <Canvas camera={{ position: [0, 0, 3.4], fov: 46 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 5, 5]}   color="#00f0ff"  intensity={4} />
        <pointLight position={[-5, -4, 4]} color="#39ff14"  intensity={3} />
        <pointLight position={[3, -5, 3]}  color="#8b5cf6"  intensity={2} />
        <pointLight position={[-3, 4, -3]} color="#f700ff"  intensity={1.5} />
        <pointLight position={[0, 0, 2]}   color="#ffffff"  intensity={0.5} />
        <IridescentOrb />
        <WireframeRings />
      </Canvas>
    </div>
  );
}

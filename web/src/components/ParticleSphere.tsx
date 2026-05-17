'use client';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleSphereProps {
  size?: number;
  particleCount?: number;
  color?: string;
  particleSize?: number;
}

export default function ParticleSphere({
  size = 220,
  particleCount = 3200,
  color = '#00ff88',
  particleSize = 0.016,
}: ParticleSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    /* ── Scene / Camera ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 2.8;

    /* ── Fibonacci sphere distribution ── */
    const positions    = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3); // for cursor restoration

    for (let i = 0; i < particleCount; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r     = 1;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions[i * 3]     = basePositions[i * 3]     = x;
      positions[i * 3 + 1] = basePositions[i * 3 + 1] = y;
      positions[i * 3 + 2] = basePositions[i * 3 + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color:         new THREE.Color(color),
      size:          particleSize,
      transparent:   true,
      opacity:       0.82,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    /* ── Mouse / Drag state ── */
    let isDragging = false;
    let prevMouse  = { x: 0, y: 0 };
    let velocity   = { x: 0, y: 0 };
    let cursorNDC  = { x: 0, y: 0 }; // normalised device coords relative to canvas

    const autoSpeed = 0.0025;

    /* ── Drag interaction ── */
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse  = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      // Update cursor NDC relative to canvas
      const rect = renderer.domElement.getBoundingClientRect();
      cursorNDC.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      cursorNDC.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      if (isDragging) {
        velocity.x = (e.clientY - prevMouse.y) * 0.006;
        velocity.y = (e.clientX - prevMouse.x) * 0.006;
        prevMouse  = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp   = () => { isDragging = false; renderer.domElement.style.cursor = 'grab'; };
    const onMouseLeave = () => { cursorNDC = { x: 99, y: 99 }; };

    renderer.domElement.addEventListener('mousedown',  onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseLeave);

    /* ── Touch ── */
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      velocity.x = (e.touches[0].clientY - prevMouse.y) * 0.006;
      velocity.y = (e.touches[0].clientX - prevMouse.x) * 0.006;
      prevMouse  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd  = () => { isDragging = false; };
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove',  onTouchMove,  { passive: true });
    renderer.domElement.addEventListener('touchend',   onTouchEnd);

    /* ── Animation loop ── */
    let lastTime = performance.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now   = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      /* auto-rotate */
      if (!isDragging) {
        points.rotation.y += autoSpeed;
        velocity.x *= 0.92;
        velocity.y *= 0.92;
      }
      points.rotation.x += velocity.x;
      points.rotation.y += velocity.y;

      /* cursor proximity ripple */
      const pos = geometry.attributes.position as THREE.BufferAttribute;
      const cursorWorld = new THREE.Vector3(cursorNDC.x * 1.4, cursorNDC.y * 1.4, 0.5);
      const radius   = 0.38;
      const strength = 0.09;

      for (let i = 0; i < particleCount; i++) {
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];

        // transform base pos by current rotation to world space
        const vec = new THREE.Vector3(bx, by, bz).applyEuler(points.rotation);
        const dist = vec.distanceTo(cursorWorld);

        if (dist < radius) {
          const factor = (1 - dist / radius) * strength;
          pos.setXYZ(i,
            bx + (bx - cursorWorld.x) * factor,
            by + (by - cursorWorld.y) * factor,
            bz,
          );
        } else {
          // lerp back to base
          pos.setXYZ(i,
            pos.getX(i) + (bx - pos.getX(i)) * 0.15,
            pos.getY(i) + (by - pos.getY(i)) * 0.15,
            pos.getZ(i) + (bz - pos.getZ(i)) * 0.15,
          );
        }
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', onMouseLeave);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove',  onTouchMove);
      renderer.domElement.removeEventListener('touchend',   onTouchEnd);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [size, particleCount, color, particleSize]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, cursor: 'grab', position: 'relative' }}
    >
      {/* glow halo behind the canvas */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, rgba(0,200,255,0.05) 50%, transparent 70%)',
        filter: 'blur(18px)', transform: 'scale(1.2)', zIndex: 0,
      }} />
    </div>
  );
}

'use client';
import { useRef, useCallback, CSSProperties } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  style?: CSSProperties;
}

export default function TiltCard({
  children,
  className = '',
  glowColor = 'rgba(0,255,136,0.15)',
  style,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const cx     = rect.width  / 2;
    const cy     = rect.height / 2;
    const rotX   = ((y - cy) / cy) * -6;
    const rotY   = ((x - cx) / cx) * 6;

    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.018,1.018,1.018)`;

    if (glowRef.current) {
      const pctX = (x / rect.width)  * 100;
      const pctY = (y / rect.height) * 100;
      glowRef.current.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, ${glowColor} 0%, transparent 62%)`;
      glowRef.current.style.opacity = '1';
    }
  }, [glowColor]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`glass-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.18s ease-out',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Mouse-follow glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          borderRadius: 'inherit', opacity: 0,
          transition: 'background 0.15s ease, opacity 0.25s ease',
          zIndex: 0,
        }}
      />
      {/* Content above glow */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

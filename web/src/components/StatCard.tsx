'use client';
import { motion } from 'framer-motion';
import TiltCard from './TiltCard';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  delay?: number;
}

export default function StatCard({ label, value, sub, accent = 'var(--accent-green)', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard glowColor={`${accent}25`} className="rounded-sm">
        <div style={{ padding: '18px 20px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
            letterSpacing: '0.14em', color: 'var(--text-dim)',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '2.6rem',
            fontWeight: 700, color: accent, lineHeight: 1,
            textShadow: `0 0 28px ${accent}55`,
          }}>
            {value}
          </div>
          {sub && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', marginTop: 10 }}>
              {sub}
            </div>
          )}
        </div>
        {/* Bottom accent line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, height: 2, width: '45%',
          background: `linear-gradient(90deg, ${accent}, transparent)`, opacity: 0.55,
        }} />
      </TiltCard>
    </motion.div>
  );
}

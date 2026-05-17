'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import { AlertTriangle, Sparkles, Shield, Zap } from 'lucide-react';

const ParticleSphere = dynamic(() => import('@/components/ParticleSphere'), { ssr: false });

interface Job { id: string; company: string; role: string; status: string; platform: string; date: string; scam_risk?: string; risk_notes?: string; }

const RISK_COLOR: Record<string, string> = { High: '#ff5566', Medium: '#ff8c00', Low: '#00ff88', Unknown: 'var(--text-dim)' };

function matchScore(job: Job): number {
  let h = 0; for (const c of (job.company + job.role)) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return 72 + (h % 28);
}

function OpportunityCard({ job, index }: { job: Job; index: number }) {
  const score = matchScore(job);
  const scoreColor = score >= 90 ? '#00ff88' : score >= 80 ? '#00c8ff' : '#a855f7';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.08, duration: 0.35 }}
      style={{
        background: 'rgba(6,8,16,0.9)',
        border: '1px solid rgba(60,70,120,0.28)',
        borderRadius: 4, padding: '16px 16px 14px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      whileHover={{ borderColor: 'rgba(0,255,136,0.3)', boxShadow: '0 0 20px rgba(0,255,136,0.06)' } as any}
    >
      {/* Company + Score */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)', lineHeight: 1 }}>
          {job.company.toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0, marginLeft: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: scoreColor, lineHeight: 1, textShadow: `0 0 14px ${scoreColor}55` }}>
            {score}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)' }}>MATCH</span>
        </div>
      </div>

      {/* Role */}
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>{job.role}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)', marginBottom: 12 }}>via {job.platform}</div>

      {/* Match progress bar */}
      <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.9, ease: [0.22,1,0.36,1] }}
          style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)`, boxShadow: `0 0 10px ${scoreColor}` }}
        />
      </div>

      {/* CTA */}
      <button className="btn-neural">
        Apply Now →
      </button>
    </motion.div>
  );
}

function ThreatCard({ job, index }: { job: Job; index: number }) {
  const risk = job.scam_risk ?? 'Unknown';
  const col  = RISK_COLOR[risk];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.08 }}
      style={{
        position: 'relative', background: `${col}06`,
        border: `1px solid ${col}35`, borderRadius: 4,
        padding: '14px 14px 14px 16px', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: col, boxShadow: `0 0 8px ${col}` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
            {job.company.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{job.role}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: col, background: `${col}15`, border: `1px solid ${col}35`, padding: '2px 10px', borderRadius: 3, flexShrink: 0, boxShadow: `0 0 10px ${col}25` }}>
          <Shield size={9} />{risk.toUpperCase()} RISK
        </div>
      </div>
      {job.risk_notes && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{job.risk_notes}</p>
      )}
    </motion.div>
  );
}

export default function HubPage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<'opps'|'threats'>('opps');

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json())
      .then(d => { setJobs(d.jobs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const opps    = jobs.filter(j => j.status === 'Job Opportunity');
  const high    = jobs.filter(j => j.scam_risk === 'High');
  const med     = jobs.filter(j => j.scam_risk === 'Medium');
  const threats = [...high, ...med];
  const safe    = jobs.filter(j => j.scam_risk === 'Low').length;
  const safeScore = jobs.length > 0 ? Math.round((safe / jobs.length) * 100) : 92;

  const TABS = [
    { key: 'opps'    as const, label: 'OPPORTUNITIES', count: opps.length,    color: 'var(--accent-green)', icon: Sparkles      },
    { key: 'threats' as const, label: 'THREAT ALERTS', count: threats.length, color: '#ff5566',             icon: AlertTriangle },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      <div className="aurora-blob aurora-1" /><div className="aurora-blob aurora-2" /><div className="aurora-blob aurora-3" />
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', padding: '28px 28px 28px 32px', position: 'relative', zIndex: 10 }}>

        {/* System bar */}
        <div className="system-status-bar">
          <span style={{ color: 'var(--accent-pink)' }}>●</span>
          <span>AI Insights</span>
          <span className="sep">·</span>
          <span>Smart Safety & Lead Tracker</span>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 0.92, fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
            <span style={{ color: 'var(--text-primary)' }}>AI </span>
            <span style={{ color: 'var(--accent-pink)', textShadow: '0 0 40px rgba(255,0,128,0.4)' }}>INSIGHTS.</span>
          </h1>
        </motion.div>

        {/* Tab bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[
            { key: 'opps'    as const, label: 'Job Leads',     count: opps.length,    color: 'var(--accent-green)', icon: Sparkles      },
            { key: 'threats' as const, label: 'Safety Alerts', count: threats.length, color: '#ff5566',             icon: AlertTriangle },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.12em',
                padding: '7px 16px', borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                border: tab === t.key ? `1px solid ${t.color}50` : '1px solid var(--border-subtle)',
                background: tab === t.key ? `${t.color}0c` : 'transparent',
                color: tab === t.key ? t.color : 'var(--text-dim)',
                boxShadow: tab === t.key ? `0 0 16px ${t.color}12` : 'none',
              }}
              onMouseEnter={e => { if (tab !== t.key) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              onMouseLeave={e => { if (tab !== t.key) (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'; }}
            >
              <t.icon size={11} />
              {t.label}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', background: `${t.color}18`, border: `1px solid ${t.color}28`, color: t.color, padding: '0 6px', borderRadius: 3 }}>
                {t.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Body — 2 col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

          {/* LEFT — feed */}
          <div>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>SCANNING NEURAL NET...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {tab === 'opps' && (
                    opps.length === 0
                      ? <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed rgba(0,255,136,0.12)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>NO OPPORTUNITIES DETECTED</div>
                      : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {opps.map((j, i) => <OpportunityCard key={j.id} job={j} index={i} />)}
                        </div>
                  )}
                  {tab === 'threats' && (
                    threats.length === 0
                      ? <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed rgba(0,255,136,0.12)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-green)', letterSpacing: '0.15em' }}>✓ PIPELINE CLEAR</div>
                      : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {threats.map((j, i) => <ThreatCard key={j.id} job={j} index={i} />)}
                        </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* RIGHT — orb + safety score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Particle sphere */}
            <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.65 }}
              className="glass-card" style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,0,128,0.12)', textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '4px 0 0', display: 'flex', justifyContent: 'center' }}>
                <div className="particle-sphere-wrapper">
                  <ParticleSphere size={190} particleCount={3000} color="#ff0080" particleSize={0.016} />
                </div>
              </div>
              <div style={{ padding: '8px 16px 14px', borderTop: '1px solid var(--border-dim)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', textAlign: 'center', letterSpacing: '0.12em' }}>
                  Smart Scanner Active
                </div>
              </div>
            </motion.div>

            {/* Safety score */}
            <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}
              className="glass-card" style={{ borderRadius: 4, padding: '16px 18px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: 'var(--accent-green)' }}>//</span> SAFETY SCORE
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color: 'var(--accent-green)', lineHeight: 1, textShadow: '0 0 24px rgba(0,255,136,0.5)' }}>
                  {safeScore}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'rgba(0,255,136,0.5)', lineHeight: 1 }}>/100</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 10 }}>
                <motion.div className="progress-fill"
                  initial={{ width: 0 }} animate={{ width: `${safeScore}%` }}
                  transition={{ delay: 0.55, duration: 1, ease: [0.22,1,0.36,1] }}
                  style={{ background: 'linear-gradient(90deg, var(--accent-green), #00c8ff)', boxShadow: '0 0 8px rgba(0,255,136,0.4)' }}
                />
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {safeScore >= 80
                  ? 'Your pipeline shows strong signal integrity. Low confidence postings flagged.'
                  : 'Pipeline integrity moderate. Review flagged applications carefully.'}
              </p>
            </motion.div>

            {/* AI Insight */}
            <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}
              className="glass-card" style={{ borderRadius: 4, padding: '14px 18px', border: '1px solid rgba(0,200,255,0.1)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.14em', color: 'var(--accent-cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Zap size={10} /> AI INSIGHT
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {high.length > 0
                  ? `⚠ ${high.length} application${high.length > 1 ? 's' : ''} flagged HIGH RISK. Do not submit personal documents.`
                  : opps.length > 0
                  ? `✦ ${opps.length} new opportunit${opps.length > 1 ? 'ies' : 'y'} detected. Apply promptly for best match score.`
                  : '✓ No active threats. Pipeline is clean and optimized.'}
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

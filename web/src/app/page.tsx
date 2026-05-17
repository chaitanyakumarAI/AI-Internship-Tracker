'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import ActivityChart from '@/components/ActivityChart';
import { RefreshCw, ChevronDown, Shield, Calendar, MapPin } from 'lucide-react';

const ParticleSphere = dynamic(() => import('@/components/ParticleSphere'), { ssr: false });

interface Job {
  id: string; company: string; role: string; status: string;
  platform: string; date: string; scam_risk?: string;
  risk_notes?: string; prep_sheet?: string; oa_link?: string;
}

const STATUS_CFG: Record<string, { cls: string; label: string; dot: string }> = {
  'Applied':             { cls: 'badge-applied',   label: 'APPLIED',    dot: 'rgba(180,188,230,0.8)' },
  'Under Review':        { cls: 'badge-review',    label: 'REVIEWING',  dot: '#a855f7' },
  'OA Sent':             { cls: 'badge-oa',         label: 'OA SENT',    dot: '#ff8c00' },
  'Interview Scheduled': { cls: 'badge-interview', label: 'INTERVIEW',  dot: '#00c8ff' },
  'Offer':               { cls: 'badge-offer',      label: 'OFFER',      dot: '#00ff88' },
  'Rejected':            { cls: 'badge-rejected',   label: 'REJECTED',   dot: '#ff5566' },
  'Job Opportunity':     { cls: 'badge-opportunity',label: 'NEW',        dot: '#ff0080' },
};

const AVATAR_COLORS = [
  ['#00ff88','#001a0d'], ['#00c8ff','#001829'], ['#a855f7','#1a0030'],
  ['#ff8c00','#1a0b00'], ['#ff0080','#1a0015'], ['#ff5566','#1a000a'],
  ['#f0e040','#1a1800'],
];

function getInitials(name: string) {
  return name.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getAvatarColor(name: string) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const ALL_FILTERS = ['ALL', 'Applied', 'Under Review', 'OA Sent', 'Interview Scheduled', 'Offer', 'Rejected', 'Job Opportunity'];

const FILTER_LABELS: Record<string, string> = {
  'ALL': 'ALL',
  'Applied': 'APPLIED',
  'Under Review': 'REVIEWING',
  'OA Sent': 'OA SENT',
  'Interview Scheduled': 'INTERVIEW',
  'Offer': 'OFFER',
  'Rejected': 'REJECTED',
  'Job Opportunity': 'NEW LEADS',
};

function JobRow({ job, index }: { job: Job; index: number }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[job.status] ?? STATUS_CFG['Applied'];
  const [fg, bg] = getAvatarColor(job.company);
  const initials = getInitials(job.company);
  const riskColor = job.scam_risk === 'High' ? '#ff5566' : job.scam_risk === 'Medium' ? '#ff8c00' : '#00ff88';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.22,1,0.36,1] }}
    >
      <div className="job-row" onClick={() => setOpen(!open)}>
        {/* Avatar */}
        <div className="company-avatar" style={{ background: bg, color: fg, border: `1px solid ${fg}30` }}>
          {initials}
        </div>

        {/* Company / Role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
            {job.company.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 1 }}>
            {job.role}
          </div>
        </div>

        {/* Platform / date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <MapPin size={9} style={{ color: 'var(--text-dim)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>
            {job.platform}
          </span>
        </div>

        {/* Risk */}
        {job.scam_risk && job.scam_risk !== 'Unknown' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <Shield size={9} style={{ color: riskColor }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: riskColor }}>
              {job.scam_risk}
            </span>
          </div>
        )}

        {/* Status badge */}
        <span className={`badge ${cfg.cls}`} style={{ flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
          {cfg.label}
        </span>

        {/* Chevron */}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
        </motion.div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}
            style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}
          >
            <div style={{ padding: '14px 16px 14px 66px', borderBottom: '1px solid var(--border-dim)' }}>
              <div style={{ display: 'flex', gap: 24 }}>
                {job.risk_notes && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: 6 }}>▸ RISK ANALYSIS</div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{job.risk_notes}</p>
                  </div>
                )}
                {job.prep_sheet && (
                  <div style={{ flex: 1.5 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.12em', color: 'var(--accent-cyan)', marginBottom: 6 }}>▸ PREP SHEET</div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{job.prep_sheet}</p>
                  </div>
                )}
              </div>
              {job.oa_link && (
                <a href={job.oa_link} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--accent-cyan)', padding: '4px 12px', border: '1px solid rgba(0,200,255,0.25)', borderRadius: 3 }}>
                  → OA LINK
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function buildActivityData(jobs: Job[]) {
  const counts: Record<string, number> = {};
  jobs.forEach(j => { if (!j.date) return; const w = j.date.substring(0, 7); counts[w] = (counts[w] ?? 0) + 1; });
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([label, value]) => ({ label, value }));
}

export default function Dashboard() {
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock]   = useState(false);
  const [filter, setFilter]   = useState('ALL');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/jobs').then(r => r.json());
      setJobs(d.jobs ?? []); setIsMock(d.isMock ?? false);
    } catch { setJobs([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchJobs(); }, []);

  const tracked    = jobs.filter(j => j.status !== 'Job Opportunity');
  const offers     = jobs.filter(j => j.status === 'Offer').length;
  const interviews = jobs.filter(j => j.status === 'Interview Scheduled').length;
  const responseRate = tracked.length > 0 ? Math.round(((tracked.length - jobs.filter(j=>j.status==='Applied').length) / tracked.length) * 100) : 0;
  const opps       = jobs.filter(j => j.status === 'Job Opportunity');
  const highRisk   = jobs.filter(j => j.scam_risk === 'High').length;
  const matchScore = jobs.length > 0 ? (87.4).toFixed(1) : '0';
  const filtered   = filter === 'ALL' ? jobs : jobs.filter(j => j.status === filter);
  const actData    = buildActivityData(jobs);
  const now        = new Date().toISOString().split('T')[0].replace(/-/g, '.');

  const STATS = [
    { label: 'ACTIVE',        value: tracked.length, color: 'var(--accent-green)',  icon: '⬡' },
    { label: 'INTERVIEWS',    value: interviews,      color: 'var(--accent-pink)',   icon: '◎' },
    { label: 'OFFERS',        value: offers,          color: 'var(--accent-purple)', icon: '▲' },
    { label: 'RESPONSE RATE', value: `${responseRate}%`, color: 'var(--accent-cyan)', icon: '◇' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      <div className="aurora-blob aurora-1" /><div className="aurora-blob aurora-2" /><div className="aurora-blob aurora-3" />
      <Sidebar />

      <main style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', padding: '28px 28px 28px 32px', position: 'relative', zIndex: 10 }}>

        {/* ── System status bar ── */}
        <div className="system-status-bar">
          <span style={{ color: 'var(--accent-green)' }}>●</span>
          <span>Intern Pulse</span>
          <span className="sep">·</span>
          <span>{now}</span>
          {isMock && <><span className="sep">·</span><span style={{ color: 'var(--accent-cyan)' }}>DEMO — connect Notion to see live data</span></>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
            <span>Status: <span style={{ color: 'var(--accent-green)' }}>Online</span></span>
            <span>Jobs tracked: <span style={{ color: 'var(--text-muted)' }}>{jobs.length}</span></span>
          </div>
        </div>

        {/* ── Hero title ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ marginBottom: 28 }}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 6vw, 5.2rem)' }}>
            MY
            <span className="accent">APPLICATIONS.</span>
          </h1>
        </motion.div>

        {/* ── Main 2-col ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Stat strip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}
            >
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                  className="glass-card" style={{ padding: '14px 16px', borderRadius: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>{s.label}</span>
                    <span style={{ fontSize: '0.7rem', color: s.color, opacity: 0.7 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: s.color, lineHeight: 1, textShadow: `0 0 20px ${s.color}44` }}>
                    {s.value}
                  </div>
                  <div style={{ height: 2, marginTop: 10, background: `linear-gradient(90deg, ${s.color}, transparent)`, opacity: 0.4, borderRadius: 1 }} />
                </motion.div>
              ))}
            </motion.div>

            {/* Filter pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14, alignItems: 'center' }}>
              {ALL_FILTERS.map(f => (
                <button key={f} className={`filter-pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                  {FILTER_LABELS[f]}
                </button>
              ))}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {filtered.length} applications
              </span>
            </motion.div>

            {/* Job rows */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="glass-card" style={{ borderRadius: 4 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 14 }}>
                  <div style={{ width: 28, height: 28, border: '2px solid rgba(0,255,136,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.18em' }}>SCANNING PIPELINE...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '50px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>NO RECORDS</div>
              ) : (
                filtered.map((job, i) => <JobRow key={job.id} job={job} index={i} />)
              )}
            </motion.div>
          </div>

          {/* RIGHT panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Neural Radar */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
              className="glass-card" style={{ borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-dim)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 4 }}>// JOB SAFETY SCANNER</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                  Safety & New Leads
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                <div className="particle-sphere-wrapper">
                  <ParticleSphere size={180} particleCount={2800} color="#00ff88" particleSize={0.017} />
                </div>
              </div>
              <div style={{ padding: '4px 16px 10px', borderTop: '1px solid var(--border-dim)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: 8 }}>
                  Scanning for scams & new openings
                </div>
                {[
                  { label: 'New Leads Found',  val: `+${opps.length}`,          color: 'var(--accent-green)'  },
                  { label: 'Flagged Jobs',      val: `${highRisk} suspicious`,   color: '#ff5566'              },
                  { label: 'Trust Score',       val: `${matchScore}%`,           color: 'var(--accent-cyan)'   },
                ].map(r => (
                  <div key={r.label} className="stat-row">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>{r.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', fontWeight: 600, color: r.color }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity chart */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}
              className="glass-card" style={{ borderRadius: 4, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 12 }}>// ACTIVITY TIMELINE</div>
              <ActivityChart data={actData.length > 0 ? actData : [
                { label: 'Jan', value: 3 }, { label: 'Feb', value: 9 }, { label: 'Mar', value: 6 },
                { label: 'Apr', value: 18 }, { label: 'May', value: 12 }, { label: 'Jun', value: 7 },
              ]} />
            </motion.div>

            {/* Application funnel */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}
              className="glass-card" style={{ borderRadius: 4, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 12 }}>// FUNNEL</div>
              {[
                { stage: 'Applied',   col: 'var(--text-muted)',     n: jobs.filter(j=>j.status==='Applied').length },
                { stage: 'Reviewing', col: 'var(--accent-purple)',  n: jobs.filter(j=>j.status==='Under Review').length },
                { stage: 'OA Sent',   col: 'var(--accent-orange)',  n: jobs.filter(j=>j.status==='OA Sent').length },
                { stage: 'Interview', col: 'var(--accent-cyan)',    n: jobs.filter(j=>j.status==='Interview Scheduled').length },
                { stage: 'Offer',     col: 'var(--accent-green)',   n: jobs.filter(j=>j.status==='Offer').length },
              ].map((f, i) => {
                const max = Math.max(...[jobs.filter(j=>j.status==='Applied').length, 1]);
                const pct = (f.n / max) * 100;
                return (
                  <div key={f.stage} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-muted)' }}>{f.stage}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: f.col }}>{f.n}</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }} style={{ background: f.col }} />
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Refresh */}
            <button onClick={fetchJobs} className="btn-ghost"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
              <RefreshCw size={10} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              REFRESH PIPELINE
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

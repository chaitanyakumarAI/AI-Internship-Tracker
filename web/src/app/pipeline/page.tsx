'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import { Shield, MapPin } from 'lucide-react';

interface Job {
  id: string; company: string; role: string; status: string;
  platform: string; date: string; scam_risk?: string; oa_link?: string;
}

const COLUMNS = [
  { key: 'Applied',             label: 'APPLIED',   color: 'rgba(180,188,230,0.75)', border: 'rgba(180,188,230,0.2)' },
  { key: 'Under Review',        label: 'REVIEWING', color: '#a855f7',                border: 'rgba(168,85,247,0.25)' },
  { key: 'OA Sent',             label: 'OA SENT',   color: '#ff8c00',                border: 'rgba(255,140,0,0.25)'  },
  { key: 'Interview Scheduled', label: 'INTERVIEW', color: '#00c8ff',                border: 'rgba(0,200,255,0.25)'  },
  { key: 'Offer',               label: 'OFFER',     color: '#00ff88',                border: 'rgba(0,255,136,0.3)'   },
  { key: 'Rejected',            label: 'REJECTED',  color: '#ff5566',                border: 'rgba(255,85,102,0.22)' },
  { key: 'Job Opportunity',     label: 'RADAR',     color: '#ff0080',                border: 'rgba(255,0,128,0.22)'  },
];

const RISK_COLOR: Record<string, string> = { Low: '#00ff88', Medium: '#ff8c00', High: '#ff5566', Unknown: 'var(--text-dim)' };

const AVATAR_PALETTE = [
  ['#00ff88','#001a0d'], ['#00c8ff','#001829'], ['#a855f7','#1a0030'],
  ['#ff8c00','#1a0b00'], ['#ff0080','#1a0015'], ['#ff5566','#1a000a'],
  ['#f0e040','#1a1800'], ['#60e0ff','#001822'],
];
function getInitials(name: string) {
  return name.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getAvatarColor(name: string) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function KanbanCard({ job, colColor, onDragStart }: { job: Job; colColor: string; onDragStart: (e: React.DragEvent) => void }) {
  const [fg, bg] = getAvatarColor(job.company);
  const initials = getInitials(job.company);
  const risk     = job.scam_risk ?? 'Unknown';

  return (
    <div 
      draggable
      onDragStart={onDragStart}
      style={{
      background: 'rgba(8,10,18,0.9)',
      border: `1px solid rgba(60,70,120,0.2)`,
      borderRadius: 4, marginBottom: 8,
      transition: 'border-color 0.18s, box-shadow 0.18s',
      cursor: 'default', overflow: 'hidden',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${colColor}45`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${colColor}12`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(60,70,120,0.2)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Top color bar */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${colColor}, transparent)`, opacity: 0.6 }} />

      <div style={{ padding: '12px 12px 10px' }}>
        {/* Avatar + company */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 4, flexShrink: 0,
            background: bg, color: fg, border: `1px solid ${fg}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.04em',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {job.company.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.2 }}>
              {job.role}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPin size={8} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)' }}>
              {job.platform}
            </span>
          </div>
          {risk !== 'Unknown' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Shield size={8} style={{ color: RISK_COLOR[risk] }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: RISK_COLOR[risk] }}>{risk}</span>
            </div>
          )}
        </div>

        {/* OA link */}
        {job.oa_link && (
          <a href={job.oa_link} target="_blank" rel="noreferrer"
            style={{ display: 'block', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
            → OA LINK
          </a>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json())
      .then(d => { setJobs(d.jobs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData('jobId', jobId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (!jobId) return;

    // Find the job to ensure it's not already in the target column
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status === targetStatus) return;

    // Optimistically update UI
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: targetStatus } : j));

    // Update backend (Notion)
    try {
      const res = await fetch('/api/jobs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, status: targetStatus })
      });
      if (!res.ok) {
        // Revert on failure (simple reload for now or real revert logic)
        console.error('Failed to update Notion');
      }
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      <div className="aurora-blob aurora-1" /><div className="aurora-blob aurora-2" /><div className="aurora-blob aurora-3" />
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', padding: '28px 28px 28px 32px', position: 'relative', zIndex: 10 }}>

        {/* System bar */}
        <div className="system-status-bar">
          <span style={{ color: 'var(--accent-green)' }}>●</span>
          <span>Job Board</span>
          <span className="sep">·</span>
          <span>Kanban View</span>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 28 }}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 6vw, 5.2rem)' }}>
            JOB
            <span style={{ color: 'var(--accent-cyan)', display: 'block', textShadow: '0 0 40px rgba(0,200,255,0.35)' }}>BOARD.</span>
          </h1>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', gap: 14 }}>
            <div style={{ width: 28, height: 28, border: '2px solid rgba(0,255,136,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.18em' }}>LOADING PIPELINE...</span>
          </div>
        ) : (
          <div className="kanban-board">
            {COLUMNS.map((col, ci) => {
              const colJobs = jobs.filter(j => j.status === col.key);
              return (
                <motion.div key={col.key}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.05 }}
                  style={{ minWidth: 220, maxWidth: 240, flex: '0 0 220px', minHeight: '60vh' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, col.key)}
                >
                  {/* Column header */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
                        letterSpacing: '0.15em', color: col.color,
                        textShadow: `0 0 10px ${col.color}44`,
                      }}>
                        {col.label}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                        color: col.color, background: `${col.color}12`,
                        border: `1px solid ${col.border}`, padding: '1px 8px', borderRadius: 3,
                      }}>
                        {String(colJobs.length).padStart(2, '0')}
                      </span>
                    </div>
                    <div style={{ height: 1, background: `linear-gradient(90deg, ${col.color}, transparent)`, opacity: 0.4 }} />
                  </div>

                  {/* Cards */}
                  <AnimatePresence>
                    {colJobs.length === 0 ? (
                      <div style={{
                        height: 60, border: `1px dashed ${col.color}18`, borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', letterSpacing: '0.1em',
                      }}>EMPTY</div>
                    ) : colJobs.map((job, i) => (
                      <motion.div key={job.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: ci * 0.05 + i * 0.04 }}
                        layoutId={job.id}
                      >
                        <KanbanCard job={job} colColor={col.color} onDragStart={(e) => handleDragStart(e, job.id)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

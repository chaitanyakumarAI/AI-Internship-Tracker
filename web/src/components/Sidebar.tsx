'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Columns2, Lightbulb } from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'DASHBOARD',  href: '/',         desc: 'All applications' },
  { icon: Columns2,        label: 'JOB BOARD',  href: '/pipeline', desc: 'Kanban view'       },
  { icon: Lightbulb,       label: 'AI INSIGHTS',href: '/hub',      desc: 'Alerts & tips'     },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, height: '100vh',
      width: 'var(--sidebar-w)', zIndex: 50,
      borderRight: '1px solid rgba(30,35,60,0.6)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(4,5,9,0.97)',
        backdropFilter: 'blur(40px)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Logo */}
        <div style={{ padding: '22px 16px 18px', borderBottom: '1px solid rgba(30,35,60,0.5)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Pulse icon */}
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: 'rgba(0,255,136,0.12)',
              border: '1px solid rgba(0,255,136,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)', animation: 'pulse 2.5s ease-in-out infinite' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.06em', color: 'var(--text-primary)', lineHeight: 1 }}>
                INTERN<span style={{ color: 'var(--accent-green)' }}> PULSE</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: 'var(--text-dim)', marginTop: 3, letterSpacing: '0.06em' }}>
                v2.0 · Smart Tracker
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map((item, i) => {
            const active = pathname === item.href;
            return (
              <div key={item.href}>
                <Link href={item.href}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px',
                    background: active ? 'rgba(0,255,136,0.07)' : 'transparent',
                    borderLeft: active ? '2px solid var(--accent-green)' : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <item.icon
                      size={13}
                      style={{ color: active ? 'var(--accent-green)' : 'var(--text-dim)', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.76rem', fontWeight: 600, letterSpacing: '0.1em',
                        color: active ? 'var(--accent-green)' : 'var(--text-muted)',
                        lineHeight: 1.2,
                      }}>
                        {item.label}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.46rem', color: 'var(--text-dim)', marginTop: 2, letterSpacing: '0.04em' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer — live status */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(30,35,60,0.5)', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
            Sync Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--accent-green)',
              boxShadow: '0 0 6px var(--accent-green)',
              animation: 'pulse 2.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--accent-green)', letterSpacing: '0.06em' }}>
              LIVE
            </span>
          </div>
        </div>

      </div>
    </aside>
  );
}

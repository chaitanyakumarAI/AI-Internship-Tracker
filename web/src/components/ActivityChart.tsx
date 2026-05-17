'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DataPoint { label: string; value: number; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(4,5,9,0.98)', border: '1px solid rgba(0,255,136,0.25)', padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', backdropFilter: 'blur(20px)', borderRadius: 4 }}>
        <div style={{ color: 'var(--text-dim)', marginBottom: 2 }}>{label}</div>
        <div style={{ color: 'var(--accent-green)' }}>{payload[0].value} applications</div>
      </div>
    );
  }
  return null;
};

export default function ActivityChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#00ff88" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(80,90,150,0.12)" />
        <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'rgba(120,130,175,0.55)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'rgba(120,130,175,0.55)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value" stroke="#00ff88" strokeWidth={1.5} fill="url(#grad)" dot={false}
          activeDot={{ r: 4, fill: '#00ff88', stroke: 'rgba(0,255,136,0.35)', strokeWidth: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

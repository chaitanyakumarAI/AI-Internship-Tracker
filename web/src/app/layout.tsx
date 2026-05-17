import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Intern Pulse | Internship Tracker',
  description: 'Track all your internship applications in one place. Get AI-powered safety alerts, interview prep tips, and real-time status updates.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: 'var(--bg-void)', overflowX: 'hidden' }}>
        {/* Top chromatic accent bar */}
        <div className="top-accent-line" />
        {children}
      </body>
    </html>
  );
}

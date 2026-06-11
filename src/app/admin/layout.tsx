import React from 'react';

export const metadata = {
  title: 'SDB Auto Accessories | Admin Portal',
  description: 'Manage products, categories, coupons, and orders.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <style>{`
        .admin-panel { font-family: 'var(--font-sans)', system-ui, sans-serif; }
        .admin-panel .bg-dark { background: #F9FAFB !important; }
        .admin-panel .bg-bg { background: #FFFFFF !important; }
        .admin-panel .bg-white { background: #FFFFFF !important; }
        .admin-panel .bg-bg\\/40, .admin-panel .bg-bg\\/50 { background: rgba(243,244,246,0.5) !important; }
        .admin-panel .bg-bg\\/25, .admin-panel .bg-bg\\/20 { background: rgba(243,244,246,0.3) !important; }
        .admin-panel .text-dark { color: #111827 !important; }
        .admin-panel .text-text { color: #1F2937 !important; }
        .admin-panel .text-muted { color: #4B5563 !important; }
        .admin-panel .text-primary { color: #D6A313 !important; }
        .admin-panel .bg-primary { background: #D6A313 !important; color: #FFFFFF !important; }
        .admin-panel .bg-primary .text-white { color: #FFFFFF !important; }
        .admin-panel .bg-primary\\/10 { background: rgba(214,163,19,0.1) !important; }
        .admin-panel .bg-primary\\/20 { background: rgba(214,163,19,0.15) !important; }
        .admin-panel .hover\\:bg-primary\\/95:hover { background: #c4950f !important; }
        .admin-panel .border-border { border-color: #E5E7EB !important; }
        .admin-panel .border-border\\/60 { border-color: #E5E7EB !important; }
        .admin-panel .border-border\\/40 { border-color: #F3F4F6 !important; }
        .admin-panel .border-white\\/5, .admin-panel .border-white\\/10 { border-color: #F3F4F6 !important; }
        .admin-panel .divide-border\\/40 > * + * { border-color: #E5E7EB !important; }
        .admin-panel .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important; }
        .admin-panel .rounded-xl { border-radius: 12px !important; }
        .admin-panel input, .admin-panel textarea, .admin-panel select {
          background: #FFFFFF !important;
          border-color: #E5E7EB !important;
          color: #111827 !important;
          border-radius: 10px !important;
        }
        .admin-panel input::placeholder, .admin-panel textarea::placeholder {
          color: #9CA3AF !important;
        }
        .admin-panel select option {
          background: #FFFFFF;
          color: #111827;
        }
        .admin-panel table { border-collapse: collapse; }
        .admin-panel thead tr { background: #F9FAFB !important; }
        .admin-panel tbody tr:hover { background: #F9FAFB !important; }
        .admin-panel .border-l-4 { border-left-color: #D6A313 !important; }
        .admin-panel .border-l-primary { border-left-color: #D6A313 !important; }
        .admin-panel .border-l-dark { border-left-color: #111827 !important; }
        .admin-panel .border-l-accent { border-left-color: #D6A313 !important; }
        .admin-panel .border-l-emerald-600 { border-left-color: #10B981 !important; }
        .admin-panel .text-emerald-600 { color: #10B981 !important; }
        .admin-panel .text-success { color: #10B981 !important; }
        .admin-panel .bg-emerald-50 { background: rgba(16,185,129,0.08) !important; }
        .admin-panel .border-emerald-100, .admin-panel .border-emerald-200 { border-color: rgba(16,185,129,0.2) !important; }
        .admin-panel .text-emerald-800 { color: #065F46 !important; }
        .admin-panel .bg-amber-50 { background: rgba(214,163,19,0.08) !important; }
        .admin-panel .border-amber-200 { border-color: rgba(214,163,19,0.2) !important; }
        .admin-panel .text-amber-900 { color: #78350F !important; }
        .admin-panel .text-amber-600 { color: #D6A313 !important; }
        .admin-panel .text-amber-700 { color: #B45309 !important; }
        .admin-panel .font-display { font-family: 'var(--font-display)', sans-serif !important; }
        .admin-panel h1, .admin-panel h3 { font-family: 'var(--font-display)', sans-serif; font-weight: 700; color: #111827; }
        .admin-panel .hover\\:bg-bg:hover { background: #F3F4F6 !important; }
        .admin-panel .hover\\:bg-white\\/5:hover { background: rgba(0,0,0,0.02) !important; }
        .admin-panel .hover\\:text-dark:hover { color: #111827 !important; }
        .admin-panel .hover\\:text-primary:hover { color: #D6A313 !important; }
        .admin-panel .text-white { color: #111827 !important; }
        .admin-panel .text-white\\/70 { color: #4B5563 !important; }
        .admin-panel .text-white\\/40 { color: #9CA3AF !important; }
        .admin-panel .text-white\\/50 { color: #6B7280 !important; }
        .admin-panel .bg-white\\/5 { background: rgba(0,0,0,0.02) !important; }
        .admin-panel .font-mono { font-family: monospace; }
        .admin-panel .w-64 { background: #FFFFFF !important; border-right: 1px solid #E5E7EB !important; }
        .admin-panel .max-w-7xl { max-width: 80rem; }
        .admin-panel .overflow-hidden { overflow: hidden; }
        .admin-panel .fill-primary { fill: #D6A313 !important; }
        .admin-panel button.bg-primary { background: #D6A313 !important; color: #FFFFFF !important; }
        .admin-panel a.bg-primary { background: #D6A313 !important; color: #FFFFFF !important; }
        .admin-panel .bg-dark\\/95 { background: rgba(255,255,255,0.95) !important; }
        .admin-panel .fixed.inset-0 { background: rgba(0,0,0,0.4) !important; }
        .admin-panel .shadow-2xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important; }
        .admin-panel .h-3.rounded-full { background: #E5E7EB !important; }
        .admin-panel .h-3 > .h-full.bg-dark { background: #D6A313 !important; }
        .admin-panel .h-3 > .h-full.bg-primary { background: #ef4444 !important; }
        .admin-panel [class*="rounded-full"].bg-\\[\\#D6A313\\] { background: #D6A313 !important; }
      `}</style>
      <div className="admin-panel">
        {children}
      </div>
    </div>
  );
}

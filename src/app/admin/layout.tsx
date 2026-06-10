import React from 'react';

export const metadata = {
  title: 'SGB Decors | Admin Portal',
  description: 'Manage products, categories, coupons, and orders.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#0B0F0C', color: '#F8F3E8' }}>
      <style>{`
        .admin-panel { font-family: 'Inter', system-ui, sans-serif; }
        .admin-panel .bg-dark { background: #0B0F0C !important; }
        .admin-panel .bg-bg { background: #111811 !important; }
        .admin-panel .bg-white { background: #172117 !important; }
        .admin-panel .bg-bg\\/40, .admin-panel .bg-bg\\/50 { background: rgba(17,24,17,0.5) !important; }
        .admin-panel .bg-bg\\/25, .admin-panel .bg-bg\\/20 { background: rgba(17,24,17,0.3) !important; }
        .admin-panel .text-dark { color: #F8F3E8 !important; }
        .admin-panel .text-text { color: #F8F3E8 !important; }
        .admin-panel .text-muted { color: #9AA397 !important; }
        .admin-panel .text-primary { color: #D6A313 !important; }
        .admin-panel .bg-primary { background: #D6A313 !important; color: #101510 !important; }
        .admin-panel .bg-primary .text-white { color: #101510 !important; }
        .admin-panel .bg-primary\\/10 { background: rgba(214,163,19,0.1) !important; }
        .admin-panel .bg-primary\\/20 { background: rgba(214,163,19,0.15) !important; }
        .admin-panel .hover\\:bg-primary\\/95:hover { background: #c4950f !important; }
        .admin-panel .border-border { border-color: rgba(214,163,19,0.22) !important; }
        .admin-panel .border-border\\/60 { border-color: rgba(214,163,19,0.18) !important; }
        .admin-panel .border-border\\/40 { border-color: rgba(214,163,19,0.12) !important; }
        .admin-panel .border-white\\/5, .admin-panel .border-white\\/10 { border-color: rgba(248,243,232,0.06) !important; }
        .admin-panel .divide-border\\/40 > * + * { border-color: rgba(214,163,19,0.1) !important; }
        .admin-panel .shadow-sm { box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important; }
        .admin-panel .rounded-xl { border-radius: 12px !important; }
        .admin-panel input, .admin-panel textarea, .admin-panel select {
          background: #0B0F0C !important;
          border-color: rgba(214,163,19,0.18) !important;
          color: #F8F3E8 !important;
          border-radius: 10px !important;
        }
        .admin-panel input::placeholder, .admin-panel textarea::placeholder {
          color: #6b7a68 !important;
        }
        .admin-panel select option {
          background: #111811;
          color: #F8F3E8;
        }
        .admin-panel table { border-collapse: collapse; }
        .admin-panel thead tr { background: #0B0F0C !important; }
        .admin-panel tbody tr:hover { background: rgba(17,24,17,0.5) !important; }
        .admin-panel .border-l-4 { border-left-color: #D6A313 !important; }
        .admin-panel .border-l-primary { border-left-color: #D6A313 !important; }
        .admin-panel .border-l-dark { border-left-color: #F8F3E8 !important; }
        .admin-panel .border-l-accent { border-left-color: #D6A313 !important; }
        .admin-panel .border-l-emerald-600 { border-left-color: #22C55E !important; }
        .admin-panel .text-emerald-600 { color: #22C55E !important; }
        .admin-panel .text-success { color: #22C55E !important; }
        .admin-panel .bg-emerald-50 { background: rgba(34,197,94,0.08) !important; }
        .admin-panel .border-emerald-100, .admin-panel .border-emerald-200 { border-color: rgba(34,197,94,0.2) !important; }
        .admin-panel .text-emerald-800 { color: #22C55E !important; }
        .admin-panel .bg-amber-50 { background: rgba(214,163,19,0.08) !important; }
        .admin-panel .border-amber-200 { border-color: rgba(214,163,19,0.2) !important; }
        .admin-panel .text-amber-900 { color: #D6A313 !important; }
        .admin-panel .text-amber-600 { color: #D6A313 !important; }
        .admin-panel .text-amber-700 { color: #9AA397 !important; }
        .admin-panel .font-display { font-family: 'Playfair Display', serif !important; }
        .admin-panel h1, .admin-panel h3 { font-family: 'Inter', sans-serif; }
        .admin-panel .hover\\:bg-bg:hover { background: rgba(17,24,17,0.6) !important; }
        .admin-panel .hover\\:bg-white\\/5:hover { background: rgba(248,243,232,0.04) !important; }
        .admin-panel .hover\\:text-dark:hover { color: #F8F3E8 !important; }
        .admin-panel .hover\\:text-primary:hover { color: #D6A313 !important; }
        .admin-panel .text-white { color: #F8F3E8 !important; }
        .admin-panel .text-white\\/70 { color: rgba(248,243,232,0.65) !important; }
        .admin-panel .text-white\\/40 { color: rgba(248,243,232,0.35) !important; }
        .admin-panel .text-white\\/50 { color: rgba(248,243,232,0.45) !important; }
        .admin-panel .bg-white\\/5 { background: rgba(248,243,232,0.03) !important; }
        .admin-panel .font-mono { font-family: 'JetBrains Mono', monospace; }
        .admin-panel .w-64 { background: #111811 !important; }
        .admin-panel .max-w-7xl { max-width: 80rem; }
        .admin-panel .overflow-hidden { overflow: hidden; }
        .admin-panel .fill-primary { fill: #D6A313 !important; }
        .admin-panel button.bg-primary { background: #D6A313 !important; color: #101510 !important; }
        .admin-panel a.bg-primary { background: #D6A313 !important; color: #101510 !important; }
        .admin-panel .bg-dark\/95 { background: rgba(11,15,12,0.95) !important; }
        .admin-panel .fixed.inset-0 { background: rgba(0,0,0,0.7) !important; }
        .admin-panel .shadow-2xl { box-shadow: 0 12px 40px rgba(0,0,0,0.5) !important; }
        .admin-panel .h-3.rounded-full { background: #172117 !important; }
        .admin-panel .h-3 > .h-full.bg-dark { background: #D6A313 !important; }
        .admin-panel .h-3 > .h-full.bg-primary { background: #ef4444 !important; }
        .admin-panel [class*="rounded-full"].bg-\[\#D6A313\] { background: #D6A313 !important; }
      `}</style>
      <div className="admin-panel">
        {children}
      </div>
    </div>
  );
}

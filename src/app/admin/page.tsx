'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { verifyAdminCredentials } from './login-action';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('sdb_admin') === 'true';
      if (isAuth) {
        router.replace('/admin/dashboard');
      } else {
        setLoading(false);
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const result = await verifyAdminCredentials(email, password);
      if (result.success) {
        sessionStorage.setItem('sdb_admin', 'true');
        router.push('/admin/dashboard');
      } else {
        setError(result.error || 'Invalid credentials.');
        setIsLoggingIn(false);
      }
    } catch {
      setError('Connection failed. Please try again.');
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#D6A313' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--color-bg)' }}>
      <div
        className="w-full max-w-sm space-y-8 text-center"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '40px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
      >
        {/* Logo */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#D6A313" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2" />
              <path d="M9 17h6" />
              <path d="M14 7l-3 5h5" />
            </svg>
            <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--color-text-light)' }}>
              SDB Auto <span style={{ color: '#D6A313' }}>Accessories</span>
            </span>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '12px', fontFamily: 'var(--font-sans), sans-serif', letterSpacing: '0.06em', fontWeight: 500 }}>
            ADMIN CONTROL PANEL
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-sans), sans-serif', letterSpacing: '0.06em' }} className="block mb-1.5">
              EMAIL
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@sdbautoaccessories.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggingIn}
                className="w-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50 text-dark placeholder-muted"
                style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4" style={{ color: 'var(--color-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-sans), sans-serif', letterSpacing: '0.06em' }} className="block mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoggingIn}
                className="w-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50 text-dark placeholder-muted"
                style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
              />
              <Lock className="absolute left-3 top-3.5 h-4 w-4" style={{ color: 'var(--color-muted)' }} />
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold px-3 py-2.5" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontFamily: 'var(--font-sans), sans-serif' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center py-3 text-sm font-bold cursor-pointer transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#D6A313', color: '#FFFFFF', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif', minHeight: '46px', marginTop: '8px' }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

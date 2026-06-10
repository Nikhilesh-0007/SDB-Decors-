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
      const isAuth = sessionStorage.getItem('sgb_admin') === 'true';
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
        sessionStorage.setItem('sgb_admin', 'true');
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F0C' }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#D6A313' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#0B0F0C' }}>
      <div
        className="w-full max-w-sm space-y-8 text-center"
        style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.22)', borderRadius: '16px', padding: '40px 32px' }}
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
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 700, color: '#F8F3E8' }}>
              SGB <span style={{ color: '#D6A313' }}>Decors</span>
            </span>
          </div>
          <p style={{ color: '#9AA397', fontSize: '12px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', fontWeight: 500 }}>
            ADMIN CONTROL PANEL
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label style={{ color: '#9AA397', fontSize: '11px', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }} className="block mb-1.5">
              EMAIL
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@sgbdecors.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggingIn}
                className="w-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50"
                style={{ background: '#0B0F0C', border: '1px solid rgba(214,163,19,0.18)', borderRadius: '10px', color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4" style={{ color: '#9AA397' }} />
            </div>
          </div>

          <div>
            <label style={{ color: '#9AA397', fontSize: '11px', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }} className="block mb-1.5">
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
                className="w-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50"
                style={{ background: '#0B0F0C', border: '1px solid rgba(214,163,19,0.18)', borderRadius: '10px', color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
              />
              <Lock className="absolute left-3 top-3.5 h-4 w-4" style={{ color: '#9AA397' }} />
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold px-3 py-2.5" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center py-3 text-sm font-bold cursor-pointer transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#D6A313', color: '#101510', borderRadius: '10px', fontFamily: 'Inter, sans-serif', minHeight: '46px', marginTop: '8px' }}
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

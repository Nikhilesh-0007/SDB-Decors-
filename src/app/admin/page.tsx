'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Lock, Mail, Loader2 } from 'lucide-react';
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
    } catch (err) {
      setError('Connection failed. Please try again.');
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-white">
        <div className="animate-pulse flex items-center space-x-2 text-sm font-semibold">
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12">
      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-dark border border-white/10 rounded-xl p-8 shadow-2xl space-y-6 text-center">
        {/* SGB Decors Logo */}
        <div className="flex flex-col items-center space-y-2">
          <Car className="h-10 w-10 text-primary fill-primary" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            SGB <span className="text-primary">Decors</span>
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-widest">
            Administrative Control Panel
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-bold text-white/75 uppercase tracking-wider block"
            >
              Email Address / Username
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder="admin@sgbdecors.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-white/25"
                required
                disabled={isLoggingIn}
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-white/35" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-bold text-white/75 uppercase tracking-wider block"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-white/25"
                required
                disabled={isLoggingIn}
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-white/35" />
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/95 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Checking Credentials...
              </>
            ) : (
              'Enter Admin'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { loginAdmin } from '@/lib/actions';

// Login Validation Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await loginAdmin(values.email, values.password);

      if (!result.success) {
        setErrorMsg(result.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // Success: Redirect to dashboard
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card border border-border/40 p-8 sm:p-10 rounded-3xl shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="font-display text-2xl font-bold tracking-tight text-primary">
            SGB<span className="text-accent">decors</span>
          </span>
          <h2 className="text-xl font-bold text-primary">Admin Portal</h2>
          <p className="text-xs text-foreground/50 font-light">
            Sign in to manage catalog, hero sections, coupons, and orders.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-xs font-semibold text-destructive">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="admin@sgbdecors.com"
                  {...register('email')}
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/80 focus:border-accent text-primary placeholder-foreground/45 transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-foreground/40" />
              </div>
              {errors.email && (
                <p className="text-[11px] font-semibold text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Secure Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/80 focus:border-accent text-primary placeholder-foreground/45 transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-foreground/40" />
              </div>
              {errors.password && (
                <p className="text-[11px] font-semibold text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center rounded-xl bg-primary py-3.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-accent hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Enter Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

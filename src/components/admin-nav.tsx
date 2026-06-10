'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Tag,
  Receipt,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { logoutAdmin } from '@/lib/actions';
import { cn } from '@/lib/utils';

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/admin/login');
    router.refresh();
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Orders', href: '/admin/orders', icon: Receipt },
    { name: 'Hero Settings', href: '/admin/hero', icon: ImageIcon },
  ];

  const activeLink = navLinks.find((link) => {
    if (link.href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(link.href);
  });

  return (
    <div className="min-h-screen bg-secondary/15 flex flex-col md:flex-row">
      {/* Mobile Header Toolbar */}
      <header className="md:hidden bg-card border-b border-border/40 p-4 flex items-center justify-between z-40 sticky top-0 shadow-xs">
        <span className="font-display text-xl font-bold tracking-tight text-primary">
          SGB<span className="text-accent">admin</span>
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-foreground/70 hover:text-primary"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border/40 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="hidden md:block">
            <span className="font-display text-2xl font-bold tracking-tight text-primary">
              SGB<span className="text-accent">admin</span>
            </span>
            <p className="text-[10px] text-foreground/40 font-light mt-1">CATALOG MANAGEMENT PORTAL</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-xs font-semibold'
                      : 'text-foreground/70 hover:bg-secondary/40 hover:text-primary'
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-6 border-t border-border/40">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-accent hover:bg-secondary/35 transition-colors"
          >
            <ExternalLink className="h-4.5 w-4.5 shrink-0" />
            <span>View Catalog</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden animate-in fade-in duration-300"
        />
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Toolbar (Desktop only) */}
        <header className="hidden md:flex bg-card border-b border-border/40 px-8 py-5 items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-primary font-display">
            {activeLink ? activeLink.name : 'Dashboard Overview'}
          </h2>
          <div className="text-xs text-foreground/40 font-light">
            LoggedIn Session: administrator
          </div>
        </header>

        {/* Content area */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-70px)] md:max-h-[calc(100vh-65px)]">
          {children}
        </div>
      </main>
    </div>
  );
}

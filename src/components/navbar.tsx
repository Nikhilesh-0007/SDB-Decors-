'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from './cart-provider';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount } = useCart();
  const pathname = usePathname();

  // Track window scroll to change navbar styling dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Catalog', href: '/products' },
  ];

  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return null; // The admin layout will render its own navigation/sidebar
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'glass-panel shadow-sm py-4' : 'bg-transparent py-6'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2">
            <span className="font-display text-2xl font-bold tracking-tight text-primary transition-colors group-hover:text-accent">
              SGB<span className="text-accent group-hover:text-primary transition-colors">decors</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-sm font-medium tracking-wide transition-colors hover:text-accent',
                  pathname === link.href ? 'text-accent font-semibold' : 'text-foreground/75'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-primary hover:text-accent transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 md:hidden text-primary hover:text-accent transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-card/95 border-b border-border shadow-lg p-6 flex flex-col space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'text-base font-medium tracking-wide py-2 border-b border-border/40 transition-colors hover:text-accent',
                pathname === link.href ? 'text-accent font-semibold' : 'text-foreground/75'
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/cart"
            className="flex items-center justify-between bg-primary text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-accent transition-colors duration-300"
          >
            <span>View Cart ({cartCount})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </header>
  );
}

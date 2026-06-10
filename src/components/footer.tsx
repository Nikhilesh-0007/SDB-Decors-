'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return null; // Admin views do not require the user-facing footer
  }

  return (
    <footer className="bg-primary text-white mt-24 border-t border-primary/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <span className="font-display text-2xl font-bold tracking-tight">
              SGB<span className="text-accent">decors</span>
            </span>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs font-light">
              Crafting refined home experiences through curated premium furniture, custom-designed lighting fixtures, and luxurious wall decor. Made to inspire elegant living.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent">Collections</h3>
            <ul className="space-y-2 text-sm text-white/70 font-light">
              <li>
                <Link href="/products?category=furniture" className="hover:text-accent transition-colors">
                  Living Furniture
                </Link>
              </li>
              <li>
                <Link href="/products?category=lighting" className="hover:text-accent transition-colors">
                  Designer Lighting
                </Link>
              </li>
              <li>
                <Link href="/products?category=wall-decor" className="hover:text-accent transition-colors">
                  Bespoke Wall Decor
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-accent transition-colors">
                  Home Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin & Support Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent">Customer Support</h3>
            <ul className="space-y-2 text-sm text-white/70 font-light">
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-accent transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-accent/80 text-white/40 text-xs hover:underline pt-4 block transition-colors">
                  Admin Dashboard Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-white/70 font-light">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 stroke-[1.5]" />
                <span>120 Luxury Avenue, Design District, NY 10013</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent shrink-0 stroke-[1.5]" />
                <a href="tel:+15551234567" className="hover:text-accent transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-accent shrink-0 stroke-[1.5]" />
                <a href="mailto:info@sgbdecors.com" className="hover:text-accent transition-colors">
                  info@sgbdecors.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 font-light">
          <p>&copy; {new Date().getFullYear()} SGBdecors. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 tracking-wider">PREMIUM CATALOG SYSTEM</p>
        </div>
      </div>
    </footer>
  );
}

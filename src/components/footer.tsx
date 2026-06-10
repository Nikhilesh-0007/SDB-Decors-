'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Mail, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true })
          .limit(5);
        if (data && !error) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories in footer:', err);
      }
    }
    loadCategories();
  }, []);

  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return null; // Admin views do not show the store footer
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

  return (
    <footer className="bg-[#0D1B14] text-white border-t border-[#C9A84C]/15 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center space-x-2.5">
              <Car className="h-6 w-6 text-[#C9A84C] fill-[#C9A84C]" />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                SGB <span className="text-[#C9A84C]">Decors</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs font-light">
              Premium Car & Bike Accessories. Engineered to upgrade your ride's styling, protection, and performance.
            </p>
            <div className="flex space-x-3 pt-1">
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-all" aria-label="Instagram">
                <svg className="h-4 w-4 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-all" aria-label="Facebook">
                <svg className="h-4 w-4 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {mounted ? (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-all" aria-label="WhatsApp">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.53 1.981 14.062.956 11.43.956c-5.44 0-9.866 4.372-9.87 9.802 0 1.64.45 3.238 1.302 4.646L1.821 21.8l6.164-1.597c1.01.551 2.093.84 3.19.843h.004zm9.95-6.852c-.29-.144-1.717-.837-1.983-.933-.266-.096-.46-.144-.652.144-.192.288-.744.933-.912 1.125-.168.192-.336.216-.626.072-1.355-.678-2.29-1.228-3.196-2.77-.24-.41.24-.38.686-1.25.075-.15.038-.282-.019-.396-.056-.114-.46-1.093-.63-1.49-.166-.388-.349-.335-.48-.342-.124-.007-.267-.008-.41-.008-.143 0-.376.053-.572.267-.197.214-.752.724-.752 1.764 0 1.04.767 2.04.873 2.183.107.143 1.51 2.277 3.657 3.193.51.218.909.348 1.22.444.512.162.977.139 1.345.085.41-.06 1.717-.69 1.959-1.358.242-.668.242-1.24.17-1.358-.073-.118-.266-.192-.557-.336z" />
                  </svg>
                </a>
              ) : (
                <div className="w-9 h-9 bg-white/5 rounded-full animate-pulse" />
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">Shop</h3>
            <ul className="space-y-2.5 text-sm text-white/50 font-light">
              <li><Link href="/products" className="hover:text-[#C9A84C] transition-colors">All Upgrades</Link></li>
              <li><Link href="/cart" className="hover:text-[#C9A84C] transition-colors">Shopping Cart</Link></li>
              <li><Link href="/admin" className="hover:text-[#C9A84C] transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">Categories</h3>
            <ul className="space-y-2.5 text-sm text-white/50 font-light">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.slug}`} className="hover:text-[#C9A84C] transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/products" className="hover:text-[#C9A84C] transition-colors">Car Accessories</Link></li>
                  <li><Link href="/products" className="hover:text-[#C9A84C] transition-colors">Bike Accessories</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white/50 font-light">
              <li className="flex items-center space-x-3">
                <MessageCircle className="h-4 w-4 text-[#C9A84C] shrink-0" />
                <span>Contact us via WhatsApp</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-[#C9A84C] shrink-0" />
                {mounted ? (
                  <a href={`https://wa.me/${whatsappNumber}`} className="hover:text-[#C9A84C] transition-colors">+{whatsappNumber}</a>
                ) : (
                  <span className="text-white/30">Loading...</span>
                )}
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-[#C9A84C] shrink-0" />
                <a href="mailto:info@sgbdecors.com" className="hover:text-[#C9A84C] transition-colors">info@sgbdecors.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-16 pt-8 border-t border-[#C9A84C]/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/25 font-light tracking-wider">
          <p>&copy; 2025 SGB Decors. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 uppercase tracking-widest">Premium Auto Accessories</p>
        </div>
      </div>
    </footer>
  );
}

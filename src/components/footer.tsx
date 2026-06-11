'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MessageCircle } from 'lucide-react';
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
        if (data && !error) setCategories(data);
      } catch (err) {
        console.error('Failed to load categories in footer:', err);
      }
    }
    loadCategories();
  }, []);

  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) return null;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919014868451';

  return (
    <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB' }} className="mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#D6A313" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2" />
                <path d="M9 17h6" />
                <path d="M14 7l-3 5h5" />
              </svg>
              <span style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                SDB Auto <span style={{ color: '#D6A313' }}>Accessories</span>
              </span>
            </Link>
            <p style={{ color: '#4B5563', fontSize: '13px', lineHeight: '1.6', fontFamily: 'var(--font-sans), sans-serif', maxWidth: '260px' }}>
              Premium car & bike accessories delivered across India. Styling, protection, and performance upgrades.
            </p>
            <div className="flex gap-2.5 pt-1">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full transition-all" style={{ border: '1px solid #E5E7EB', color: '#4B5563' }} aria-label="Instagram">
                <svg className="h-3.5 w-3.5 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full transition-all" style={{ border: '1px solid #E5E7EB', color: '#4B5563' }} aria-label="Facebook">
                <svg className="h-3.5 w-3.5 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {mounted && (
                <a href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent('Hi, I want to inquire about accessories from SDB Auto Accessories')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full transition-all" style={{ border: '1px solid #E5E7EB', color: '#4B5563' }} aria-label="WhatsApp">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.53 1.981 14.062.956 11.43.956c-5.44 0-9.866 4.372-9.87 9.802 0 1.64.45 3.238 1.302 4.646L1.821 21.8l6.164-1.597c1.01.551 2.093.84 3.19.843h.004zm9.95-6.852c-.29-.144-1.717-.837-1.983-.933-.266-.096-.46-.144-.652.144-.192.288-.744.933-.912 1.125-.168.192-.336.216-.626.072-1.355-.678-2.29-1.228-3.196-2.77-.24-.41.24-.38.686-1.25.075-.15.038-.282-.019-.396-.056-.114-.46-1.093-.63-1.49-.166-.388-.349-.335-.48-.342-.124-.007-.267-.008-.41-.008-.143 0-.376.053-.572.267-.197.214-.752.724-.752 1.764 0 1.04.767 2.04.873 2.183.107.143 1.51 2.277 3.657 3.193.51.218.909.348 1.22.444.512.162.977.139 1.345.085.41-.06 1.717-.69 1.959-1.358.242-.668.242-1.24.17-1.358-.073-.118-.266-.192-.557-.336z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h3 style={{ color: '#D6A313', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', fontFamily: 'var(--font-display), sans-serif' }} className="uppercase">SHOP</h3>
            <ul className="space-y-2">
              <li><Link href="/products" style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }} className="hover:text-[#D6A313] transition-colors">All Products</Link></li>
              <li><Link href="/cart" style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }} className="hover:text-[#D6A313] transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 style={{ color: '#D6A313', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', fontFamily: 'var(--font-display), sans-serif' }} className="uppercase">CATEGORIES</h3>
            <ul className="space-y-2">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.slug}`} style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }} className="hover:text-[#D6A313] transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/products" style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }} className="hover:text-[#D6A313] transition-colors">Car Accessories</Link></li>
                  <li><Link href="/products" style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }} className="hover:text-[#D6A313] transition-colors">Bike Accessories</Link></li>
                  <li><Link href="/products" style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }} className="hover:text-[#D6A313] transition-colors">Lighting</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 style={{ color: '#D6A313', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', fontFamily: 'var(--font-display), sans-serif' }} className="uppercase">CONTACT US</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0" style={{ color: '#D6A313' }} />
                {mounted ? (
                  <a href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent('Hi, I want to inquire about accessories from SDB Auto Accessories')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }} className="hover:text-[#D6A313] transition-colors">
                    WhatsApp: +{whatsappNumber}
                  </a>
                ) : (
                  <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Loading...</span>
                )}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" style={{ color: '#D6A313' }} />
                <span style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }}>+{whatsappNumber}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" style={{ color: '#D6A313' }} />
                <a href="mailto:info@sdbautoaccessories.com" style={{ color: '#4B5563', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }} className="hover:text-[#D6A313] transition-colors">info@sdbautoaccessories.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between"
          style={{ borderTop: '1px solid #E5E7EB' }}
        >
          <p style={{ color: '#9CA3AF', fontSize: '11px', fontFamily: 'var(--font-sans), sans-serif' }}>&copy; 2025 SDB Auto Accessories. All rights reserved.</p>
          <p style={{ color: '#9CA3AF', fontSize: '11px', fontFamily: 'var(--font-sans), sans-serif' }} className="mt-1.5 sm:mt-0">Premium Auto Accessories — India</p>
        </div>
      </div>
    </footer>
  );
}

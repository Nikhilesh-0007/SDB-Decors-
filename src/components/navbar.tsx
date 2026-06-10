'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true });
        if (data && !error) setCategories(data);
      } catch (err) {
        console.error('Failed to load categories in navbar:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowSearch(false);
    setShowCatDropdown(false);
  }, [pathname]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus();
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setShowCatDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) return null;

  const navLinksLeft = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'py-1.5' : 'py-2.5'
      )}
      style={{
        background: '#0B0F0C',
        borderBottom: '1px solid rgba(214,163,19,0.12)',
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#D6A313" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2" />
              <path d="M9 17h6" />
              <path d="M14 7l-3 5h5" />
            </svg>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 700, color: '#F8F3E8', letterSpacing: '-0.02em' }}>
              SGB <span style={{ color: '#D6A313' }}>Decors</span>
            </span>
          </Link>

          {/* Center Nav: Home, Products, Categories, Contact */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinksLeft.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: (link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href)) ? '#D6A313' : 'rgba(248,243,232,0.7)',
                }}
              >
                {link.label}
              </Link>
            ))}
            {/* Categories Dropdown */}
            <div className="relative" ref={catDropdownRef}>
              <button
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                className="flex items-center gap-1 cursor-pointer transition-colors duration-200 focus:outline-none"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(248,243,232,0.7)',
                }}
              >
                Categories
                <span className="text-[10px]">▾</span>
              </button>
              {showCatDropdown && (
                <div
                  className="absolute left-0 mt-3 w-48 py-2 z-50"
                  style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.2)', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setShowCatDropdown(false)}
                        className="block px-4 py-2 text-sm transition-colors hover:bg-white/5"
                        style={{ color: 'rgba(248,243,232,0.65)', fontFamily: 'Inter, sans-serif' }}
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs" style={{ color: '#8B938A' }}>No categories</div>
                  )}
                </div>
              )}
            </div>
            {/* Contact - last */}
            <Link
              href="/contact"
              className="transition-colors duration-200"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: pathname === '/contact' ? '#D6A313' : 'rgba(248,243,232,0.7)',
              }}
            >
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex items-center">
              {showSearch ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center overflow-hidden" style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.2)', borderRadius: '12px' }}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm px-3 py-2 w-40 sm:w-48 focus:outline-none"
                    style={{ color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
                  />
                  <button type="submit" className="p-2 cursor-pointer" style={{ color: '#D6A313' }}>
                    <Search className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setShowSearch(false)} className="p-2 cursor-pointer" style={{ color: '#8B938A' }}>
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2.5 cursor-pointer transition-colors duration-200"
                  style={{ color: 'rgba(248,243,232,0.7)' }}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 transition-colors duration-200" style={{ color: 'rgba(248,243,232,0.7)' }} aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: '#D6A313', color: '#101510' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* WhatsApp CTA - Desktop */}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-90"
              style={{ background: '#25D366', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 md:hidden cursor-pointer"
              style={{ color: 'rgba(248,243,232,0.7)' }}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="md:hidden absolute top-full left-0 w-full p-6 flex flex-col gap-3 z-50"
          style={{ background: '#0B0F0C', borderBottom: '1px solid rgba(214,163,19,0.15)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
        >
          <Link href="/" className="py-3 text-base font-medium transition-colors" style={{ color: pathname === '/' ? '#D6A313' : 'rgba(248,243,232,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}>Home</Link>
          <Link href="/products" className="py-3 text-base font-medium transition-colors" style={{ color: pathname?.startsWith('/products') ? '#D6A313' : 'rgba(248,243,232,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}>Products</Link>
          <div className="py-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase block mb-2" style={{ color: '#8B938A' }}>Categories</span>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="text-sm py-1.5 transition-colors"
                  style={{ color: 'rgba(248,243,232,0.6)', fontFamily: 'Inter, sans-serif' }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/contact" className="py-3 text-base font-medium transition-colors" style={{ color: pathname === '/contact' ? '#D6A313' : 'rgba(248,243,232,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}>Contact</Link>
          <div className="flex gap-3 pt-2">
            <Link
              href="/cart"
              className="flex-1 flex items-center justify-center py-3 text-sm font-semibold"
              style={{ background: '#D6A313', color: '#101510', borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}
            >
              View Cart ({cartCount})
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold"
              style={{ background: '#25D366', color: '#fff', borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

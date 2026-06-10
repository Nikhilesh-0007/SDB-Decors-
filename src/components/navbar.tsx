'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Car, ShoppingCart, Menu, X, Search } from 'lucide-react';
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

  // Load categories from Supabase on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true });
        if (data && !error) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories in navbar:', err);
      }
    }
    loadCategories();
  }, []);

  // Track window scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
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
    setShowSearch(false);
    setShowCatDropdown(false);
  }, [pathname]);

  // Focus search input when expanded
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close dropdown on click outside
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

  if (isAdminRoute) {
    return null; // The admin layout renders its own navigation sidebar
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 bg-[#0D1B14] text-white border-b border-[#C9A84C]/15',
        isScrolled ? 'shadow-xl shadow-black/20 py-2' : 'py-3'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
            <Car className="h-7 w-7 text-[#C9A84C] fill-[#C9A84C] group-hover:scale-110 transition-transform duration-200" />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              SGB <span className="text-[#C9A84C]">Decors</span>
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                'text-sm font-medium tracking-wide transition-all py-1 border-b-2 hover:border-[#C9A84C] hover:text-white',
                pathname === '/' ? 'border-[#C9A84C] text-white font-semibold' : 'border-transparent text-white/70'
              )}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={cn(
                'text-sm font-medium tracking-wide transition-all py-1 border-b-2 hover:border-[#C9A84C] hover:text-white',
                pathname === '/products' && !pathname.includes('category') ? 'border-[#C9A84C] text-white font-semibold' : 'border-transparent text-white/70'
              )}
            >
              Products
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={catDropdownRef}>
              <button
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                className="text-sm font-medium tracking-wide transition-all py-1 border-b-2 border-transparent hover:border-[#C9A84C] text-white/70 hover:text-white flex items-center space-x-1 focus:outline-none cursor-pointer"
              >
                <span>Categories</span>
                <span className="text-xs transition-transform duration-200">▾</span>
              </button>

              {showCatDropdown && (
                <div className="absolute left-0 mt-3 w-52 bg-[#0D1B14] border border-[#C9A84C]/20 rounded-xl shadow-2xl py-2 z-50">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setShowCatDropdown(false)}
                        className="block px-4 py-2.5 text-sm text-white/70 hover:text-[#C9A84C] hover:bg-white/5 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-white/40">No categories found</div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Inline Expandable Search */}
            <div className="relative flex items-center">
              {showSearch ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-white/8 border border-[#C9A84C]/30 rounded-lg overflow-hidden animate-in fade-in slide-in-from-right-3 duration-200">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search accessories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-white text-xs px-3 py-2 w-44 sm:w-52 focus:outline-none placeholder-white/40"
                  />
                  <button type="submit" className="p-2 text-[#C9A84C] hover:text-white transition-colors cursor-pointer">
                    <Search className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="p-2 text-white/40 hover:text-white transition-colors border-l border-white/10 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-white/60 hover:text-[#C9A84C] transition-colors focus:outline-none cursor-pointer"
                  aria-label="Open search bar"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-white/60 hover:text-[#C9A84C] transition-colors focus:outline-none"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#C9A84C] text-[9px] font-bold text-[#0D1B14]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 md:hidden text-white/60 hover:text-[#C9A84C] transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0D1B14] border-b border-[#C9A84C]/15 shadow-2xl p-6 flex flex-col space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">
          <Link
            href="/"
            className={cn(
              'text-base font-medium py-2.5 border-b border-white/5 transition-colors',
              pathname === '/' ? 'text-[#C9A84C]' : 'text-white/70 hover:text-[#C9A84C]'
            )}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={cn(
              'text-base font-medium py-2.5 border-b border-white/5 transition-colors',
              pathname === '/products' ? 'text-[#C9A84C]' : 'text-white/70 hover:text-[#C9A84C]'
            )}
          >
            All Products
          </Link>

          {/* Mobile Categories list */}
          <div className="py-2">
            <span className="text-[10px] font-semibold tracking-widest text-[#C9A84C]/60 uppercase block mb-3">
              Categories
            </span>
            <div className="grid grid-cols-2 gap-2">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="text-sm text-white/60 hover:text-[#C9A84C] py-1 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))
              ) : (
                <span className="text-xs text-white/30">None found</span>
              )}
            </div>
          </div>

          <Link
            href="/cart"
            className="flex items-center justify-center bg-[#C9A84C] text-[#0D1B14] py-3 px-4 rounded-lg text-sm font-bold hover:bg-[#B8943D] transition-colors"
          >
            View Cart ({cartCount})
          </Link>
        </div>
      )}
    </header>
  );
}

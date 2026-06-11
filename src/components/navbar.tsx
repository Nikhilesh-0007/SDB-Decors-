'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, MessageCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductSearch, SearchProduct } from '@/hooks/use-product-search';

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
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  // Search Autocomplete Hook
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    suggestions,
    isLoading: isSearchLoading,
    showDropdown: showSearchDropdown,
    setShowDropdown: setShowSearchDropdown,
    fetchAllProducts,
  } = useProductSearch();

  // Bouncing Cart and Flying Elements
  const [flyingItems, setFlyingItems] = useState<any[]>([]);
  const [bounceCart, setBounceCart] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const cartIconRef = useRef<HTMLAnchorElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919014868451';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent('Hi, I want to inquire about accessories from SDB Auto Accessories')}`;

  // Listen to Cart Added event for flying animation
  useEffect(() => {
    const handleCartFly = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { imageUrl, rect } = customEvent.detail;
      if (!imageUrl || !rect || !cartIconRef.current) return;

      const cartRect = cartIconRef.current.getBoundingClientRect();
      const id = Math.random().toString();

      setFlyingItems(prev => [
        ...prev,
        {
          id,
          imageUrl,
          startX: rect.left,
          startY: rect.top,
          startWidth: rect.width,
          startHeight: rect.height,
          endX: cartRect.left + cartRect.width / 2,
          endY: cartRect.top + cartRect.height / 2,
        }
      ]);

      // Complete flyer animation
      setTimeout(() => {
        setFlyingItems(prev => prev.filter(item => item.id !== id));
        setBounceCart(true);
      }, 800);
    };

    window.addEventListener('add-to-cart-animate', handleCartFly);
    return () => window.removeEventListener('add-to-cart-animate', handleCartFly);
  }, []);

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
    setSearchQuery('');
    setShowSearchDropdown(false);
  }, [pathname, setSearchQuery, setShowSearchDropdown]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      fetchAllProducts();
      setShowSearchDropdown(true);
    }
  }, [showSearch, fetchAllProducts, setShowSearchDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setShowCatDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSearchDropdown]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setShowSearchDropdown(false);
    }
  };

  const handleSuggestionClick = (product: SearchProduct) => {
    router.push(`/products/${product.slug}`);
    setShowSearch(false);
    setShowSearchDropdown(false);
  };

  // Term Highlighter
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const terms = search.trim().split(/\s+/).filter(Boolean).map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    if (terms.length === 0) return text;
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#D6A313]/10 text-primary font-bold rounded-xs px-0.5">{part}</mark>
      ) : (
        part
      )
    );
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
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#D6A313" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2" />
              <path d="M9 17h6" />
              <path d="M14 7l-3 5h5" />
            </svg>
            <span className="text-[13px] xs:text-sm sm:text-base md:text-lg font-bold tracking-tight shrink-0" style={{ fontFamily: 'var(--font-display), sans-serif', color: '#111827' }}>
              SDB Auto <span style={{ color: '#D6A313' }}>Accessories</span>
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
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: (link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href)) ? '#D6A313' : '#4B5563',
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
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#4B5563',
                }}
              >
                Categories
                <span className="text-[10px]">▾</span>
              </button>
              {showCatDropdown && (
                <div
                  className="absolute left-0 mt-3 w-48 py-2 z-50"
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link key={cat.id} href={`/products?category=${cat.slug}`}
                        onClick={() => setShowCatDropdown(false)}
                        className="block px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                        style={{ color: '#4B5563', fontFamily: 'var(--font-sans), sans-serif' }}
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs" style={{ color: '#9CA3AF' }}>No categories</div>
                  )}
                </div>
              )}
            </div>
            {/* Contact - last */}
            <Link
              href="/contact"
              className="transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: pathname === '/contact' ? '#D6A313' : '#4B5563',
              }}
            >
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <div ref={searchContainerRef} className="flex items-center">
              {showSearch ? (
                <div className="absolute inset-x-0 top-0 h-full bg-white z-50 flex items-center px-4 md:relative md:inset-auto md:h-auto md:bg-transparent md:px-0">
                  <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center overflow-hidden" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for car & bike accessories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-sm px-3 py-2 w-full md:w-48 focus:outline-none"
                      style={{ color: '#111827', fontFamily: 'var(--font-sans), sans-serif' }}
                    />
                    <div className="flex items-center pr-1.5 shrink-0">
                      {isSearchLoading && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin mr-1" />}
                      <button type="submit" className="p-1.5 cursor-pointer text-primary" aria-label="Submit Search">
                        <Search className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setShowSearch(false)} className="p-1.5 cursor-pointer text-muted" aria-label="Close Search">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </form>

                  {/* Navbar Search Suggestions Dropdown */}
                  {showSearchDropdown && searchQuery.trim() && (
                    <div className="absolute top-full right-0 left-0 md:left-auto mt-2 w-full md:w-80 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      {isSearchLoading && suggestions.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted flex items-center justify-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                          Searching...
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="divide-y divide-border/40 max-h-64 overflow-y-auto">
                          {suggestions.map((product) => {
                            const img = product.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=100';
                            return (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => handleSuggestionClick(product)}
                                className="w-full text-left p-2.5 hover:bg-bg/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <div className="relative h-8 w-8 rounded-md overflow-hidden bg-bg border border-border/40 flex-shrink-0">
                                  <img src={img} alt="" className="object-cover w-full h-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-dark truncate">
                                    {highlightText(product.name, searchQuery)}
                                  </div>
                                  {product.categories?.name && (
                                    <div className="text-[9px] text-muted tracking-wider uppercase">
                                      {product.categories.name}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs font-bold text-dark shrink-0">
                                  {formatCurrency(Number(product.price))}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-muted">
                          No items match &ldquo;<span className="font-semibold text-dark">{searchQuery}</span>&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-1.5 sm:p-2.5 cursor-pointer transition-colors duration-200"
                  style={{ color: '#4B5563' }}
                  aria-label="Search"
                >
                  <Search className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                </button>
              )}
            </div>

            {/* Cart */}
            <Link
              ref={cartIconRef}
              href="/cart"
              className="relative p-1.5 sm:p-2.5 transition-colors duration-200"
              style={{ color: '#4B5563' }}
              aria-label="Cart"
            >
              <ShoppingCart className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <motion.span
                  animate={bounceCart ? { scale: [1, 1.45, 0.85, 1.15, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  onAnimationComplete={() => setBounceCart(false)}
                  className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{ background: '#D6A313', color: '#FFFFFF' }}
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* WhatsApp CTA - Desktop */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-90"
              style={{ background: '#25D366', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 sm:p-2.5 md:hidden cursor-pointer"
              style={{ color: '#4B5563' }}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-[18px] w-[18px] sm:h-5 sm:w-5" /> : <Menu className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden absolute top-full left-0 w-full p-6 flex flex-col gap-3 z-50 overflow-hidden"
            style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}
          >
            <Link href="/" className="py-3 text-base font-medium transition-colors" style={{ color: pathname === '/' ? '#D6A313' : '#4B5563', borderBottom: '1px solid #F3F4F6', fontFamily: 'var(--font-sans), sans-serif' }}>Home</Link>
            <Link href="/products" className="py-3 text-base font-medium transition-colors" style={{ color: pathname?.startsWith('/products') ? '#D6A313' : '#4B5563', borderBottom: '1px solid #F3F4F6', fontFamily: 'var(--font-sans), sans-serif' }}>Products</Link>
            <div className="py-2">
              <span className="text-[10px] font-semibold tracking-widest uppercase block mb-2" style={{ color: '#9CA3AF' }}>Categories</span>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="text-sm py-1.5 transition-colors"
                    style={{ color: '#4B5563', fontFamily: 'var(--font-sans), sans-serif' }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/contact" className="py-3 text-base font-medium transition-colors" style={{ color: pathname === '/contact' ? '#D6A313' : '#4B5563', borderBottom: '1px solid #F3F4F6', fontFamily: 'var(--font-sans), sans-serif' }}>Contact</Link>
            <div className="flex gap-3 pt-2">
              <Link
                href="/cart"
                className="flex-1 flex items-center justify-center py-3 text-sm font-semibold"
                style={{ background: '#D6A313', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
              >
                View Cart ({cartCount})
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold"
                style={{ background: '#25D366', color: '#fff', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add to Cart Flying Items overlays */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              position: 'fixed',
              left: item.startX,
              top: item.startY,
              width: item.startWidth,
              height: item.startHeight,
              opacity: 0.9,
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            animate={{
              left: item.endX - 16,
              top: item.endY - 16,
              width: 32,
              height: 32,
              opacity: 0.15,
              scale: 0.2,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            className="border border-[#D6A313]/30 shadow-md bg-white"
          >
            <img src={item.imageUrl} alt="" className="object-cover w-full h-full" />
          </motion.div>
        ))}
      </AnimatePresence>
    </header>
  );
}

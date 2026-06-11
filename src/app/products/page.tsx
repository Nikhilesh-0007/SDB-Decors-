import React from 'react';
import Link from 'next/link';
import { Search, X, MessageCircle, Truck, ShieldCheck, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/product-card';
import CatalogControls from '@/components/catalog-controls';
import CatalogSearch from '@/components/catalog-search';

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export const revalidate = 0;

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category || 'all';
  const searchQuery = params.search || '';
  const sortBy = (params.sort || 'latest') as 'price-asc' | 'price-desc' | 'latest';

  let categories: any[] = [];
  let products: any[] = [];

  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });
    if (catData) categories = catData;
  } catch (err) {
    console.error('Error loading categories:', err);
  }

  try {
    let query = supabase
      .from('products')
      .select('*, categories(name, slug)');

    if (activeCategory !== 'all') {
      const { data: catRecord } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', activeCategory)
        .single();
      if (catRecord) {
        query = query.eq('category_id', catRecord.id);
      }
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    query = query.order('in_stock', { ascending: false });

    if (sortBy === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: prodData } = await query;
    if (prodData) products = prodData;
  } catch (err) {
    console.error('Error loading products:', err);
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919014868451';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(`Hi, I am looking for a product on SDB Auto Accessories. Category: ${activeCategory}, Search: ${searchQuery}`)}`;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* ═══════════ PAGE HEADER ═══════════ */}
      <section className="pt-16 pb-10 max-md:pt-10 max-md:pb-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <span
            className="inline-block mb-4"
            style={{
              background: 'rgba(214,163,19,0.1)',
              border: '1px solid rgba(214,163,19,0.25)',
              color: '#D6A313',
              fontFamily: 'var(--font-sans), sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              letterSpacing: '0.07em',
              padding: '4px 12px',
              borderRadius: '6px',
            }}
          >
            AUTO ACCESSORIES CATALOG
          </span>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.15,
            }}
          >
            Shop Premium Car & Bike Accessories
          </h1>

          {/* Subheading */}
          <p style={{ color: '#4B5563', fontSize: '14px', marginTop: '10px', maxWidth: '540px', lineHeight: 1.6, fontFamily: 'var(--font-sans), sans-serif' }}>
            Browse styling upgrades, protection gear, lighting, chargers and daily-use accessories for your ride.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 mt-5">
            {[
              { icon: Package, text: `${products.length} Products` },
              { icon: Truck, text: 'Fast Delivery' },
              { icon: MessageCircle, text: 'WhatsApp Support' },
            ].map((stat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5"
                style={{ color: '#4B5563', fontSize: '12px', fontFamily: 'var(--font-sans), sans-serif', fontWeight: 500 }}
              >
                <stat.icon className="h-3.5 w-3.5" style={{ color: '#D6A313' }} />
                {stat.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MAIN CATALOG LAYOUT ═══════════ */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 max-lg:flex-col">

            {/* ═══ SIDEBAR (Desktop) ═══ */}
            <aside className="hidden lg:block shrink-0" style={{ width: '260px' }}>
              <div className="sticky top-28 space-y-5">
                {/* Category Filter Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <h3 style={{ color: '#111827', fontFamily: 'var(--font-display), sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '14px' }}>
                    CATEGORIES
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href={{ pathname: '/products', query: { ...params, category: 'all' } }}
                        className="block px-3 py-2 text-sm font-medium transition-all duration-150"
                        style={{
                          borderRadius: '8px',
                          fontFamily: 'var(--font-sans), sans-serif',
                          background: activeCategory === 'all' ? 'rgba(214,163,19,0.08)' : 'transparent',
                          color: activeCategory === 'all' ? '#D6A313' : '#4B5563',
                          fontWeight: activeCategory === 'all' ? 600 : 500,
                        }}
                      >
                        All Products
                      </Link>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={{ pathname: '/products', query: { ...params, category: cat.slug } }}
                          className="block px-3 py-2 text-sm font-medium transition-all duration-150 hover:bg-gray-50"
                          style={{
                            borderRadius: '8px',
                            fontFamily: 'var(--font-sans), sans-serif',
                            background: activeCategory === cat.slug ? 'rgba(214,163,19,0.08)' : 'transparent',
                            color: activeCategory === cat.slug ? '#D6A313' : '#4B5563',
                            fontWeight: activeCategory === cat.slug ? 600 : 500,
                          }}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Active filters */}
                {(activeCategory !== 'all' || searchQuery) && (
                  <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ color: '#111827', fontFamily: 'var(--font-display), sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '10px' }}>
                      ACTIVE FILTERS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCategory !== 'all' && (
                        <Link
                          href={{ pathname: '/products', query: { ...params, category: 'all' } }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium"
                          style={{ background: 'rgba(214,163,19,0.08)', color: '#D6A313', borderRadius: '6px', fontFamily: 'var(--font-sans), sans-serif' }}
                        >
                          {activeCategory} <X className="h-3 w-3" />
                        </Link>
                      )}
                      {searchQuery && (
                        <Link
                          href={{ pathname: '/products', query: { ...params, search: '' } }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium"
                          style={{ background: 'rgba(214,163,19,0.08)', color: '#D6A313', borderRadius: '6px', fontFamily: 'var(--font-sans), sans-serif' }}
                        >
                          &ldquo;{searchQuery}&rdquo; <X className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    <Link href="/products" className="block mt-3 text-xs font-semibold" style={{ color: '#D6A313', fontFamily: 'var(--font-sans), sans-serif' }}>
                      Clear all
                    </Link>
                  </div>
                )}

                {/* WhatsApp Help Card */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #DCFCE7',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <h4 style={{ color: '#15803d', fontFamily: 'var(--font-display), sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                    Need help?
                  </h4>
                  <p style={{ color: '#374151', fontSize: '12px', lineHeight: 1.5, fontFamily: 'var(--font-sans), sans-serif', marginBottom: '14px' }}>
                    Tell us your vehicle model and we&apos;ll suggest the best accessory.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-full justify-center py-2.5 text-xs font-bold transition-all duration-200 hover:opacity-90"
                    style={{ background: '#25D366', color: '#fff', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Search + Sort Toolbar */}
              <div
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                }}
              >
                {/* Search Input */}
                <CatalogSearch
                  activeCategory={activeCategory}
                  sortBy={sortBy}
                  initialSearchQuery={searchQuery}
                />

                {/* Sort + Mobile Category */}
                <CatalogControls
                  activeCategory={activeCategory}
                  categories={categories}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                />
              </div>

              {/* Product Count */}
              <p style={{ color: '#4B5563', fontSize: '12px', fontFamily: 'var(--font-sans), sans-serif', paddingLeft: '4px' }}>
                Showing {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>

              {/* Product Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                  style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}
                >
                  <MessageCircle className="h-10 w-10" style={{ color: '#D6A313' }} />
                  <h3 style={{ color: '#111827', fontFamily: 'var(--font-display), sans-serif', fontSize: '18px', fontWeight: 700 }}>
                    No products found
                  </h3>
                  <p style={{ color: '#4B5563', fontSize: '13px', maxWidth: '300px', lineHeight: 1.6, fontFamily: 'var(--font-sans), sans-serif' }}>
                    We couldn&apos;t find upgrades matching your criteria. Let us know on WhatsApp and we&apos;ll source it!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold"
                      style={{ background: '#F3F4F6', color: '#111827', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                    >
                      Clear Filters
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold"
                      style={{ background: '#25D366', color: '#fff', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Ask on WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

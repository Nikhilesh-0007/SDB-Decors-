import React from 'react';
import Link from 'next/link';
import { Search, X, MessageCircle, Truck, ShieldCheck, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/product-card';
import CatalogControls from '@/components/catalog-controls';

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

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I am looking for a product on SGB Decors. Category: ${activeCategory}, Search: ${searchQuery}`)}`;

  return (
    <div style={{ background: '#0B0F0C', minHeight: '100vh' }}>
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
              fontFamily: 'Inter, sans-serif',
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
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#F8F3E8',
              lineHeight: 1.15,
            }}
          >
            Shop Premium Car & Bike Accessories
          </h1>

          {/* Subheading */}
          <p style={{ color: '#9AA397', fontSize: '14px', marginTop: '10px', maxWidth: '540px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
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
                style={{ color: '#9AA397', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
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
                    background: '#111811',
                    border: '1px solid rgba(214,163,19,0.22)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <h3 style={{ color: '#F8F3E8', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '14px' }}>
                    CATEGORIES
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href={{ pathname: '/products', query: { ...params, category: 'all' } }}
                        className="block px-3 py-2 text-sm font-medium transition-all duration-150"
                        style={{
                          borderRadius: '8px',
                          fontFamily: 'Inter, sans-serif',
                          background: activeCategory === 'all' ? 'rgba(214,163,19,0.12)' : 'transparent',
                          color: activeCategory === 'all' ? '#D6A313' : '#9AA397',
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
                          className="block px-3 py-2 text-sm font-medium transition-all duration-150 hover:bg-white/5"
                          style={{
                            borderRadius: '8px',
                            fontFamily: 'Inter, sans-serif',
                            background: activeCategory === cat.slug ? 'rgba(214,163,19,0.12)' : 'transparent',
                            color: activeCategory === cat.slug ? '#D6A313' : '#9AA397',
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
                  <div style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.22)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ color: '#F8F3E8', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '10px' }}>
                      ACTIVE FILTERS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCategory !== 'all' && (
                        <Link
                          href={{ pathname: '/products', query: { ...params, category: 'all' } }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium"
                          style={{ background: 'rgba(214,163,19,0.1)', color: '#D6A313', borderRadius: '6px', fontFamily: 'Inter, sans-serif' }}
                        >
                          {activeCategory} <X className="h-3 w-3" />
                        </Link>
                      )}
                      {searchQuery && (
                        <Link
                          href={{ pathname: '/products', query: { ...params, search: '' } }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium"
                          style={{ background: 'rgba(214,163,19,0.1)', color: '#D6A313', borderRadius: '6px', fontFamily: 'Inter, sans-serif' }}
                        >
                          &ldquo;{searchQuery}&rdquo; <X className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    <Link href="/products" className="block mt-3 text-xs font-semibold" style={{ color: '#D6A313', fontFamily: 'Inter, sans-serif' }}>
                      Clear all
                    </Link>
                  </div>
                )}

                {/* WhatsApp Help Card */}
                <div
                  style={{
                    background: '#172117',
                    border: '1px solid rgba(214,163,19,0.15)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <h4 style={{ color: '#F8F3E8', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                    Need help?
                  </h4>
                  <p style={{ color: '#9AA397', fontSize: '12px', lineHeight: 1.5, fontFamily: 'Inter, sans-serif', marginBottom: '14px' }}>
                    Tell us your vehicle model and we&apos;ll suggest the best accessory.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-full justify-center py-2.5 text-xs font-bold transition-all duration-200 hover:opacity-90"
                    style={{ background: '#25D366', color: '#fff', borderRadius: '10px', fontFamily: 'Inter, sans-serif' }}
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
                  background: '#111811',
                  border: '1px solid rgba(214,163,19,0.22)',
                  borderRadius: '12px',
                }}
              >
                {/* Search Input */}
                <form action="/products" method="GET" className="relative flex-grow max-w-md">
                  <input type="hidden" name="category" value={activeCategory} />
                  <input type="hidden" name="sort" value={sortBy} />
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchQuery}
                    placeholder="Search accessories..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50"
                    style={{
                      background: '#0B0F0C',
                      border: '1px solid rgba(214,163,19,0.15)',
                      borderRadius: '10px',
                      color: '#F8F3E8',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#9AA397' }} />
                </form>

                {/* Sort + Mobile Category */}
                <CatalogControls
                  activeCategory={activeCategory}
                  categories={categories}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                />
              </div>

              {/* Product Count */}
              <p style={{ color: '#9AA397', fontSize: '12px', fontFamily: 'Inter, sans-serif', paddingLeft: '4px' }}>
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
                  style={{ background: '#111811', borderRadius: '12px', border: '1px solid rgba(214,163,19,0.18)' }}
                >
                  <MessageCircle className="h-10 w-10" style={{ color: '#D6A313' }} />
                  <h3 style={{ color: '#F8F3E8', fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 700 }}>
                    No products found
                  </h3>
                  <p style={{ color: '#9AA397', fontSize: '13px', maxWidth: '300px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                    We couldn&apos;t find upgrades matching your criteria. Let us know on WhatsApp and we&apos;ll source it!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold"
                      style={{ background: '#F8F3E8', color: '#0B0F0C', borderRadius: '10px', fontFamily: 'Inter, sans-serif' }}
                    >
                      Clear Filters
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold"
                      style={{ background: '#25D366', color: '#fff', borderRadius: '10px', fontFamily: 'Inter, sans-serif' }}
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

import React from 'react';
import Link from 'next/link';
import { Search, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/product-card';
import CatalogControls from '@/components/catalog-controls';
import { cn } from '@/lib/utils';

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export const revalidate = 0; // Dynamic catalog page, fetch live data

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category || 'all';
  const searchQuery = params.search || '';
  const sortBy = (params.sort || 'latest') as 'price-asc' | 'price-desc' | 'latest';

  let categories: any[] = [];
  let products: any[] = [];

  // Fetch categories
  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });
    if (catData) {
      categories = catData;
    }
  } catch (err) {
    console.error('Error loading categories:', err);
  }

  // Fetch products
  try {
    let query = supabase
      .from('products')
      .select('*, categories(name, slug)');

    if (activeCategory !== 'all') {
      // First find category id
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

    // Always sort by in_stock descending first (so out-of-stock items are shown last)
    query = query.order('in_stock', { ascending: false });

    // Then apply selected sort option
    if (sortBy === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: prodData } = await query;
    if (prodData) {
      products = prodData;
    }
  } catch (err) {
    console.error('Error loading products:', err);
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I am looking for a product on SGB Decors. Active filters: Category: ${activeCategory}, Search: ${searchQuery}`)}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[70vh]">
      {/* Page Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="font-display text-3xl font-bold text-dark tracking-tight">Accessory Catalog</h1>
        <p className="text-sm text-muted mt-1 font-light">
          Browse premium styling upgrades, security, lighting, and performance modifications for your cars and bikes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* =========================================================================
            1. FILTERS SIDEBAR (Desktop)
           ========================================================================= */}
        <aside className="hidden lg:block space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Categories</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={{
                    pathname: '/products',
                    query: { ...params, category: 'all' },
                  }}
                  className={cn(
                    'text-sm transition-colors hover:text-primary font-medium block',
                    activeCategory === 'all' ? 'text-primary font-semibold' : 'text-muted hover:text-text'
                  )}
                >
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={{
                      pathname: '/products',
                      query: { ...params, category: cat.slug },
                    }}
                    className={cn(
                      'text-sm transition-colors hover:text-primary font-medium block',
                      activeCategory === cat.slug ? 'text-primary font-semibold' : 'text-muted hover:text-text'
                    )}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Applied filters status */}
          {(activeCategory !== 'all' || searchQuery) && (
            <div className="pt-6 border-t border-border space-y-3">
              <h4 className="text-xs font-semibold text-dark uppercase tracking-wider">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {activeCategory !== 'all' && (
                  <span className="inline-flex items-center space-x-1 bg-border/40 rounded-full px-3 py-1 text-xs font-medium text-dark">
                    <span>Category: {activeCategory}</span>
                    <Link href={{ pathname: '/products', query: { ...params, category: 'all' } }}>
                      <X className="h-3 w-3 hover:text-primary cursor-pointer" />
                    </Link>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center space-x-1 bg-border/40 rounded-full px-3 py-1 text-xs font-medium text-dark">
                    <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                    <Link href={{ pathname: '/products', query: { ...params, search: '' } }}>
                      <X className="h-3 w-3 hover:text-primary cursor-pointer" />
                    </Link>
                  </span>
                )}
              </div>
              <Link href="/products" className="text-xs text-primary hover:underline block pt-1 font-semibold">
                Clear all filters
              </Link>
            </div>
          )}
        </aside>

        {/* =========================================================================
            2. PRODUCT VIEWER GRID & SEARCH/SORT TOOLBAR
           ========================================================================= */}
        <section className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border/60 shadow-sm">
            {/* Search Input */}
            <form action="/products" method="GET" className="relative flex-grow max-w-md">
              <input type="hidden" name="category" value={activeCategory} />
              <input type="hidden" name="sort" value={sortBy} />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search catalog..."
                className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text placeholder-muted transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            </form>

            {/* Sorting & Small Screens Navigation */}
            <CatalogControls
              activeCategory={activeCategory}
              categories={categories}
              searchQuery={searchQuery}
              sortBy={sortBy}
            />
          </div>

          {/* Products Count */}
          <div className="text-xs text-muted font-light px-1">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>

          {/* Grid display */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-xl border border-border/60 shadow-sm">
              <MessageCircle className="h-10 w-10 text-primary animate-bounce" />
              <h3 className="font-semibold text-lg text-dark">No products found</h3>
              <p className="text-sm text-muted max-w-xs leading-relaxed font-light px-4">
                We couldn&apos;t find any upgrades matching your criteria. Let us know what you need on WhatsApp and we will source it!
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-lg bg-dark text-white text-xs font-semibold px-5 py-2.5 hover:bg-dark/95"
                >
                  Clear Filters
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-primary text-white text-xs font-semibold px-5 py-2.5 hover:bg-primary/95"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

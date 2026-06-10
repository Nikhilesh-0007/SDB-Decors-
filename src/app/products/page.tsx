import React from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { getProducts, getCategories } from '@/lib/actions';
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

export const revalidate = 0; // Dynamic catalog page, bypass static generation caches

export default async function ProductsPage({ searchParams }: PageProps) {
  // Await searchParams as per Next.js 15 App Router specifications
  const params = await searchParams;
  const activeCategory = params.category || 'all';
  const searchQuery = params.search || '';
  const sortBy = (params.sort || 'latest') as 'price-asc' | 'price-desc' | 'latest';

  // Fetch categories and products
  const categories = await getCategories();
  const products = await getProducts({
    categorySlug: activeCategory,
    searchQuery: searchQuery,
    sortBy: sortBy,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[70vh]">
      {/* Page Header */}
      <div className="border-b border-border/40 pb-6 mb-8">
        <h1 className="font-display text-3xl font-bold text-primary tracking-tight">Design Catalog</h1>
        <p className="text-sm text-foreground/60 mt-1 font-light">
          Browse through our collection of premium curated home furnishings and accent elements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* =========================================================================
            1. FILTERS SIDEBAR (Desktop)
           ========================================================================= */}
        <aside className="hidden lg:block space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Categories</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={{
                    pathname: '/products',
                    query: { ...params, category: 'all' },
                  }}
                  className={cn(
                    'text-sm transition-colors hover:text-accent font-medium block',
                    activeCategory === 'all' ? 'text-accent font-semibold' : 'text-foreground/70'
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
                      'text-sm transition-colors hover:text-accent font-medium block',
                      activeCategory === cat.slug ? 'text-accent font-semibold' : 'text-foreground/70'
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
            <div className="pt-6 border-t border-border/40 space-y-3">
              <h4 className="text-xs font-semibold text-primary uppercase tracking-widest">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {activeCategory !== 'all' && (
                  <span className="inline-flex items-center space-x-1 bg-secondary/50 rounded-full px-3 py-1 text-xs font-medium text-primary">
                    <span>Category: {activeCategory}</span>
                    <Link href={{ pathname: '/products', query: { ...params, category: 'all' } }}>
                      <X className="h-3 w-3 hover:text-accent cursor-pointer" />
                    </Link>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center space-x-1 bg-secondary/50 rounded-full px-3 py-1 text-xs font-medium text-primary">
                    <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                    <Link href={{ pathname: '/products', query: { ...params, search: '' } }}>
                      <X className="h-3 w-3 hover:text-accent cursor-pointer" />
                    </Link>
                  </span>
                )}
              </div>
              <Link href="/products" className="text-xs text-accent hover:underline block pt-1 font-medium">
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/40 shadow-xs">
            {/* Search Input */}
            <form action="/products" method="GET" className="relative flex-grow max-w-md">
              <input type="hidden" name="category" value={activeCategory} />
              <input type="hidden" name="sort" value={sortBy} />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search catalog..."
                className="w-full bg-secondary/30 border border-border/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/45 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
            </form>

            {/* Sorting & Small Screens Navigation (Client-side interactivity) */}
            <CatalogControls
              activeCategory={activeCategory}
              categories={categories}
              searchQuery={searchQuery}
              sortBy={sortBy}
            />
          </div>

          {/* Products Count */}
          <div className="text-xs text-foreground/50 font-light px-1">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>

          {/* Grid display */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-card rounded-2xl border border-border/30 border-dashed">
              <span className="text-4xl">🪴</span>
              <h3 className="font-semibold text-lg text-primary">No products found</h3>
              <p className="text-sm text-foreground/50 max-w-xs leading-relaxed font-light">
                We couldn&apos;t find any matching products in our catalog. Try clearing filters or checking other collections.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center bg-primary text-white py-2 px-5 rounded-lg text-xs font-semibold hover:bg-accent transition-colors"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

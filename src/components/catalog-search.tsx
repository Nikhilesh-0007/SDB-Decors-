'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';
import { useProductSearch, SearchProduct } from '@/hooks/use-product-search';
import { formatCurrency } from '@/lib/utils';

interface CatalogSearchProps {
  activeCategory: string;
  sortBy: string;
  initialSearchQuery: string;
}

export default function CatalogSearch({
  activeCategory,
  sortBy,
  initialSearchQuery,
}: CatalogSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    showDropdown,
    setShowDropdown,
    fetchAllProducts,
  } = useProductSearch();

  // Initialize query with initial search param
  useEffect(() => {
    setQuery(initialSearchQuery);
  }, [initialSearchQuery, setQuery]);

  // Debounced URL updates as the user types (updates page results dynamically)
  useEffect(() => {
    const delayUrl = setTimeout(() => {
      if (query.trim() !== initialSearchQuery) {
        const url = `/products?category=${activeCategory}&sort=${sortBy}&search=${encodeURIComponent(query.trim())}`;
        router.replace(url, { scroll: false });
      }
    }, 400); // 400ms debounce to prevent layout thrashing on every keypress

    return () => clearTimeout(delayUrl);
  }, [query, activeCategory, sortBy, initialSearchQuery, router]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = `/products?category=${activeCategory}&sort=${sortBy}&search=${encodeURIComponent(query.trim())}`;
    router.replace(url, { scroll: false });
    setShowDropdown(false);
  };

  const handleSuggestionClick = (product: SearchProduct) => {
    router.push(`/products/${product.slug}`);
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setQuery('');
    const url = `/products?category=${activeCategory}&sort=${sortBy}&search=`;
    router.replace(url, { scroll: false });
    setShowDropdown(false);
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

  return (
    <div ref={containerRef} className="relative flex-grow max-w-md">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={query}
          onFocus={() => {
            fetchAllProducts();
            setShowDropdown(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Search accessories..."
          className="w-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          style={{
            background: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            color: '#111827',
            fontFamily: 'var(--font-sans), sans-serif',
          }}
        />
        <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#4B5563' }} />

        {/* Loading and Clear icons */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {isLoading && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer text-muted hover:text-dark transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown List */}
      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {isLoading && suggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              Searching catalog...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="divide-y divide-border/40 max-h-76 overflow-y-auto">
              {suggestions.map((product) => {
                const img = product.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=100';
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full text-left p-3 hover:bg-bg/40 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-bg border border-border/40 flex-shrink-0">
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Name & Category info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-dark truncate">
                        {highlightText(product.name, query)}
                      </div>
                      {product.categories?.name && (
                        <div className="text-[10px] text-muted tracking-wider uppercase mt-0.5">
                          {product.categories.name}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-xs font-bold text-dark flex-shrink-0">
                      {formatCurrency(Number(product.price))}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-5 text-center text-xs text-muted">
              No products found matching &ldquo;<span className="font-semibold text-dark">{query}</span>&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

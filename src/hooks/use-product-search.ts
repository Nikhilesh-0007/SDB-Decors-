'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  description?: string;
  sku?: string;
  keywords?: string;
  category_id?: string;
  categories?: {
    name: string;
    slug: string;
  };
}

export function useProductSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const allProductsRef = useRef<SearchProduct[]>([]);
  const isFetchedRef = useRef(false);

  // Fetch all active products once on focus/load
  const fetchAllProducts = async () => {
    if (isFetchedRef.current) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('in_stock', true);
        
      if (!error && data) {
        allProductsRef.current = data as unknown as SearchProduct[];
        isFetchedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching search products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform search when query changes (with debouncing for smooth micro-interaction)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(() => {
      const lowerQ = query.toLowerCase().trim();
      const tokens = lowerQ.split(/\s+/).filter(Boolean);

      if (tokens.length === 0) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      const filtered = allProductsRef.current.filter((product) => {
        const name = (product.name || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const sku = (product.sku || '').toLowerCase();
        const keywords = (product.keywords || '').toLowerCase();
        const categoryName = (product.categories?.name || '').toLowerCase();

        // Check if ALL query tokens are matched in at least one of the product fields
        return tokens.every((token) => {
          return (
            name.includes(token) ||
            desc.includes(token) ||
            sku.includes(token) ||
            keywords.includes(token) ||
            categoryName.includes(token)
          );
        });
      });

      // Limit results to 6 items for clean autocomplete presentation
      setSuggestions(filtered.slice(0, 6));
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    showDropdown,
    setShowDropdown,
    fetchAllProducts,
  };
}

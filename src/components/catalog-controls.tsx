'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CatalogControlsProps {
  activeCategory: string;
  categories: Array<{ id: string; name: string; slug: string }>;
  searchQuery: string;
  sortBy: string;
}

export default function CatalogControls({
  activeCategory,
  categories,
  searchQuery,
  sortBy,
}: CatalogControlsProps) {
  const router = useRouter();

  const handleCategoryChange = (val: string) => {
    router.push(`/products?category=${val}&search=${searchQuery}&sort=${sortBy}`);
  };

  const handleSortChange = (val: string) => {
    router.push(`/products?category=${activeCategory}&search=${searchQuery}&sort=${val}`);
  };

  return (
    <div className="flex items-center gap-3 justify-between sm:justify-end">
      {/* Mobile Category Filter */}
      <div className="lg:hidden flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 shrink-0" style={{ color: '#4B5563' }} />
        <select
          value={activeCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="border-none text-sm font-medium focus:outline-none cursor-pointer"
          style={{ background: 'transparent', color: '#111827', fontFamily: 'var(--font-sans), sans-serif' }}
        >
          <option value="all" style={{ background: '#FFFFFF', color: '#111827' }}>All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug} style={{ background: '#FFFFFF', color: '#111827' }}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 shrink-0" style={{ color: '#4B5563' }} />
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border-none text-sm font-medium focus:outline-none cursor-pointer"
          style={{ background: 'transparent', color: '#D6A313', fontFamily: 'var(--font-sans), sans-serif' }}
        >
          <option value="latest" style={{ background: '#FFFFFF', color: '#111827' }}>Latest</option>
          <option value="price-asc" style={{ background: '#FFFFFF', color: '#111827' }}>Price: Low to High</option>
          <option value="price-desc" style={{ background: '#FFFFFF', color: '#111827' }}>Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}

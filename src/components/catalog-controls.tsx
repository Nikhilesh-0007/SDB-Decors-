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
        <SlidersHorizontal className="h-4 w-4 shrink-0" style={{ color: '#9AA397' }} />
        <select
          value={activeCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="border-none text-sm font-medium focus:outline-none cursor-pointer"
          style={{ background: 'transparent', color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
        >
          <option value="all" style={{ background: '#111811', color: '#F8F3E8' }}>All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug} style={{ background: '#111811', color: '#F8F3E8' }}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 shrink-0" style={{ color: '#9AA397' }} />
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border-none text-sm font-medium focus:outline-none cursor-pointer"
          style={{ background: 'transparent', color: '#D6A313', fontFamily: 'Inter, sans-serif' }}
        >
          <option value="latest" style={{ background: '#111811', color: '#F8F3E8' }}>Latest</option>
          <option value="price-asc" style={{ background: '#111811', color: '#F8F3E8' }}>Price: Low to High</option>
          <option value="price-desc" style={{ background: '#111811', color: '#F8F3E8' }}>Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}

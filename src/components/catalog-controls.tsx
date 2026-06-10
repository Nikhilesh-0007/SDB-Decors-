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
    <div className="flex items-center space-x-3 justify-between sm:justify-end">
      {/* Mobile Filter indicator */}
      <div className="lg:hidden flex items-center space-x-2">
        <SlidersHorizontal className="h-4 w-4 text-muted" />
        <select
          value={activeCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="bg-transparent border-none text-sm font-medium focus:outline-none text-text cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Selector */}
      <div className="flex items-center space-x-2 border-l border-border/40 pl-3 lg:border-none lg:pl-0">
        <ArrowUpDown className="h-4 w-4 text-muted" />
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="bg-transparent border-none text-sm font-medium focus:outline-none text-primary cursor-pointer"
        >
          <option value="latest">Latest Summary</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}

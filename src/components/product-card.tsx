'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn, formatCurrency } from '@/lib/utils';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    in_stock: boolean;
    category_id?: string;
    categories?: {
      name: string;
      slug: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.in_stock) return;

    addToCart({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image: mainImage,
      slug: product.slug,
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden bg-white rounded-2xl hover:shadow-xl transition-all duration-300 border border-border/50 hover:-translate-y-1.5 hover:border-[#C9A84C]/40">
      {/* Product Image Area */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-bg block">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-108"
        />
        {/* Subtle dark gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        {product.categories && (
          <span className="absolute top-3 left-3 z-10 bg-[#0D1B14]/90 backdrop-blur-sm text-[#C9A84C] text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-[#C9A84C]/30">
            {product.categories.name}
          </span>
        )}

        {/* Out of stock Overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-[#0D1B14] text-white text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-sans text-sm font-semibold text-text tracking-tight line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors leading-snug">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-base font-bold text-[#0A7255] font-display">
            {formatCurrency(Number(product.price))}
          </p>
        </div>

        <div className="mt-4">
          <button
            onClick={handleQuickAdd}
            disabled={!product.in_stock}
            className={cn(
              'w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer',
              product.in_stock
                ? 'bg-[#C9A84C] text-[#0D1B14] hover:bg-[#B8943D] shadow-sm hover:shadow-md'
                : 'bg-border text-muted cursor-not-allowed'
            )}
            aria-label="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{!product.in_stock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

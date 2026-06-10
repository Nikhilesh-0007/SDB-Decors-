'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from './cart-provider';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    is_out_of_stock: boolean;
    categories?: {
      name: string;
      slug: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.is_out_of_stock) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: mainImage,
      slug: product.slug,
    });

    // We can show a native alert or custom notification here
    // Let's rely on standard browser feedback for now or we will add a floating confirmation
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:shadow-md hover:border-accent/30">
      {/* Image Gallery Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        {/* Availability Badge */}
        {product.is_out_of_stock ? (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-destructive px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-white shadow-sm">
            Out of Stock
          </span>
        ) : product.price > 500 ? (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-white shadow-sm">
            Exclusive
          </span>
        ) : null}
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          {product.categories && (
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1.5">
              {product.categories.name}
            </p>
          )}
          <h3 className="text-base font-medium text-primary tracking-tight line-clamp-1 hover:text-accent transition-colors">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-primary font-display">
            {formatCurrency(Number(product.price))}
          </p>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={product.is_out_of_stock}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300',
              product.is_out_of_stock
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-white hover:bg-accent shadow-sm'
            )}
            aria-label="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

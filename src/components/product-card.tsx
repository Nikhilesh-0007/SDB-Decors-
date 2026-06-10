'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
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
  const { addToCart, updateQuantity, cartItems } = useCart();
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400';

  const cartItem = cartItems.find((item) => item.product_id === product.id);
  const qty = cartItem?.qty || 0;

  const handleAdd = (e: React.MouseEvent) => {
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

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, qty + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, qty - 1);
  };

  return (
    <div
      className="group relative flex flex-col overflow-hidden transition-all duration-300 h-full"
      style={{
        background: '#111811',
        borderRadius: '12px',
        border: '1px solid rgba(214,163,19,0.18)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(214,163,19,0.45)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(214,163,19,0.18)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
      }}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative w-full overflow-hidden block" style={{ height: '240px' }}>
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.categories && (
          <span
            className="absolute top-3 left-3 z-10 uppercase"
            style={{
              background: 'rgba(11,15,12,0.85)',
              backdropFilter: 'blur(4px)',
              color: '#D6A313',
              fontSize: '9px',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.08em',
              padding: '4px 9px',
              borderRadius: '6px',
            }}
          >
            {product.categories.name}
          </span>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span style={{ background: '#0B0F0C', color: '#F8F3E8', fontSize: '11px', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', fontFamily: 'Inter, sans-serif', border: '1px solid rgba(214,163,19,0.3)' }}>
              SOLD OUT
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 pb-3 justify-between">
        <h3
          className="line-clamp-2"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#F8F3E8', lineHeight: '1.45', minHeight: '40px' }}
        >
          <Link href={`/products/${product.slug}`} className="hover:underline decoration-[#D6A313]/40">{product.name}</Link>
        </h3>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <p style={{ color: '#D6A313', fontSize: '18px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
            {formatCurrency(Number(product.price))}
          </p>
          {product.in_stock && (
            <span className="flex items-center gap-1" style={{ color: '#4ade80', fontSize: '10px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#4ade80' }} />
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart / Quantity Stepper */}
      {qty > 0 ? (
        <div
          className="w-full flex items-center justify-between"
          style={{
            background: '#0B0F0C',
            borderTop: '1px solid rgba(214,163,19,0.22)',
            borderRadius: '0 0 12px 12px',
            minHeight: '46px',
          }}
        >
          <button
            onClick={handleDecrease}
            className="flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-white/5"
            style={{ width: '52px', height: '46px', color: '#D6A313' }}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span style={{ color: '#F8F3E8', fontSize: '15px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
            {qty}
          </span>
          <button
            onClick={handleIncrease}
            className="flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-white/5"
            style={{ width: '52px', height: '46px', color: '#D6A313' }}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAdd}
          disabled={!product.in_stock}
          className={cn(
            'w-full flex items-center justify-center gap-2 cursor-pointer transition-all duration-200',
            !product.in_stock && 'cursor-not-allowed'
          )}
          style={{
            background: product.in_stock ? '#D6A313' : '#1a2a1a',
            color: product.in_stock ? '#101510' : '#666',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            padding: '13px 16px',
            borderTop: '1px solid rgba(214,163,19,0.12)',
            borderRadius: '0 0 12px 12px',
            minHeight: '46px',
          }}
          onMouseEnter={(e) => { if (product.in_stock) e.currentTarget.style.background = '#b88b0f'; }}
          onMouseLeave={(e) => { if (product.in_stock) e.currentTarget.style.background = '#D6A313'; }}
          aria-label="Add to Cart"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{!product.in_stock ? 'Sold Out' : 'Add to Cart'}</span>
        </button>
      )}
    </div>
  );
}

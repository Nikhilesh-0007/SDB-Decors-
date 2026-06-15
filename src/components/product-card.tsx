'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
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
    stock?: number;
    category_id?: string;
    categories?: {
      name: string;
      slug: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, updateQuantity, cartItems } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400';

  const cartItem = cartItems.find((item) => item.product_id === product.id);
  const qty = cartItem?.qty || 0;

  const stock = product.stock !== undefined && product.stock !== null ? product.stock : (product.in_stock ? 10 : 0);
  const isOutOfStock = stock <= 0 || !product.in_stock;
  const maxQty = Math.min(20, stock);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isSuccess) return;

    // Bounding Client Rect for flying animation
    const container = e.currentTarget.closest('.product-card-container');
    const imgEl = container?.querySelector('.product-image-el');
    const rect = imgEl
      ? imgEl.getBoundingClientRect()
      : e.currentTarget.getBoundingClientRect();

    window.dispatchEvent(new CustomEvent('add-to-cart-animate', {
      detail: {
        imageUrl: mainImage,
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }
      }
    }));

    // Trigger Success feedback
    setIsSuccess(true);
    addToCart({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image: mainImage,
      slug: product.slug,
      category_id: product.category_id,
    });

    setTimeout(() => {
      setIsSuccess(false);
    }, 850);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty < maxQty) {
      updateQuantity(product.id, qty + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, qty - 1);
  };

  return (
    <div
      className="product-card-container group relative flex flex-col overflow-hidden transition-all duration-300 h-full"
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(214,163,19,0.3)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
      }}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative w-full overflow-hidden block" style={{ height: '240px' }}>
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="product-image-el object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.categories && (
          <span
            className="absolute top-3 left-3 z-10 uppercase"
            style={{
              background: '#F3F4F6',
              color: '#4B5563',
              fontSize: '9px',
              fontWeight: 700,
              fontFamily: 'var(--font-sans), sans-serif',
              letterSpacing: '0.08em',
              padding: '4px 9px',
              borderRadius: '6px',
            }}
          >
            {product.categories.name}
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span style={{ background: '#FFFFFF', color: '#111827', fontSize: '11px', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', fontFamily: 'var(--font-sans), sans-serif', border: '1px solid #E5E7EB' }}>
              SOLD OUT
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 pb-3 justify-between">
        <h3
          className="line-clamp-2"
          style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: '1.45', minHeight: '40px' }}
        >
          <Link href={`/products/${product.slug}`} className="hover:underline decoration-[#D6A313]/40">{product.name}</Link>
        </h3>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <p style={{ color: '#111827', fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display), sans-serif' }}>
            {formatCurrency(Number(product.price))}
          </p>
          {isOutOfStock ? (
            <span className="flex items-center gap-1" style={{ color: '#ef4444', fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#ef4444' }} />
              Out of Stock
            </span>
          ) : stock <= 5 ? (
            <span className="flex items-center gap-1" style={{ color: '#f59e0b', fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#f59e0b' }} />
              Low Stock ({stock})
            </span>
          ) : (
            <span className="flex items-center gap-1" style={{ color: '#10b981', fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#10b981' }} />
              Available
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart / Quantity Stepper */}
      {(qty > 0 && !isSuccess && !isOutOfStock) ? (
        <div
          className="w-full flex items-center justify-between"
          style={{
            background: '#F3F4F6',
            borderTop: '1px solid #E5E7EB',
            borderRadius: '0 0 12px 12px',
            minHeight: '46px',
          }}
        >
          <button
            onClick={handleDecrease}
            className="flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-gray-200"
            style={{ width: '52px', height: '46px', color: '#D6A313' }}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span style={{ color: '#111827', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-sans), sans-serif' }}>
            {qty}
          </span>
          <button
            onClick={handleIncrease}
            disabled={qty >= maxQty}
            className="flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-gray-200 disabled:opacity-45"
            style={{ width: '52px', height: '46px', color: '#D6A313' }}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={cn(
            'w-full flex items-center justify-center gap-2 cursor-pointer transition-all duration-200',
            isOutOfStock && 'cursor-not-allowed',
            isSuccess && 'bg-emerald-600 text-white'
          )}
          style={{
            background: isSuccess
              ? '#10B981'
              : (!isOutOfStock ? '#D6A313' : '#F3F4F6'),
            color: (!isOutOfStock || isSuccess) ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: 'var(--font-sans), sans-serif',
            padding: '13px 16px',
            borderTop: '1px solid #E5E7EB',
            borderRadius: '0 0 12px 12px',
            minHeight: '46px',
          }}
          onMouseEnter={(e) => { if (!isOutOfStock && !isSuccess) e.currentTarget.style.background = '#b88b0f'; }}
          onMouseLeave={(e) => { if (!isOutOfStock && !isSuccess) e.currentTarget.style.background = '#D6A313'; }}
          aria-label={isSuccess ? "Added to Cart" : "Add to Cart"}
        >
          {isSuccess ? (
            <>
              <Check className="h-4 w-4 animate-bounce" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

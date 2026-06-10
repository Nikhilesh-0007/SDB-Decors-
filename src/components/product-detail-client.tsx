'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Minus, Plus, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from './cart-provider';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
    is_out_of_stock: boolean;
    category_id: string;
    categories?: {
      name: string;
      slug: string;
    };
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const images = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'];

  const handleQuantityChange = (val: number) => {
    const nextVal = quantity + val;
    if (nextVal >= 1 && nextVal <= Math.max(1, product.stock)) {
      setQuantity(nextVal);
    }
  };

  const handleAddToCart = () => {
    if (product.is_out_of_stock) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: images[0],
      slug: product.slug,
    }, quantity);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      {/* 1. IMAGE GALLERY */}
      <div className="space-y-4">
        {/* Main image view */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted border border-border/40">
          <Image
            src={images[activeImageIdx]}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-opacity duration-300"
            priority
          />
        </div>

        {/* Thumbnail Selector list */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  'relative aspect-square h-20 w-20 overflow-hidden rounded-xl bg-muted border-2 transition-all shrink-0',
                  activeImageIdx === idx ? 'border-accent' : 'border-transparent hover:border-border/60'
                )}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. PRODUCT INFO & BUY BOX */}
      <div className="space-y-6 flex flex-col justify-center">
        {/* Category Label */}
        {product.categories && (
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {product.categories.name}
          </span>
        )}

        {/* Product Title */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary leading-tight">
          {product.name}
        </h1>

        {/* Price Tag */}
        <p className="text-2xl font-bold font-display text-primary">
          {formatCurrency(Number(product.price))}
        </p>

        {/* Product Description */}
        <p className="text-sm sm:text-base text-foreground/70 leading-relaxed font-light">
          {product.description || 'No description available for this luxury catalog item.'}
        </p>

        {/* Availability Details */}
        <div className="pt-2">
          {product.is_out_of_stock ? (
            <span className="inline-flex items-center rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">
              Currently Unavailable
            </span>
          ) : (
            <div className="space-y-1">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                In Stock ({product.stock} items left)
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        {!product.is_out_of_stock && (
          <div className="pt-6 border-t border-border/40 space-y-6">
            {/* Quantity select */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-foreground/70">Quantity</span>
              <div className="flex items-center border border-border/60 rounded-xl overflow-hidden bg-secondary/20">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2.5 text-foreground/60 hover:text-primary disabled:opacity-30 disabled:hover:text-foreground/60 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-primary">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="p-2.5 text-foreground/60 hover:text-primary disabled:opacity-30 disabled:hover:text-foreground/60 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className={cn(
                  'flex-grow inline-flex items-center justify-center rounded-xl py-4 px-8 text-sm font-semibold text-white shadow-sm transition-all duration-300',
                  isAdded
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-primary hover:bg-accent hover:-translate-y-0.5'
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Order List
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Benefits Badges */}
        <div className="pt-6 border-t border-border/40 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-1">
            <Truck className="h-5 w-5 text-accent stroke-[1.2]" />
            <span className="text-[10px] font-semibold text-primary">Secure Delivery</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <ShieldCheck className="h-5 w-5 text-accent stroke-[1.2]" />
            <span className="text-[10px] font-semibold text-primary">Original Design</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <RefreshCw className="h-5 w-5 text-accent stroke-[1.2]" />
            <span className="text-[10px] font-semibold text-primary">WhatsApp Help</span>
          </div>
        </div>
      </div>
    </div>
  );
}

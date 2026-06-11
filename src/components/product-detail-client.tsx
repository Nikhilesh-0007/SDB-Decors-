'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, Check, ShieldCheck, Truck, MessageSquare } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    in_stock: boolean;
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
    : ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800'];

  const handleQuantityChange = (val: number) => {
    const nextVal = quantity + val;
    if (nextVal >= 1 && nextVal <= 20) {
      setQuantity(nextVal);
    }
  };

  const handleAddToCart = () => {
    if (!product.in_stock) return;

    // Bounding Client Rect for flying animation
    const imgEl = document.querySelector('.product-gallery-container img');
    const rect = imgEl
      ? imgEl.getBoundingClientRect()
      : document.querySelector('.product-gallery-container')?.getBoundingClientRect();

    if (rect) {
      window.dispatchEvent(new CustomEvent('add-to-cart-animate', {
        detail: {
          imageUrl: images[activeImageIdx],
          rect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
        }
      }));
    }

    addToCart({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image: images[0],
      slug: product.slug,
    }, quantity);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      {/* 1. IMAGE GALLERY */}
      <div className="space-y-4">
        {/* Main image view */}
        <div className="product-gallery-container relative aspect-square w-full overflow-hidden rounded-xl bg-white border border-border/60 shadow-sm">
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
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  'relative aspect-square h-16 w-16 overflow-hidden rounded-lg bg-white border-2 transition-all shrink-0 cursor-pointer',
                  activeImageIdx === idx ? 'border-[#D6A313]' : 'border-transparent hover:border-border'
                )}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D6A313]">
            {product.categories.name}
          </span>
        )}

        {/* Product Title */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-dark leading-tight">
          {product.name}
        </h1>

        {/* Price Tag */}
        <p className="text-3xl font-bold font-display text-[#111827]">
          {formatCurrency(Number(product.price))}
        </p>

        {/* Product Description */}
        <div className="border-t border-border pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark mb-2">Description</h4>
          <p className="text-sm text-muted leading-relaxed font-light">
            {product.description || 'No description available for this premium upgrade accessory.'}
          </p>
        </div>

        {/* Availability Details */}
        <div className="pt-2">
          {!product.in_stock ? (
            <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">
              Currently Out of Stock
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
              ✓ In Stock & Ready to Ship
            </span>
          )}
        </div>

        {/* Action Controls */}
        {product.in_stock && (
          <div className="pt-6 border-t border-border space-y-6">
            {/* Quantity select */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-dark">Quantity</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-bg">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 text-muted hover:text-dark disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-dark">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 20}
                  className="p-2 text-muted hover:text-dark disabled:opacity-30 transition-colors cursor-pointer"
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
                  'flex-grow inline-flex items-center justify-center rounded-lg py-3.5 px-8 text-sm font-bold text-white shadow-sm transition-all duration-200 cursor-pointer',
                  isAdded
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-[#D6A313] hover:bg-[#b88b0f] text-white hover:shadow-lg'
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Shopping Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4.5 w-4.5" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Benefits Badges */}
        <div className="pt-6 border-t border-border grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-1">
            <Truck className="h-5 w-5 text-[#D6A313] stroke-[1.5]" />
            <span className="text-[10px] font-bold text-dark uppercase tracking-wider">Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <ShieldCheck className="h-5 w-5 text-[#D6A313] stroke-[1.5]" />
            <span className="text-[10px] font-bold text-dark uppercase tracking-wider">100% Genuine</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <MessageSquare className="h-5 w-5 text-[#D6A313] stroke-[1.5]" />
            <span className="text-[10px] font-bold text-dark uppercase tracking-wider">WhatsApp Help</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Tag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    total,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setIsValidating(true);
    try {
      const codeToQuery = couponInput.trim().toUpperCase();
      const { data, error } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, is_active')
        .eq('code', codeToQuery)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setCouponError('Invalid or inactive coupon code.');
      } else {
        applyCoupon({
          id: data.id,
          code: data.code,
          discount_type: data.discount_type as 'percent' | 'flat',
          discount_value: Number(data.discount_value),
        });
        setCouponSuccess(`Coupon "${data.code}" applied successfully!`);
        setCouponInput('');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess('');
    setCouponError('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-5 bg-white rounded-xl border border-border/60 p-12 max-w-md mx-auto shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg text-primary">
            <ShoppingCart className="h-7 w-7 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-dark tracking-tight">Your Cart is Empty</h1>
            <p className="text-sm text-muted font-light leading-relaxed max-w-xs px-4">
              Looks like you haven&apos;t added any automotive upgrades to your shopping cart yet.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-primary/95 transition-all duration-200"
          >
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-dark tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            1. CART ITEMS LIST (Left Column - 8 Cols)
           ========================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center gap-4 sm:gap-6 bg-white p-4 sm:p-5 rounded-xl border border-border/60 shadow-sm relative"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-square h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-lg bg-bg border border-border/40 shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              {/* Info & Quantity controls */}
              <div className="flex-grow flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-semibold text-dark tracking-tight hover:text-primary transition-colors line-clamp-2 pr-6">
                    <Link href={`/products/${item.slug}`}>{item.name}</Link>
                  </h3>
                  <p className="text-sm text-primary font-bold font-display">
                    {formatCurrency(Number(item.price))}
                  </p>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-border rounded-lg overflow-hidden bg-bg">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.qty - 1)}
                      className="p-1.5 text-muted hover:text-dark transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-dark">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.qty + 1)}
                      className="p-1.5 text-muted hover:text-dark transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-2 text-muted hover:text-primary transition-colors cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================================
            2. ORDER SUMMARY CARD (Right Column - 4 Cols)
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-border/60 p-6 shadow-sm space-y-6">
            <h3 className="font-display text-lg font-bold text-dark">Order Summary</h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-muted font-light">
                <span>Subtotal</span>
                <span className="font-bold text-dark">{formatCurrency(subtotal)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-success font-light">
                  <span className="flex items-center">
                    <Tag className="mr-1.5 h-3.5 w-3.5" />
                    Discount ({coupon.code})
                  </span>
                  <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted font-light">
                <span>Shipping</span>
                <span className="text-success font-bold uppercase tracking-wider text-xs">Free</span>
              </div>

              <div className="border-t border-border pt-4 flex justify-between font-display text-base font-bold text-dark">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Coupon Input Form */}
            <div className="pt-4 border-t border-border">
              {coupon ? (
                /* Coupon Active Display */
                <div className="bg-emerald-50 rounded-lg p-3.5 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-800">
                      {coupon.code} ({coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)} Off)
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Coupon Input Box */
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label htmlFor="coupon" className="text-xs font-medium text-muted block">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="coupon"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={isValidating}
                      className="flex-grow bg-bg border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-dark placeholder-muted uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isValidating}
                      className="bg-dark text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-dark/95 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {isValidating ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs font-medium text-primary">{couponError}</p>}
                  {couponSuccess && <p className="text-xs font-medium text-success">{couponSuccess}</p>}
                </form>
              )}
            </div>

            {/* Checkout Action Button */}
            <Link
              href="/checkout"
              className="w-full inline-flex items-center justify-center rounded-lg bg-primary py-3 px-6 text-sm font-bold text-white hover:bg-primary/95 transition-all duration-200 text-center"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

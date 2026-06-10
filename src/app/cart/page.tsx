'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { validateCoupon } from '@/lib/actions';
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
      const result = await validateCoupon(couponInput);
      if (result.isValid && result.coupon) {
        applyCoupon(result.coupon);
        setCouponSuccess(`Coupon "${result.coupon.code}" applied successfully!`);
        setCouponInput('');
      } else {
        setCouponError(result.message || 'Invalid coupon code.');
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
        <div className="flex flex-col items-center justify-center text-center space-y-5 bg-card rounded-2xl border border-border/40 p-12 max-w-md mx-auto shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 text-accent">
            <ShoppingBag className="h-7 w-7 stroke-[1.2]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-primary tracking-tight">Your Cart is Empty</h1>
            <p className="text-sm text-foreground/50 font-light leading-relaxed max-w-xs">
              Looks like you haven&apos;t added any items to your catalog order list yet.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-accent transition-colors"
          >
            Explore Catalog
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-primary tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            1. CART ITEMS LIST (Left Column - 8 Cols)
           ========================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 sm:gap-6 bg-card p-4 sm:p-5 rounded-2xl border border-border/40 shadow-xs relative"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-square h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl bg-muted border border-border/30 shrink-0">
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
                  <h3 className="text-sm sm:text-base font-semibold text-primary tracking-tight hover:text-accent transition-colors line-clamp-1">
                    <Link href={`/products/${item.slug}`}>{item.name}</Link>
                  </h3>
                  <p className="text-sm text-foreground/60 font-medium font-display">
                    {formatCurrency(Number(item.price))}
                  </p>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end">
                  {/* Quantity adjusts */}
                  <div className="flex items-center border border-border/60 rounded-lg overflow-hidden bg-secondary/10">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-foreground/50 hover:text-primary transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-primary">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-foreground/50 hover:text-primary transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-foreground/40 hover:text-destructive transition-colors"
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
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-xs space-y-6">
            <h3 className="font-display text-lg font-bold text-primary">Order Summary</h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-foreground/60 font-light">
                <span>Subtotal</span>
                <span className="font-semibold text-primary">{formatCurrency(subtotal)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-emerald-600 font-light">
                  <span className="flex items-center">
                    <Tag className="mr-1.5 h-3.5 w-3.5" />
                    Discount ({coupon.code})
                  </span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-foreground/60 font-light">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold uppercase tracking-wider text-xs">Free</span>
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-between font-display text-base font-bold text-primary">
                <span>Total Amount</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Coupon Input Form */}
            <div className="pt-4 border-t border-border/40">
              {coupon ? (
                /* Coupon Active Display */
                <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-800">
                      {coupon.code} Applied ({coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)} off)
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Coupon Input Box */
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label htmlFor="coupon" className="text-xs font-medium text-foreground/70 block">
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
                      className="flex-grow bg-secondary/30 border border-border/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/40 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isValidating}
                      className="bg-primary text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors disabled:opacity-50 shrink-0"
                    >
                      {isValidating ? 'Validating...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs font-medium text-destructive">{couponError}</p>}
                  {couponSuccess && <p className="text-xs font-medium text-emerald-600">{couponSuccess}</p>}
                </form>
              )}
            </div>

            {/* Checkout Action Button */}
            <Link
              href="/checkout"
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary py-4 px-6 text-sm font-semibold text-white shadow-sm hover:bg-accent hover:-translate-y-0.5 transition-all duration-300"
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

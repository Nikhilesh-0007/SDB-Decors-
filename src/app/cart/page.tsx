'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Tag, X, Package } from 'lucide-react';
import { useCart, validateCoupon } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const {
    cartItems, updateQuantity, removeFromCart,
    coupon, applyCoupon, removeCoupon,
    subtotal, discountAmount, total, clearCart,
  } = useCart();

  const [couponSuccess, setCouponSuccess] = useState(coupon ? `Coupon "${coupon.code}" applied!` : '');
  const [couponError, setCouponError] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const { data } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true);
        if (data) setCoupons(data);
      } catch (err) {
        console.error('Failed to load coupons:', err);
      }
    }
    loadCoupons();
  }, []);

  useEffect(() => {
    if (coupon) {
      const currentCouponMeta = coupons.find(c => c.code === coupon.code);
      if (currentCouponMeta) {
        const errorMsg = validateCoupon(currentCouponMeta, subtotal, cartItems);
        if (errorMsg) {
          removeCoupon();
          setCouponSuccess('');
          setCouponError(errorMsg);
        } else {
          setCouponError('');
        }
      }
    } else {
      setCouponError('');
    }
  }, [cartItems, subtotal, coupon, coupons, removeCoupon]);

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess('');
  };

  // WhatsApp order message
  const buildWhatsAppMessage = () => {
    let msg = '🛒 *SDB Auto Accessories Order*\n\n';
    cartItems.forEach((item, i) => {
      msg += `${i + 1}. ${item.name} × ${item.qty} — ${formatCurrency(item.price * item.qty)}\n`;
    });
    msg += `\n💰 *Total: ${formatCurrency(total)}*`;
    if (coupon) msg += `\n🎟️ Coupon: ${coupon.code}`;
    msg += '\n\nPlease confirm availability and payment details.';
    return encodeURIComponent(msg);
  };

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '80vh' }} className="flex items-center justify-center px-4">
        <div className="text-center max-w-sm mx-auto space-y-5 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto" style={{ background: 'rgba(214,163,19,0.1)', border: '1px solid rgba(214,163,19,0.25)' }}>
            <ShoppingCart className="h-7 w-7" style={{ color: '#D6A313' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>
            Your cart is empty
          </h1>
          <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.6, fontFamily: 'var(--font-sans), sans-serif' }}>
            Explore premium car and bike accessories and add your favourites.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
            style={{ background: '#D6A313', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
          >
            Shop Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Page Header */}
      <section className="pt-12 pb-8 max-md:pt-8 max-md:pb-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-block mb-3" style={{ background: 'rgba(214,163,19,0.1)', border: '1px solid rgba(214,163,19,0.25)', color: '#D6A313', fontFamily: 'var(--font-sans), sans-serif', fontWeight: 600, fontSize: '11px', letterSpacing: '0.07em', padding: '4px 12px', borderRadius: '6px' }}>
            SHOPPING CART
          </span>
          <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#111827' }}>
            Your Selected Accessories
          </h1>
          <p style={{ color: '#4B5563', fontSize: '13px', marginTop: '6px', fontFamily: 'var(--font-sans), sans-serif' }}>
            Review your items, update quantities, and proceed with your order.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 max-lg:flex-col items-start">

            {/* Cart Items */}
            <div className="flex-1 min-w-0 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5"
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                >
                  {/* Image */}
                  <Link href={`/products/${item.slug}`} className="relative shrink-0 overflow-hidden" style={{ width: '96px', height: '96px', borderRadius: '10px' }}>
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  </Link>

                  {/* Info */}
                  <div className="flex-grow flex flex-col sm:flex-row justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2" style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: '1.4' }}>
                        <Link href={`/products/${item.slug}`} className="hover:underline">{item.name}</Link>
                      </h3>
                      <p style={{ color: '#111827', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display), sans-serif', marginTop: '4px' }}>
                        {formatCurrency(Number(item.price))}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.qty - 1)}
                          className="flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-200"
                          style={{ width: '40px', height: '40px', color: '#D6A313' }}
                          aria-label="Decrease"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span style={{ width: '36px', textAlign: 'center', color: '#111827', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-sans), sans-serif' }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.qty + 1)}
                          className="flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-200"
                          style={{ width: '40px', height: '40px', color: '#D6A313' }}
                          aria-label="Increase"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-2 cursor-pointer transition-colors hover:bg-gray-100"
                        style={{ color: '#4B5563', borderRadius: '8px' }}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-28">
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }} className="space-y-5">
                <h3 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '16px', fontWeight: 700, color: '#111827' }}>Order Summary</h3>

                {/* Rows */}
                <div className="space-y-3 text-sm" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#4B5563' }}>Subtotal</span>
                    <span style={{ color: '#111827', fontWeight: 700 }}>{formatCurrency(subtotal)}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1" style={{ color: '#16a34a' }}>
                        <Tag className="h-3.5 w-3.5" /> {coupon.code}
                      </span>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ color: '#4B5563' }}>Shipping</span>
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '11px', letterSpacing: '0.05em' }}>FREE</span>
                  </div>
                  <div className="pt-3 flex justify-between" style={{ borderTop: '1px solid #E5E7EB' }}>
                    <span style={{ color: '#111827', fontWeight: 700, fontSize: '15px' }}>Total</span>
                    <span style={{ color: '#111827', fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-display), sans-serif' }}>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Coupon Selection Dropdown */}
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }} className="space-y-2">
                  <label className="text-xs font-medium block" style={{ color: '#4B5563', fontFamily: 'var(--font-sans), sans-serif' }}>
                    Available Coupons
                  </label>
                  <select
                    value={coupon ? coupon.code : ''}
                    onChange={(e) => {
                      const selected = coupons.find(c => c.code === e.target.value);
                      if (selected) {
                        const errorMsg = validateCoupon(selected, subtotal, cartItems);
                        if (errorMsg) {
                          removeCoupon();
                          setCouponSuccess('');
                          setCouponError(errorMsg);
                        } else {
                          applyCoupon({
                            id: selected.id,
                            code: selected.code,
                            discount_type: selected.discount_type,
                            discount_value: Number(selected.discount_value),
                            min_order_amount: selected.min_order_amount,
                            max_discount_amount: selected.max_discount_amount,
                            start_date: selected.start_date,
                            end_date: selected.end_date,
                            usage_limit: selected.usage_limit,
                            used_count: selected.used_count,
                            usage_limit_per_customer: selected.usage_limit_per_customer,
                            allow_combine: selected.allow_combine,
                            applicable_product_ids: selected.applicable_product_ids,
                            applicable_category_ids: selected.applicable_category_ids
                          });
                          setCouponSuccess(`Coupon "${selected.code}" applied!`);
                          setCouponError('');
                        }
                      } else {
                        removeCoupon();
                        setCouponSuccess('');
                        setCouponError('');
                      }
                    }}
                    className="w-full px-3 py-2.5 text-xs focus:outline-none bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                    style={{ fontFamily: 'var(--font-sans), sans-serif' }}
                  >
                    <option value="">Select a coupon...</option>
                    {coupons.map(c => (
                      <option key={c.id} value={c.code}>
                        {c.code} — {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`} Off
                      </option>
                    ))}
                  </select>
                  {couponSuccess && <p className="text-xs font-medium mt-1.5" style={{ color: '#16a34a' }}>{couponSuccess}</p>}
                  {couponError && <p className="text-xs font-medium mt-1.5" style={{ color: '#ef4444' }}>{couponError}</p>}
                </div>

                {/* CTAs */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all hover:opacity-90 cursor-pointer text-center"
                    style={{ background: '#D6A313', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

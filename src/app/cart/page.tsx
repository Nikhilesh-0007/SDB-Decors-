'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Tag, X, MessageCircle, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const {
    cartItems, updateQuantity, removeFromCart,
    coupon, applyCoupon, removeCoupon,
    subtotal, discountAmount, total,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) { setCouponError('Please enter a coupon code.'); return; }

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
        applyCoupon({ id: data.id, code: data.code, discount_type: data.discount_type as 'percent' | 'flat', discount_value: Number(data.discount_value) });
        setCouponSuccess(`Coupon "${data.code}" applied!`);
        setCouponInput('');
      }
    } catch { setCouponError('Failed to validate coupon.'); }
    finally { setIsValidating(false); }
  };

  const handleRemoveCoupon = () => { removeCoupon(); setCouponSuccess(''); setCouponError(''); };

  // WhatsApp order message
  const buildWhatsAppMessage = () => {
    let msg = '🛒 *SGB Decors Order*\n\n';
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
      <div style={{ background: '#0B0F0C', minHeight: '80vh' }} className="flex items-center justify-center px-4">
        <div className="text-center max-w-sm mx-auto space-y-5 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto" style={{ background: '#172117', border: '1px solid rgba(214,163,19,0.22)' }}>
            <ShoppingCart className="h-7 w-7" style={{ color: '#D6A313' }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: '#F8F3E8' }}>
            Your cart is empty
          </h1>
          <p style={{ color: '#9AA397', fontSize: '14px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
            Explore premium car and bike accessories and add your favourites.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-all duration-200 hover:opacity-90"
            style={{ background: '#D6A313', color: '#101510', borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}
          >
            Shop Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0B0F0C', minHeight: '100vh' }}>
      {/* Page Header */}
      <section className="pt-12 pb-8 max-md:pt-8 max-md:pb-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-block mb-3" style={{ background: 'rgba(214,163,19,0.1)', border: '1px solid rgba(214,163,19,0.25)', color: '#D6A313', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', letterSpacing: '0.07em', padding: '4px 12px', borderRadius: '6px' }}>
            SHOPPING CART
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#F8F3E8' }}>
            Your Selected Accessories
          </h1>
          <p style={{ color: '#9AA397', fontSize: '13px', marginTop: '6px', fontFamily: 'Inter, sans-serif' }}>
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
                  style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.22)', borderRadius: '12px' }}
                >
                  {/* Image */}
                  <Link href={`/products/${item.slug}`} className="relative shrink-0 overflow-hidden" style={{ width: '96px', height: '96px', borderRadius: '10px' }}>
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  </Link>

                  {/* Info */}
                  <div className="flex-grow flex flex-col sm:flex-row justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#F8F3E8', lineHeight: '1.4' }}>
                        <Link href={`/products/${item.slug}`}>{item.name}</Link>
                      </h3>
                      <p style={{ color: '#D6A313', fontSize: '15px', fontWeight: 700, fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
                        {formatCurrency(Number(item.price))}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center" style={{ background: '#0B0F0C', border: '1px solid rgba(214,163,19,0.22)', borderRadius: '10px', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.qty - 1)}
                          className="flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5"
                          style={{ width: '40px', height: '40px', color: '#D6A313' }}
                          aria-label="Decrease"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span style={{ width: '36px', textAlign: 'center', color: '#F8F3E8', fontSize: '14px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.qty + 1)}
                          className="flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5"
                          style={{ width: '40px', height: '40px', color: '#D6A313' }}
                          aria-label="Increase"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-2 cursor-pointer transition-colors hover:bg-white/5"
                        style={{ color: '#9AA397', borderRadius: '8px' }}
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
              <div style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.22)', borderRadius: '12px', padding: '24px' }} className="space-y-5">
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 700, color: '#F8F3E8' }}>Order Summary</h3>

                {/* Rows */}
                <div className="space-y-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#9AA397' }}>Subtotal</span>
                    <span style={{ color: '#F8F3E8', fontWeight: 700 }}>{formatCurrency(subtotal)}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1" style={{ color: '#22C55E' }}>
                        <Tag className="h-3.5 w-3.5" /> {coupon.code}
                      </span>
                      <span style={{ color: '#22C55E', fontWeight: 700 }}>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ color: '#9AA397' }}>Shipping</span>
                    <span style={{ color: '#22C55E', fontWeight: 700, fontSize: '11px', letterSpacing: '0.05em' }}>FREE</span>
                  </div>
                  <div className="pt-3 flex justify-between" style={{ borderTop: '1px solid rgba(214,163,19,0.15)' }}>
                    <span style={{ color: '#F8F3E8', fontWeight: 700, fontSize: '15px' }}>Total</span>
                    <span style={{ color: '#D6A313', fontWeight: 800, fontSize: '18px' }}>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div style={{ borderTop: '1px solid rgba(214,163,19,0.12)', paddingTop: '16px' }}>
                  {coupon ? (
                    <div className="flex items-center justify-between px-3 py-2.5" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px' }}>
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#22C55E' }}>
                        <Tag className="h-3.5 w-3.5" />
                        {coupon.code} ({coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)} off)
                      </span>
                      <button onClick={handleRemoveCoupon} className="cursor-pointer" style={{ color: '#22C55E' }}><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <label className="text-xs font-medium block" style={{ color: '#9AA397', fontFamily: 'Inter, sans-serif' }}>Promo Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="E.g. WELCOME10"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          disabled={isValidating}
                          className="flex-grow px-3 py-2.5 text-xs focus:outline-none uppercase"
                          style={{ background: '#0B0F0C', border: '1px solid rgba(214,163,19,0.18)', borderRadius: '10px', color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
                        />
                        <button
                          type="submit"
                          disabled={isValidating}
                          className="px-4 py-2.5 text-xs font-bold cursor-pointer shrink-0 transition-colors hover:opacity-90 disabled:opacity-50"
                          style={{ background: '#D6A313', color: '#101510', borderRadius: '10px', fontFamily: 'Inter, sans-serif' }}
                        >
                          {isValidating ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{couponError}</p>}
                      {couponSuccess && <p className="text-xs font-medium" style={{ color: '#22C55E' }}>{couponSuccess}</p>}
                    </form>
                  )}
                </div>

                {/* CTAs */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: '#D6A313', color: '#101510', borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}
                  >
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${buildWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: '#22C55E', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}
                  >
                    <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

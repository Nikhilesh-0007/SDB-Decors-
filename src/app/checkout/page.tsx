'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import { ShoppingCart, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

// Zod Validation Schema matching required Indian phone format (10 digits starting with 6-9)
const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Full Name must be at least 2 characters.'),
  customer_phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).'),
  customer_email: z.string().email('Please enter a valid email address.'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, coupon, subtotal, discountAmount, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  // Redirect if cart is empty and checkout hasn't succeeded
  useEffect(() => {
    if (cartItems.length === 0 && !isSuccess) {
      router.push('/cart');
    }
  }, [cartItems, isSuccess, router]);

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Prepare items JSON list
      const itemsJson = cartItems.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        qty: item.qty,
        price: Number(item.price),
      }));

      // 2. Direct database insert
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          customer_email: values.customer_email,
          items: itemsJson,
          coupon_code: coupon?.code || null,
          total_amount: total,
          whatsapp_sent: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // 3. Success Confetti Explosion
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D62828', '#1A1A2E', '#F77F00'],
      });

      setIsSuccess(true);

      // 4. Generate WhatsApp Message format
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
      const itemsText = cartItems
        .map((item) => `• ${item.name} × ${item.qty} — ₹${item.price}`)
        .join('\n');

      const couponStr = coupon ? coupon.code : 'None';

      const whatsappMessage = `🛒 *New Order — SGB Decors*

👤 *Name:* ${values.customer_name}
📞 *Phone:* ${values.customer_phone}
📧 *Email:* ${values.customer_email}

🧾 *Items Ordered:*
${itemsText}

💰 *Subtotal:* ₹${subtotal}
🎟️ *Coupon:* ${couponStr}
💵 *Total:* ₹${total}

Please confirm my order and share delivery details. Thank you!`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      // 5. Clear local cart
      clearCart();

      // 6. Redirect to WhatsApp
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 1500);

    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(`Error submitting order: ${err.message || 'Check database connection.'}`);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-xl border border-border/60 p-12 max-w-md mx-auto shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-bounce">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-dark tracking-tight">Order Logged!</h1>
            <p className="text-sm text-muted font-light leading-relaxed">
              Redirecting you to WhatsApp to complete your checkout and share delivery details.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Connecting to WhatsApp...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to Cart */}
      <div className="mb-6">
        <Link href="/cart" className="inline-flex items-center text-sm text-muted hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            1. CHECKOUT FORM (Left Column - 7 Cols)
           ========================================================================= */}
        <div className="lg:col-span-7 space-y-6 bg-white rounded-xl border border-border/60 p-6 sm:p-8 shadow-sm">
          <div>
            <h2 className="font-display text-2xl font-bold text-dark tracking-tight">Checkout Details</h2>
            <p className="text-sm text-muted font-light mt-1">
              Provide your details below to place the order. All fields are required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="customer_name" className="text-xs font-bold text-dark uppercase tracking-wider block">
                Full Name
              </label>
              <input
                type="text"
                id="customer_name"
                placeholder="Enter your full name"
                {...register('customer_name')}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-dark placeholder-muted"
              />
              {errors.customer_name && (
                <p className="text-xs font-bold text-primary">{errors.customer_name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="customer_email" className="text-xs font-bold text-dark uppercase tracking-wider block">
                Email Address
              </label>
              <input
                type="email"
                id="customer_email"
                placeholder="Enter email address"
                {...register('customer_email')}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-dark placeholder-muted"
              />
              {errors.customer_email && (
                <p className="text-xs font-bold text-primary">{errors.customer_email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="customer_phone" className="text-xs font-bold text-dark uppercase tracking-wider block">
                Phone Number
              </label>
              <input
                type="tel"
                id="customer_phone"
                placeholder="10-digit mobile number (e.g. 9876543210)"
                {...register('customer_phone')}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-dark placeholder-muted"
              />
              {errors.customer_phone && (
                <p className="text-xs font-bold text-primary">{errors.customer_phone.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-4.5 w-4.5" />
                  <span>Place Order via WhatsApp</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* =========================================================================
            2. ORDER SUMMARY PANEL (Right Column - 5 Cols)
           ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-border/60 p-6 space-y-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-dark">Your Order</h3>

          <div className="divide-y divide-border max-h-80 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex gap-4 py-3.5 first:pt-0 last:pb-0 items-center">
                <div className="relative aspect-square h-14 w-14 overflow-hidden rounded-lg bg-bg border border-border/40 shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-semibold text-dark line-clamp-2 pr-2">{item.name}</h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    Qty: {item.qty} &bull; {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="text-xs font-bold text-dark shrink-0 font-display">
                  {formatCurrency(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-bold text-dark">{formatCurrency(subtotal)}</span>
            </div>

            {coupon && (
              <div className="flex justify-between text-success">
                <span>Discount ({coupon.code})</span>
                <span className="font-bold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span className="text-success font-bold uppercase tracking-wider text-[10px]">Free</span>
            </div>

            <div className="border-t border-border pt-4 flex justify-between font-display text-sm font-bold text-dark">
              <span>Total Amount</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

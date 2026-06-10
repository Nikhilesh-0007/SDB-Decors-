'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import { ShoppingBag, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/cart-provider';
import { createOrder } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';

// Zod Validation Schema
const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Full Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits).'),
  email: z.string().email('Please enter a valid email address.'),
  address: z.string().optional(),
  notes: z.string().optional(),
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
      // 1. Package order items
      const productsData = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image,
      }));

      // 2. Submit to Supabase database
      const result = await createOrder({
        customer_name: values.customer_name,
        phone: values.phone,
        email: values.email,
        address: values.address || '',
        notes: values.notes || '',
        products: productsData,
        coupon_code: coupon?.code || '',
        total_amount: total,
      });

      if (!result.success) {
        alert(result.error || 'Failed to submit order to database.');
        setIsSubmitting(false);
        return;
      }

      // 3. Success Feedback (Confetti!)
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#A86E3C', '#2C2520', '#FAF8F5'],
      });

      setIsSuccess(true);

      // 4. Generate WhatsApp Order Message
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || '919876543210';
      const itemsList = cartItems
        .map((item) => `- ${item.quantity}x ${item.name} (${formatCurrency(item.price)})`)
        .join('\n');

      const couponStr = coupon ? `${coupon.code} (${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)} off)` : 'None';

      const whatsappText = `New Order Request

Customer Details:
Name: ${values.customer_name}
Phone: ${values.phone}
Email: ${values.email}
${values.address ? `Address: ${values.address}` : ''}
${values.notes ? `Notes: ${values.notes}` : ''}

Ordered Items:
${itemsList}

Coupon Applied:
${couponStr}

Total Amount:
${formatCurrency(total)}

Please confirm availability.`;

      const encodedMessage = encodeURIComponent(whatsappText);
      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

      // 5. Clear shopping cart state
      clearCart();

      // 6. Redirect to WhatsApp after delay (to let success screens display)
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 1500);

    } catch (error) {
      console.error('Checkout error:', error);
      alert('An unexpected error occurred during checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 bg-card rounded-3xl border border-border/40 p-12 max-w-md mx-auto shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-primary tracking-tight">Order Saved!</h1>
            <p className="text-sm text-foreground/60 font-light leading-relaxed">
              Your details have been registered. We are now redirecting you to WhatsApp to complete your order confirmation.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-foreground/40 font-light animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to WhatsApp...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to Cart */}
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center text-sm text-foreground/50 font-light hover:text-accent transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* =========================================================================
            1. CHECKOUT FORM (Left Column - 7 Cols)
           ========================================================================= */}
        <div className="lg:col-span-7 space-y-6 bg-card rounded-2xl border border-border/40 p-6 sm:p-8 shadow-xs">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary tracking-tight">Checkout</h2>
            <p className="text-sm text-foreground/50 font-light mt-1">
              Please provide your delivery and contact details. We will confirm stock availability via WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="customer_name" className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Full Name
              </label>
              <input
                type="text"
                id="customer_name"
                placeholder="e.g. John Doe"
                {...register('customer_name')}
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/40 transition-all"
              />
              {errors.customer_name && (
                <p className="text-xs font-semibold text-destructive">{errors.customer_name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="e.g. john@example.com"
                {...register('email')}
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/40 transition-all"
              />
              {errors.email && (
                <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="e.g. 555-0199"
                {...register('phone')}
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/40 transition-all"
              />
              {errors.phone && (
                <p className="text-xs font-semibold text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="space-y-2">
              <label htmlFor="address" className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Shipping Address <span className="text-[10px] text-foreground/40 lowercase font-light">(optional)</span>
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="Street address, city, state, zip code..."
                {...register('address')}
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/40 transition-all resize-none"
              />
            </div>

            {/* Order Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Order Notes <span className="text-[10px] text-foreground/40 lowercase font-light">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Customizations, sizing requests, delivery details..."
                {...register('notes')}
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/40 transition-all resize-none"
              />
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary py-4 px-6 text-sm font-semibold text-white shadow-sm hover:bg-accent hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Order...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit & Redirect to WhatsApp
                </>
              )}
            </button>
          </form>
        </div>

        {/* =========================================================================
            2. ORDER SUMMARY PANEL (Right Column - 5 Cols)
           ========================================================================= */}
        <div className="lg:col-span-5 bg-secondary/15 rounded-2xl border border-border/30 p-6 space-y-6">
          <h3 className="font-display text-lg font-bold text-primary">Your Order</h3>

          {/* List of items */}
          <div className="divide-y divide-border/40 max-h-80 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 py-3.5 first:pt-0 last:pb-0 items-center">
                <div className="relative aspect-square h-14 w-14 overflow-hidden rounded-lg bg-muted border border-border/20 shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-semibold text-primary line-clamp-1">{item.name}</h4>
                  <p className="text-[11px] text-foreground/50 mt-0.5 font-light">
                    Qty: {item.quantity} &bull; {formatCurrency(item.price)} each
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary shrink-0 font-display">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Checkout Calculations */}
          <div className="border-t border-border/40 pt-4 space-y-3 text-xs">
            <div className="flex justify-between text-foreground/60 font-light">
              <span>Subtotal</span>
              <span className="font-semibold text-primary">{formatCurrency(subtotal)}</span>
            </div>

            {coupon && (
              <div className="flex justify-between text-emerald-600 font-light">
                <span>Discount ({coupon.code})</span>
                <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-foreground/60 font-light">
              <span>Shipping</span>
              <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px]">Free</span>
            </div>

            <div className="border-t border-border/40 pt-4 flex justify-between font-display text-sm font-bold text-primary">
              <span>Total Amount</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

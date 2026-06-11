'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ArrowRight, User, Phone, Mail, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const { cartItems, total, subtotal, discountAmount, coupon, clearCart } = useCart();
  
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919014868451';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (cleanedPhone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildWhatsAppMessage = (name: string, phone: string, email: string) => {
    let msg = '📋 *SDB Auto Accessories — Order details*\n\n';
    msg += `👤 *Customer details:*\n`;
    msg += `• *Name:* ${name.trim()}\n`;
    msg += `• *Phone:* ${phone.trim()}\n`;
    msg += `• *Email:* ${email.trim()}\n\n`;

    msg += `🛒 *Items ordered:*\n`;
    cartItems.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}* × ${item.qty} — ${formatCurrency(item.price * item.qty)}\n`;
    });
    msg += `\n💵 *Subtotal:* ${formatCurrency(subtotal)}`;
    if (discountAmount > 0) {
      msg += `\n🎟️ *Discount:* -${formatCurrency(discountAmount)}`;
      if (coupon) {
        msg += ` (${coupon.code})`;
      }
    }
    msg += `\n💰 *Total Amount:* ${formatCurrency(total)}\n\n`;
    msg += `Please confirm availability and share payment/delivery options. Thank you!`;
    return encodeURIComponent(msg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Trigger confetti explosion
    try {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.warn('Confetti fail:', err);
    }

    const msgText = buildWhatsAppMessage(formData.name, formData.phone, formData.email);
    const link = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${msgText}`;
    setWhatsappLink(link);
    setIsSubmitted(true);

    // Open WhatsApp in new tab
    window.open(link, '_blank');

    // Clear cart after a delay to finalize the order locally
    setTimeout(() => {
      clearCart();
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '80vh' }} className="flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md mx-auto space-y-6 py-10 px-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto bg-green-50 border border-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#111827' }}>
            Order Placed!
          </h1>
          <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.6, fontFamily: 'var(--font-sans), sans-serif' }}>
            We have generated your order details. Your browser should have automatically opened WhatsApp to send the message to our team.
          </p>
          <div className="p-4 bg-gray-50 rounded-xl text-left border border-gray-100 space-y-2 text-xs">
            <p className="font-semibold text-gray-700">Sent Details:</p>
            <p className="text-gray-600"><span className="font-medium">Name:</span> {formData.name}</p>
            <p className="text-gray-600"><span className="font-medium">Phone:</span> {formData.phone}</p>
            <p className="text-gray-600"><span className="font-medium">Email:</span> {formData.email}</p>
            <p className="text-gray-600"><span className="font-medium">Order Total:</span> {formatCurrency(total)}</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 cursor-pointer"
                style={{ background: '#25D366', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
              >
                <span>Re-open WhatsApp</span>
              </a>
            )}
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-200 hover:bg-gray-50"
              style={{ border: '1px solid #E5E7EB', color: '#4B5563', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Shop</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '80vh' }} className="flex items-center justify-center px-4">
        <div className="text-center max-w-sm mx-auto space-y-5 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto bg-gray-50 border border-gray-100">
            <ShoppingBag className="h-7 w-7" style={{ color: '#D6A313' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>
            No active cart session
          </h1>
          <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.6, fontFamily: 'var(--font-sans), sans-serif' }}>
            Add premium car and bike accessories to your cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
            style={{ background: '#D6A313', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
          >
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Wizard Progress */}
        <div className="flex items-center gap-2 mb-8 text-xs font-semibold text-gray-500 uppercase tracking-wider overflow-x-auto whitespace-nowrap py-1">
          <Link href="/cart" className="hover:text-primary transition-colors">Cart Summary</Link>
          <ChevronRight className="h-4.5 w-4.5 text-gray-300" />
          <span className="text-[#D6A313] font-bold">Customer Details</span>
          <ChevronRight className="h-4.5 w-4.5 text-gray-300" />
          <span className="text-gray-300">WhatsApp Dispatch</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-6">
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px' }} className="shadow-xs">
              <h2 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
                Contact & Shipping Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase mb-1.5">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50 text-dark placeholder-muted ${
                        errors.name ? 'border-red-500' : 'border-gray-200'
                      }`}
                      style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                    />
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase mb-1.5">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      className={`w-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50 text-dark placeholder-muted ${
                        errors.phone ? 'border-red-500' : 'border-gray-200'
                      }`}
                      style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                    />
                    <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase mb-1.5">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50 text-dark placeholder-muted ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-95 cursor-pointer"
                    style={{ background: '#D6A313', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
                  >
                    <span>Proceed to WhatsApp Checkout</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                    Our team will receive your contact details and order details to calculate shipping and coordinate payment.
                  </p>
                </div>
              </form>
            </div>

            <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-bold transition-all hover:gap-3" style={{ color: '#D6A313', fontFamily: 'var(--font-sans), sans-serif' }}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart summary</span>
            </Link>
          </div>

          {/* Summary Side */}
          <div className="lg:col-span-5">
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }} className="shadow-xs space-y-6">
              <h3 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#111827', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px' }}>
                Order Summary
              </h3>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="py-3.5 flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-800 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {item.qty} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 shrink-0">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-gray-100 text-sm font-medium">
                <div className="flex justify-between" style={{ color: '#4B5563' }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1.5">
                      <span>Discount</span>
                      {coupon && <span className="text-[10px] tracking-wide uppercase px-1.5 py-0.5 bg-green-50 border border-green-100 rounded-sm font-bold text-green-600">{coupon.code}</span>}
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-100 text-base font-extrabold" style={{ color: '#111827' }}>
                  <span>Order Total</span>
                  <span style={{ color: '#D6A313' }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

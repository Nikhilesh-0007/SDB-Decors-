'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Truck, ChevronDown, ChevronUp, Send } from 'lucide-react';

const faqs = [
  { q: 'Do you deliver across India?', a: 'Yes, we deliver all products across India. Orders above ₹499 qualify for free delivery.' },
  { q: 'Can I order through WhatsApp?', a: 'Absolutely! Send us your product requirements on WhatsApp and we will process your order directly.' },
  { q: 'Do you help choose accessories for my vehicle?', a: 'Yes, share your vehicle model and we will suggest compatible and recommended accessories.' },
  { q: 'Are products quality checked?', a: 'All products are quality checked before dispatch. We source from trusted manufacturers only.' },
];

export default function ContactPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919014868451';
  const [form, setForm] = useState({ name: '', phone: '', vehicle: 'Car', requirement: '' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.requirement.trim()) return;
    const msg = `*New Enquiry — SDB Auto Accessories*\n\nName: ${form.name}\nPhone: ${form.phone}\nVehicle: ${form.vehicle}\nRequirement: ${form.requirement}`;
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Header */}
      <section className="pt-16 pb-10 max-md:pt-10 max-md:pb-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-block mb-4" style={{ background: 'rgba(214,163,19,0.12)', border: '1px solid rgba(214,163,19,0.3)', color: '#D6A313', fontFamily: 'var(--font-sans), sans-serif', fontWeight: 600, fontSize: '11px', letterSpacing: '0.07em', padding: '4px 12px', borderRadius: '6px' }}>
            CONTACT SDB AUTO ACCESSORIES
          </span>
          <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--color-text-light)', lineHeight: 1.15 }}>
            Need Help Choosing Accessories?
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '10px', maxWidth: '520px', lineHeight: 1.6, fontFamily: 'var(--font-sans), sans-serif' }}>
            Message us on WhatsApp or call us for product suggestions, availability, and order support.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left: Contact Cards */}
            <div className="space-y-4">
              {[
                { icon: MessageCircle, title: 'WhatsApp Orders', desc: 'Chat directly with our team for orders and queries.', action: 'Message on WhatsApp', href: `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent('Hi, I want to inquire about accessories from SDB Auto Accessories')}`, color: '#22C55E' },
                { icon: Phone, title: 'Call Support', desc: '+91 9014868451', action: null, href: 'tel:+919014868451', color: '#D6A313' },
                { icon: Mail, title: 'Email', desc: 'info@sdbautoaccessories.com', action: null, href: 'mailto:info@sdbautoaccessories.com', color: '#D6A313' },
                { icon: Truck, title: 'Delivery', desc: 'Delivery available across India. Free on orders above ₹499.', action: null, href: null, color: '#D6A313' },
              ].map((card, i) => (
                <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }} className="flex items-start gap-4">
                  <div className="shrink-0 flex items-center justify-center w-10 h-10" style={{ background: 'rgba(214,163,19,0.08)', borderRadius: '10px' }}>
                    <card.icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 style={{ color: 'var(--color-text-light)', fontFamily: 'var(--font-sans), sans-serif', fontSize: '15px', fontWeight: 700 }}>{card.title}</h3>
                    <p style={{ color: 'var(--color-muted)', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif', marginTop: '2px' }}>{card.desc}</p>
                    {card.action && card.href && (
                      <a
                         href={card.href}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 text-xs font-bold transition-all hover:opacity-90"
                         style={{ background: card.color, color: '#fff', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {card.action}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Enquiry Form */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ color: 'var(--color-text-light)', fontFamily: 'var(--font-sans), sans-serif', fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
                Send Enquiry
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans), sans-serif' }}>Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Your name"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50 text-dark placeholder-muted"
                    style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans), sans-serif' }}>Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50 text-dark placeholder-muted"
                    style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans), sans-serif' }}>Vehicle Type</label>
                  <select
                    value={form.vehicle}
                    onChange={(e) => setForm(p => ({ ...p, vehicle: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm focus:outline-none cursor-pointer text-dark"
                    style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                  >
                    <option value="Car" style={{ background: '#FFFFFF', color: '#111827' }}>Car</option>
                    <option value="Bike" style={{ background: '#FFFFFF', color: '#111827' }}>Bike</option>
                    <option value="Both" style={{ background: '#FFFFFF', color: '#111827' }}>Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans), sans-serif' }}>Requirement *</label>
                  <textarea
                    value={form.requirement}
                    onChange={(e) => setForm(p => ({ ...p, requirement: e.target.value }))}
                    required
                    rows={4}
                    placeholder="Describe what accessory you're looking for..."
                    className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none focus:ring-1 focus:ring-[#D6A313]/50 text-dark placeholder-muted"
                    style={{ background: 'var(--color-bg)', border: '1px solid #E5E7EB', borderRadius: '10px', fontFamily: 'var(--font-sans), sans-serif' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all hover:opacity-90 cursor-pointer"
                  style={{ background: '#D6A313', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif', minHeight: '46px' }}
                >
                  <Send className="h-4 w-4" /> Send Enquiry via WhatsApp
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-center mb-8" style={{ fontFamily: "var(--font-display), sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-light)' }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                  >
                    <span style={{ color: 'var(--color-text-light)', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }}>{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: '#D6A313' }} /> : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'var(--color-muted)' }} />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p style={{ color: 'var(--color-muted)', fontSize: '13px', lineHeight: 1.6, fontFamily: 'var(--font-sans), sans-serif' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

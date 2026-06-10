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
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const [form, setForm] = useState({ name: '', phone: '', vehicle: 'Car', requirement: '' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.requirement.trim()) return;
    const msg = `*New Enquiry — SGB Decors*\n\nName: ${form.name}\nPhone: ${form.phone}\nVehicle: ${form.vehicle}\nRequirement: ${form.requirement}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{ background: '#0B0F0C', minHeight: '100vh' }}>
      {/* Header */}
      <section className="pt-16 pb-10 max-md:pt-10 max-md:pb-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-block mb-4" style={{ background: 'rgba(214,163,19,0.1)', border: '1px solid rgba(214,163,19,0.25)', color: '#D6A313', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', letterSpacing: '0.07em', padding: '4px 12px', borderRadius: '6px' }}>
            CONTACT SGB DECORS
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, color: '#F8F3E8', lineHeight: 1.15 }}>
            Need Help Choosing Accessories?
          </h1>
          <p style={{ color: '#9AA397', fontSize: '14px', marginTop: '10px', maxWidth: '520px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
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
                { icon: MessageCircle, title: 'WhatsApp Orders', desc: 'Chat directly with our team for orders and queries.', action: 'Message on WhatsApp', href: `https://wa.me/${whatsappNumber}`, color: '#22C55E' },
                { icon: Phone, title: 'Call Support', desc: '+91 9014868451', action: null, href: 'tel:+919014868451', color: '#D6A313' },
                { icon: Mail, title: 'Email', desc: 'info@sgbdecors.com', action: null, href: 'mailto:info@sgbdecors.com', color: '#D6A313' },
                { icon: Truck, title: 'Delivery', desc: 'Delivery available across India. Free on orders above ₹499.', action: null, href: null, color: '#D6A313' },
              ].map((card, i) => (
                <div key={i} style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.22)', borderRadius: '12px', padding: '20px' }} className="flex items-start gap-4">
                  <div className="shrink-0 flex items-center justify-center w-10 h-10" style={{ background: '#172117', borderRadius: '10px' }}>
                    <card.icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 style={{ color: '#F8F3E8', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700 }}>{card.title}</h3>
                    <p style={{ color: '#9AA397', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>{card.desc}</p>
                    {card.action && card.href && (
                      <a
                        href={card.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 text-xs font-bold transition-all hover:opacity-90"
                        style={{ background: card.color, color: '#fff', borderRadius: '10px', fontFamily: 'Inter, sans-serif' }}
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
            <div style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.22)', borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ color: '#F8F3E8', fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
                Send Enquiry
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9AA397', fontFamily: 'Inter, sans-serif' }}>Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Your name"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50"
                    style={{ background: '#0B0F0C', border: '1px solid rgba(214,163,19,0.18)', borderRadius: '10px', color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9AA397', fontFamily: 'Inter, sans-serif' }}>Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6A313]/50"
                    style={{ background: '#0B0F0C', border: '1px solid rgba(214,163,19,0.18)', borderRadius: '10px', color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9AA397', fontFamily: 'Inter, sans-serif' }}>Vehicle Type</label>
                  <select
                    value={form.vehicle}
                    onChange={(e) => setForm(p => ({ ...p, vehicle: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                    style={{ background: '#0B0F0C', border: '1px solid rgba(214,163,19,0.18)', borderRadius: '10px', color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="Car" style={{ background: '#111811' }}>Car</option>
                    <option value="Bike" style={{ background: '#111811' }}>Bike</option>
                    <option value="Both" style={{ background: '#111811' }}>Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9AA397', fontFamily: 'Inter, sans-serif' }}>Requirement *</label>
                  <textarea
                    value={form.requirement}
                    onChange={(e) => setForm(p => ({ ...p, requirement: e.target.value }))}
                    required
                    rows={4}
                    placeholder="Describe what accessory you're looking for..."
                    className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none focus:ring-1 focus:ring-[#D6A313]/50"
                    style={{ background: '#0B0F0C', border: '1px solid rgba(214,163,19,0.18)', borderRadius: '10px', color: '#F8F3E8', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all hover:opacity-90 cursor-pointer"
                  style={{ background: '#D6A313', color: '#101510', borderRadius: '12px', fontFamily: 'Inter, sans-serif', minHeight: '46px' }}
                >
                  <Send className="h-4 w-4" /> Send Enquiry via WhatsApp
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-center mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#F8F3E8' }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{ background: '#111811', border: '1px solid rgba(214,163,19,0.18)', borderRadius: '12px', overflow: 'hidden' }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                  >
                    <span style={{ color: '#F8F3E8', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: '#D6A313' }} /> : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: '#9AA397' }} />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p style={{ color: '#9AA397', fontSize: '13px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>{faq.a}</p>
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

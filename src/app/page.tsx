import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, ShieldCheck, MessageCircle, Tag, CheckCircle, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/product-card';
import HeroCarousel from '@/components/hero-carousel';

const defaultCategoryImages: Record<string, string> = {
  'bike-accessories': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600',
  'car-styling': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600',
  'car-protection': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
  'led-lighting': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600',
};

export const revalidate = 0;

export default async function Home() {
  let heroSlides: any[] = [];

  try {
    const { data: heroData } = await supabase
      .from('hero_settings')
      .select('id, heading, subheading, image_url, cta_text, sort_order')
      .order('sort_order', { ascending: true });
    if (heroData && heroData.length > 0) {
      heroSlides = heroData;
    }
  } catch (err) {
    console.warn('Fallback to default hero settings');
  }

  // Fallback if no slides are set in the database
  if (heroSlides.length === 0) {
    heroSlides = [
      {
        id: 'default-1',
        heading: 'Upgrade Your Ride With Premium Accessories',
        subheading: 'Car styling, bike protection, lighting, covers, chargers and daily-use accessories delivered across India.',
        image_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1600',
        cta_text: 'Shop Accessories',
      }
    ];
  }

  let categories: any[] = [];
  let featuredProducts: any[] = [];

  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .order('name', { ascending: true });
    if (catData) categories = catData;
  } catch (err) {
    console.warn('Fallback to empty categories');
  }

  try {
    const { data: prodData } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(8);
    if (prodData) featuredProducts = prodData;
  } catch (err) {
    console.warn('Fallback to empty products');
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919014868451';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent('Hi, I want to inquire about accessories from SDB Auto Accessories')}`;

  return (
    <div>
      {/* ═══════════ HERO SECTION (CAROUSEL) ═══════════ */}
      <HeroCarousel slides={heroSlides} whatsappUrl={whatsappUrl} />

      {/* ═══════════ TRUST STRIP ═══════════ */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '18px 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { Icon: Truck, title: 'Fast Delivery' },
              { Icon: ShieldCheck, title: 'Quality Checked' },
              { Icon: MessageCircle, title: 'WhatsApp Ordering' },
              { Icon: Tag, title: 'Best Prices' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                <item.Icon className="h-5 w-5 shrink-0" style={{ color: '#D6A313' }} />
                <span style={{ color: '#4B5563', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section style={{ background: '#F9FAFB', padding: '80px 0' }} className="max-md:!py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-lg mx-auto mb-12">
            <h2 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: '2rem', fontWeight: 700, color: '#111827' }}>
              Shop by Category
            </h2>
            <p style={{ color: '#4B5563', fontSize: '14px', marginTop: '8px', fontFamily: 'var(--font-sans), sans-serif' }}>
              Find the right upgrade for your car or bike.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.length > 0 ? (
              categories.map((category) => {
                const imageSrc = category.image_url || defaultCategoryImages[category.slug] || 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=400';
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group relative block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                    style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                  >
                    <div className="relative" style={{ height: '220px' }}>
                      <Image
                        src={imageSrc}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,24,39,0.9) 0%, rgba(17,24,39,0.3) 55%, transparent 100%)' }} />
                      <div className="absolute bottom-4 left-4 z-10">
                        <h3 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-sans), sans-serif' }}>
                          {category.name}
                        </h3>
                        <span style={{ color: '#D6A313', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }} className="inline-flex items-center gap-1 mt-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          Explore <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              // Fallback skeleton cards
              ['Bike Accessories', 'Car Styling', 'Car Protection', 'Lighting & Electronics'].map((name, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden flex flex-col justify-end p-4"
                  style={{ height: '220px', borderRadius: '12px', background: '#F3F4F6' }}
                >
                  <div className="h-4 w-2/3 rounded" style={{ background: '#E5E7EB' }} />
                  <div className="h-3 w-1/3 rounded mt-2" style={{ background: '#E5E7EB' }} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED PRODUCTS ═══════════ */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }} className="max-md:!py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-10">
            <div>
              <h2 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
                Featured Upgrades
              </h2>
              <p style={{ color: '#4B5563', fontSize: '13px', marginTop: '6px', fontFamily: 'var(--font-sans), sans-serif' }}>
                Top-selling accessories picked for quality and value.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 hover:gap-2.5 shrink-0"
              style={{ color: '#D6A313', fontFamily: 'var(--font-sans), sans-serif' }}
            >
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Product Grid */}
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16" style={{ background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <p style={{ color: '#4B5563', fontSize: '14px', fontFamily: 'var(--font-sans), sans-serif', marginBottom: '12px' }}>
                No products loaded yet. Add items from the admin dashboard.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold"
                style={{ background: '#D6A313', color: '#FFFFFF', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
              >
                Go to Admin Panel
              </Link>
            </div>
          )}

          {/* Mobile View All */}
          <div className="sm:hidden text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold px-6 py-3"
              style={{ color: '#FFFFFF', background: '#D6A313', borderRadius: '12px', fontFamily: 'var(--font-sans), sans-serif' }}
            >
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ WHATSAPP CTA SECTION ═══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#F3F4F6' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=30&w=1200)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(243,244,246,0.95), rgba(229,231,235,0.92))' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <div className="max-w-xl mx-auto space-y-5">
            <Zap className="h-8 w-8 mx-auto" style={{ color: '#D6A313' }} />
            <h2 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#111827' }}>
              Need help choosing the right accessory?
            </h2>
            <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.7, fontFamily: 'var(--font-sans), sans-serif' }}>
              Message us on WhatsApp and we&apos;ll suggest the best fit for your car or bike.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-all duration-200 hover:opacity-90"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans), sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                padding: '14px 32px',
                borderRadius: '12px',
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

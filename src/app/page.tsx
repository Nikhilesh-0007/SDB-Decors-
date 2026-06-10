import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, ShieldCheck, MessageCircle, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/product-card';

// Custom high-quality automotive category icons if images are not set in the database
const defaultCategoryImages: Record<string, string> = {
  'car-styling': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600',
  'bike-accessories': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600',
  'car-protection': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
  'led-lighting': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600',
};

export const revalidate = 0; // Disable caching to fetch live hero settings and catalog directly

export default async function Home() {
  let heroSettings = {
    heading: 'Premium Car & Bike Accessories',
    subheading: 'Upgrade your ride with high-performance styling, premium lighting, and durable protective gear.',
    image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1600',
    cta_text: 'Shop Now',
  };

  let categories: any[] = [];
  let featuredProducts: any[] = [];

  // Direct server-side Supabase fetches with try-catch fallback
  try {
    const { data: heroData } = await supabase
      .from('hero_settings')
      .select('heading, subheading, image_url, cta_text')
      .eq('id', 1)
      .single();

    if (heroData) {
      heroSettings = heroData;
    }
  } catch (err) {
    console.warn('Fallback to default hero settings');
  }

  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .order('name', { ascending: true });

    if (catData) {
      categories = catData;
    }
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

    if (prodData) {
      featuredProducts = prodData;
    }
  } catch (err) {
    console.warn('Fallback to empty products');
  }

  // Get WhatsApp number
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi, I want to inquire about custom accessories from SGB Decors')}`;

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[60vh] md:min-h-[85vh] w-full flex items-center bg-dark text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroSettings.image_url || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1600'}
            alt="SGB Decors Automotive banner"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-transparent md:to-black/30" />
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-28 w-full">
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <span className="inline-flex items-center rounded-md bg-primary/20 border border-primary/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              ⚡ Upgrade Your Ride
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight border-l-4 border-primary pl-4">
              {heroSettings.heading}
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-lg font-light">
              {heroSettings.subheading}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-primary/95 transition-all duration-200"
              >
                {heroSettings.cta_text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-white bg-transparent px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST BADGES BAR */}
      <section className="bg-white border-y border-border py-8 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <Truck className="h-8 w-8 text-primary shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-sm font-bold text-dark uppercase tracking-wide">Fast Delivery</h4>
                <p className="text-xs text-muted">Direct to your doorstep in India</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <ShieldCheck className="h-8 w-8 text-primary shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-sm font-bold text-dark uppercase tracking-wide">Quality Guaranteed</h4>
                <p className="text-xs text-muted">100% Genuine Car & Bike Accessories</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <MessageCircle className="h-8 w-8 text-primary shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-sm font-bold text-dark uppercase tracking-wide">WhatsApp Support</h4>
                <p className="text-xs text-muted">Talk directly to order experts</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <Tag className="h-8 w-8 text-primary shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-sm font-bold text-dark uppercase tracking-wide">Best Prices</h4>
                <p className="text-xs text-muted">Unbeatable value in Indian Market</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="font-display text-3xl font-bold tracking-tight text-dark">Shop by Category</h2>
          <p className="text-sm text-muted leading-relaxed font-light">
            Find the perfect upgrades tailored specifically for your cars and bikes.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.length > 0 ? (
            categories.map((category) => {
              const imageSrc = category.image_url || defaultCategoryImages[category.slug] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400';
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative aspect-square rounded-xl overflow-hidden block shadow-sm border border-border/40"
                >
                  <Image
                    src={imageSrc}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Bottom overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent flex flex-col justify-end p-5 transition-all duration-200 group-hover:border-b-4 group-hover:border-primary" />
                  <div className="absolute bottom-5 left-5 text-white z-10">
                    <h3 className="font-display text-base font-bold tracking-tight">{category.name}</h3>
                    <span className="inline-flex items-center text-xs text-primary font-bold mt-1 group-hover:underline">
                      Explore Accessories
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            // Skeleton Loader Cards
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-white border border-border animate-pulse flex flex-col justify-end p-5">
                <div className="h-4 w-2/3 bg-border rounded mb-2" />
                <div className="h-3 w-1/2 bg-border rounded" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-dark">Featured Upgrades</h2>
            <p className="text-sm text-muted font-light">High quality parts selected for performance and aesthetics.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-bold text-primary hover:underline hover:text-primary/95 shrink-0"
          >
            View All Products
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-border/40">
            <p className="text-sm text-muted mb-4">No products loaded yet. Head over to the admin dashboard to add items!</p>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg bg-dark px-6 py-2.5 text-xs font-semibold text-white hover:bg-dark/90"
            >
              Go to Admin Panel
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

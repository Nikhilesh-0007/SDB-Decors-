import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageSquare, Phone, Mail, Award, RotateCcw, ShieldCheck } from 'lucide-react';
import { getHeroSettings, getCategories, getProducts } from '@/lib/actions';
import ProductCard from '@/components/product-card';

// Custom imagery for categories if not defined in db
const categoryImages: Record<string, string> = {
  furniture: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600',
  lighting: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600',
  'wall-decor': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600',
  accessories: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600',
};

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const heroSettings = await getHeroSettings();
  const categories = await getCategories();
  const featuredProducts = await getProducts({ featuredOnly: true });

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                New Autumn Catalog
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.1]">
                {heroSettings.title}
              </h1>
              <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-lg font-light">
                {heroSettings.subtitle}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-accent hover:-translate-y-0.5 transition-all duration-300"
                >
                  {heroSettings.button_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-transparent px-8 py-4 text-sm font-semibold text-primary hover:bg-secondary/40 transition-colors"
                >
                  Consult Designer
                </Link>
              </div>
            </div>

            {/* Right Image Frame */}
            <div className="lg:col-span-7 relative h-[350px] sm:h-[480px] lg:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={heroSettings.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200'}
                alt="Premium Home Design"
                fill
                priority
                className="object-cover object-center"
              />
              {/* Glass announcement element */}
              <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent mb-0.5">Special Offer</p>
                  <h4 className="text-sm sm:text-base font-semibold text-primary">Get 10% Off on checkout</h4>
                  <p className="text-[11px] sm:text-xs text-foreground/60">Apply code <span className="font-bold text-accent">WELCOME10</span> at checkout.</p>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white hover:bg-accent transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="bg-secondary/20 py-12 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <Award className="h-8 w-8 text-accent shrink-0 stroke-[1.2]" />
              <div>
                <h4 className="text-base font-semibold text-primary">Bespoke Artistry</h4>
                <p className="text-xs text-foreground/60 mt-1 leading-relaxed">Every piece is handpicked and crafted by master designers.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <ShieldCheck className="h-8 w-8 text-accent shrink-0 stroke-[1.2]" />
              <div>
                <h4 className="text-base font-semibold text-primary">Guaranteed Quality</h4>
                <p className="text-xs text-foreground/60 mt-1 leading-relaxed">Premium organic materials sourced for lifelong durability.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <RotateCcw className="h-8 w-8 text-accent shrink-0 stroke-[1.2]" />
              <div>
                <h4 className="text-base font-semibold text-primary">WhatsApp Ordering</h4>
                <p className="text-xs text-foreground/60 mt-1 leading-relaxed">Direct support. Chat with our representatives to finalize sizing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary">Shop by Collection</h2>
          <p className="text-sm text-foreground/60 leading-relaxed font-light">
            Explore our curated collections, designed to bring harmony and sophistication to your interior spaces.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const imageSrc = categoryImages[category.slug] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400';
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group relative h-80 rounded-2xl overflow-hidden block shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <Image
                  src={imageSrc}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6" />
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <h3 className="font-display text-xl font-bold tracking-tight">{category.name}</h3>
                  <span className="inline-flex items-center text-xs text-accent font-semibold group-hover:underline">
                    Browse Collection
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold tracking-tight text-primary">Featured Pieces</h2>
              <p className="text-sm text-foreground/60 font-light">Our most sought-after custom furniture and decors.</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center text-sm font-semibold text-accent hover:underline"
            >
              View All Products
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. TESTIMONIALS */}
      <section className="bg-primary py-20 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent via-background to-black" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-lg mx-auto mb-16 space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-tight">What Designers Say</h2>
            <p className="text-sm text-white/60 font-light">Trusted by architectural firms and decor enthusiasts globally.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "SGBdecors has completely transformed how I source pieces for clients. The craftsmanship of the Velvet Sofa is exceptional, and checkouts are extremely fast.",
                author: "Sarah Jenkins",
                role: "Lead Interior Architect, NY",
              },
              {
                quote: "The travertine bookends and minimalist oak table added the perfect organic elements to our latest penthouse design project. Highly recommended catalog!",
                author: "David Vance",
                role: "Design Curator, Studio Vance",
              },
              {
                quote: "WhatsApp chat ordering was incredibly convenient. I requested customized fabric details and received answers within 10 minutes. A premium experience.",
                author: "Helena Rostova",
                role: "Stylist & Decorator",
              },
            ].map((t, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm flex flex-col justify-between"
              >
                <p className="text-sm text-white/80 leading-relaxed italic font-light">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6">
                  <h4 className="font-semibold text-sm text-accent">{t.author}</h4>
                  <p className="text-xs text-white/40 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl border border-border/40 p-8 md:p-12 shadow-sm overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-6">
              <h2 className="font-display text-3xl font-bold text-primary tracking-tight">Need Custom Consultation?</h2>
              <p className="text-sm text-foreground/60 leading-relaxed font-light">
                Do you need custom fabric, custom dimensions, or want to discuss details of a wholesale order? Connect with our interior design desk directly via WhatsApp.
              </p>
              <div className="space-y-4 pt-4 text-sm text-foreground/80">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-accent stroke-[1.5]" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-accent stroke-[1.5]" />
                  <span>consultation@sgbdecors.com</span>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_PHONE}?text=Hello SGBdecors, I would like to schedule a custom decor consultation.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary transition-colors"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with Design Desk
                </a>
              </div>
            </div>

            {/* Right (Visual Map/Showroom mockup) */}
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-inner bg-muted">
              <Image
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800"
                alt="SGBdecors Showroom"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <div className="text-center text-white space-y-1 p-6">
                  <h4 className="font-display text-lg font-bold">New York Showroom</h4>
                  <p className="text-xs text-white/80 font-light">Open Monday - Saturday: 10AM - 7PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

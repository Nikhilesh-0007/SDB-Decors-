'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide {
  id: string;
  heading: string;
  subheading: string;
  image_url: string;
  cta_text: string;
  sort_order?: number;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  whatsappUrl: string;
}

export default function HeroCarousel({ slides, whatsappUrl }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Infinite Auto-play loop (3 seconds interval)
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '78vh' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              {/* Background Image */}
              <Image
                src={slide.image_url}
                alt={slide.heading || 'Premium Auto Accessories'}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: 'center right' }}
              />

              {/* Very subtle localized gradient overlay (15% white to transparent) */}
              <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-white/15 via-white/5 to-transparent pointer-events-none" />

              {/* Content Box (aligned to center on mobile, left on larger screens) */}
              <div className="relative z-20 mx-auto max-w-7xl w-full h-full px-4 sm:px-6 lg:px-8 flex items-center">
                <div
                  className={`max-w-xl p-6 sm:p-8 bg-white/20 border border-white/10 rounded-xl shadow-sm space-y-6 transition-all duration-500 transform ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  {/* Badge */}
                  <span
                    className="inline-block bg-white border border-[#D6A313]/25 text-[#C4950F] font-bold text-[10px] sm:text-[11px] tracking-[0.14em] px-3.5 py-1.5 rounded-full uppercase shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                    style={{
                      fontFamily: 'var(--font-display), sans-serif',
                    }}
                  >
                    PREMIUM AUTO ACCESSORIES
                  </span>

                  {/* Heading */}
                  <h1
                    style={{
                      fontFamily: 'var(--font-display), sans-serif',
                      fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                      fontWeight: 800,
                      color: '#111827',
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {slide.heading}
                  </h1>

                  {/* Subheading */}
                  <p
                    className="text-white text-base leading-[1.65] max-w-[460px] font-medium"
                    style={{
                      fontFamily: 'var(--font-sans), sans-serif',
                    }}
                  >
                    {slide.subheading}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white font-sans font-bold text-sm rounded-xl transition-all duration-200 hover:bg-primary-light active:scale-[0.98] shadow-xs"
                    >
                      {slide.cta_text}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white border border-gray-200 text-gray-800 rounded-xl shadow-xs font-sans font-bold text-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 active:scale-[0.98]"
                    >
                      <svg
                        className="h-[18px] w-[18px] text-[#25D366] shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.48 2 2 6.48 2 12c0 2.17.61 4.2 1.66 5.92L2 22l4.22-1.61C7.88 21.41 9.87 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm3.89 12.38c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11-.15.22-.58.72-.71.87-.13.15-.26.17-.48.06a7.4 7.4 0 01-2.7-1.66 8.16 8.16 0 01-1.87-2.33c-.15-.22-.02-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.03-.28-.02-.39-.05-.11-.5-1.2-.68-1.64-.18-.44-.36-.38-.5-.39h-.43c-.15 0-.39.06-.59.28-.2.22-.77.75-.77 1.83 0 1.08.79 2.13.9 2.28.11.15 1.55 2.37 3.76 3.32.53.23.94.37 1.26.47.53.17 1.01.14 1.39.09.42-.06 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.42-.26z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Order on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (visible when multiple slides exist) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/80 hover:bg-white border border-border/40 text-dark shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus:outline-none ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
              }`}
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-5 w-5 text-muted hover:text-primary" />
          </button>
          <button
            onClick={handleNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/80 hover:bg-white border border-border/40 text-dark shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus:outline-none ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
            aria-label="Next Slide"
          >
            <ChevronRight className="h-5 w-5 text-muted hover:text-primary" />
          </button>
        </>
      )}

      {/* Dots Indicator Pagination */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5 bg-white/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/50">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${index === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-muted/65 hover:bg-muted'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

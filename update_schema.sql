-- SDB Auto Accessories - Database Migration for Multi-Image Hero Carousel
-- Run this in your Supabase SQL Editor to update the schema.

-- 1. Drop the existing single-row hero_settings table
DROP TABLE IF EXISTS public.hero_settings CASCADE;

-- 2. Create the new hero_settings table supporting multiple slides
CREATE TABLE public.hero_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    heading text DEFAULT 'Premium Car & Bike Accessories' NOT NULL,
    subheading text DEFAULT 'Upgrade your ride with high-performance styling, premium lighting, and durable protective gear.' NOT NULL,
    image_url text NOT NULL,
    cta_text text DEFAULT 'Shop Now' NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY "Allow public read access to hero_settings" ON public.hero_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read/write to hero_settings" ON public.hero_settings
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed initial slides
INSERT INTO public.hero_settings (heading, subheading, image_url, cta_text, sort_order) VALUES
(
    'Premium Car & Bike Accessories', 
    'Upgrade your ride with high-performance styling, premium lighting, and durable protective gear.', 
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1600', 
    'Shop Now', 
    1
),
(
    'Style Up Your Driveway', 
    'Exclusive collection of steering covers, car chargers, ambient lighting, and daily utility tools.', 
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1600', 
    'Explore Styling', 
    2
),
(
    'Durable Bike Protections', 
    'Water-resistant UV body covers, universal phone mounts, and robust safety gear for every rider.', 
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1600', 
    'View Bike Gear', 
    3
);

-- 6. Add SKU and Keywords columns to products table if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS keywords text;

-- 7. Update existing products with default SKU and keywords
UPDATE public.products SET sku = 'SDB-STEER-001', keywords = 'steering, cover, leatherette, styling, grip, protect' WHERE slug = 'leatherette-steering-wheel-cover';
UPDATE public.products SET sku = 'SDB-CHARG-002', keywords = 'charger, fast, usb, dual, car, mobile' WHERE slug = 'dual-port-usb-car-fast-charger';
UPDATE public.products SET sku = 'SDB-COVER-003', keywords = 'cover, bike, body, protection, weather, motorcycle' WHERE slug = 'heavy-duty-bike-body-cover';
UPDATE public.products SET sku = 'SDB-LIGHT-004', keywords = 'led, light, bulb, headlamp, beam, bright' WHERE slug = 'led-h4-high-beam-headlight-bulb';
UPDATE public.products SET sku = 'SDB-GUARD-005', keywords = 'guard, door, scratch, protector, clear' WHERE slug = 'anti-scratch-clear-door-guard-protectors';
UPDATE public.products SET sku = 'SDB-MOUNT-006', keywords = 'mount, phone, holder, bike, motorcycle, universal' WHERE slug = 'universal-mobile-phone-mount-holder';


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

-- 8. Add numeric stock column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 10 NOT NULL;

-- 9. Ensure in_stock aligns with the numeric stock levels
UPDATE public.products SET in_stock = (stock > 0);

-- 10. Setup Supabase Storage Bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('sdb-images', 'sdb-images', true)
ON CONFLICT (id) DO NOTHING;

-- 11. Enable public storage policies for sdb-images bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Policy' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Access Policy" ON storage.objects FOR SELECT USING (bucket_id = 'sdb-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert Policy' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Insert Policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sdb-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Update Policy' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Update Policy" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'sdb-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Delete Policy' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Delete Policy" ON storage.objects FOR DELETE USING (bucket_id = 'sdb-images');
    END IF;
END
$$;

-- 12. Add advanced constraint fields to coupons table
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS min_order_amount numeric DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS max_discount_amount numeric;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS start_date timestamp with time zone;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS usage_limit integer;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS used_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS usage_limit_per_customer integer;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS allow_combine boolean DEFAULT false NOT NULL;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicable_product_ids uuid[];
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicable_category_ids uuid[];

-- 13. Create helper function to fetch database size and public bucket storage size
CREATE OR REPLACE FUNCTION public.get_supabase_usage()
RETURNS json
SECURITY DEFINER
AS $$
DECLARE
    db_sz bigint;
    storage_sz bigint;
    db_limit bigint := 524288000; -- 500 MB (Supabase free tier DB limit)
    storage_limit bigint := 1073741824; -- 1 GB (Supabase free tier Storage limit)
BEGIN
    -- 1. Database Size
    SELECT pg_database_size(current_database()) INTO db_sz;
    
    -- 2. Storage Size (Sum of all files in sdb-images bucket)
    SELECT COALESCE(SUM((metadata->>'size')::bigint), 0) INTO storage_sz
    FROM storage.objects
    WHERE bucket_id = 'sdb-images';
    
    RETURN json_build_object(
        'db_size_bytes', db_sz,
        'db_limit_bytes', db_limit,
        'storage_size_bytes', storage_sz,
        'storage_limit_bytes', storage_limit
    );
END;
$$ LANGUAGE plpgsql;



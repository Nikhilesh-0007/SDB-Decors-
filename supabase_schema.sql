-- SGBdecors Supabase Database Schema
-- Run this in your Supabase Project SQL Editor to set up the database.

-- Drop existing tables if they exist to start fresh
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.coupons cascade;
drop table if exists public.hero_settings cascade;
drop table if exists public.admin_users cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. Create Tables
-- =========================================================================

-- Categories Table
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique
);

-- Products Table
create table public.products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    description text,
    price numeric not null check (price >= 0),
    images text[] default '{}'::text[],
    category_id uuid references public.categories(id) on delete set null,
    stock integer default 0 check (stock >= 0),
    is_featured boolean default false,
    is_out_of_stock boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Coupons Table
create table public.coupons (
    id uuid default gen_random_uuid() primary key,
    code text not null unique,
    discount_type text not null check (discount_type in ('percentage', 'fixed')),
    discount_value numeric not null check (discount_value > 0),
    expiry_date timestamp with time zone not null,
    active boolean default true not null
);

-- Orders Table
create table public.orders (
    id uuid default gen_random_uuid() primary key,
    customer_name text not null,
    phone text not null,
    email text not null,
    address text,
    notes text,
    products_json jsonb not null, -- Stores array of { id, name, price, quantity, image }
    coupon_code text,
    total_amount numeric not null check (total_amount >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hero Settings Table (Single-row configuration)
create table public.hero_settings (
    id integer primary key default 1 check (id = 1),
    title text default 'Curated Decor For Modern Living' not null,
    subtitle text default 'Discover our premium handcrafted collection of home decor and furniture.' not null,
    image_url text,
    button_text text default 'Explore Catalog' not null,
    banner_url text
);

-- Admin Users Table (Custom credentials)
create table public.admin_users (
    id uuid default gen_random_uuid() primary key,
    email text not null unique,
    password text not null
);

-- =========================================================================
-- 2. Row Level Security (RLS) Policies
-- =========================================================================

-- Enable RLS on all tables
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.hero_settings enable row level security;
alter table public.admin_users enable row level security;

-- Categories Policies
create policy "Allow public read access to categories" on public.categories
    for select using (true);

create policy "Allow admin write access to categories" on public.categories
    for all to authenticated using (true) with check (true);

-- Products Policies
create policy "Allow public read access to products" on public.products
    for select using (true);

create policy "Allow admin write access to products" on public.products
    for all to authenticated using (true) with check (true);

-- Coupons Policies
create policy "Allow public read access to active coupons" on public.coupons
    for select using (active = true);

create policy "Allow admin write access to coupons" on public.coupons
    for all to authenticated using (true) with check (true);

-- Orders Policies
create policy "Allow public insert access to orders" on public.orders
    for insert with check (true);

create policy "Allow admin read/write access to orders" on public.orders
    for all to authenticated using (true) with check (true);

-- Hero Settings Policies
create policy "Allow public read access to hero_settings" on public.hero_settings
    for select using (true);

create policy "Allow admin write access to hero_settings" on public.hero_settings
    for all to authenticated using (true) with check (true);

-- =========================================================================
-- 3. Seed Data
-- =========================================================================

-- Seed Categories
insert into public.categories (name, slug) values
('Furniture', 'furniture'),
('Lighting', 'lighting'),
('Wall Decor', 'wall-decor'),
('Accessories', 'accessories');

-- Seed Hero Settings (Default Row)
insert into public.hero_settings (id, title, subtitle, button_text, image_url, banner_url) values
(1, 'Curated Decor For Modern Living', 'Discover our premium handcrafted collection of home decor and furniture designed for elegant spaces.', 'Explore Catalog', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1600');

-- Seed Coupons
insert into public.coupons (code, discount_type, discount_value, expiry_date, active) values
('WELCOME10', 'percentage', 10, '2030-01-01 00:00:00+00', true),
('DECOR50', 'fixed', 50, '2030-01-01 00:00:00+00', true);

-- Seed Products
-- Note: Replace category_ids with actual UUIDs generated, or let's use the categories created above.
-- For standard seeding, since the UUIDs are generated, we can do it dynamically or let the admin add them.
-- But we can seed some sample products using a query that finds the category.
do $$
declare
    furniture_id uuid;
    lighting_id uuid;
    wall_decor_id uuid;
    accessories_id uuid;
begin
    select id into furniture_id from public.categories where slug = 'furniture';
    select id into lighting_id from public.categories where slug = 'lighting';
    select id into wall_decor_id from public.categories where slug = 'wall-decor';
    select id into accessories_id from public.categories where slug = 'accessories';

    insert into public.products (name, slug, description, price, stock, is_featured, is_out_of_stock, category_id, images) values
    (
        'Sven Velvet Sofa', 
        'sven-velvet-sofa', 
        'A luxurious velvet sofa in deep emerald green, featuring solid wood legs and high-density foam padding for exceptional comfort and mid-century elegance.', 
        999.00, 
        5, 
        true, 
        false, 
        furniture_id, 
        array['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=800']
    ),
    (
        'Minimalist Oak Coffee Table', 
        'minimalist-oak-coffee-table', 
        'Crafted from solid white oak, this coffee table blends Japanese minimalism with Scandinavian functionality, featuring clean lines and a lower shelf for storage.', 
        450.00, 
        8, 
        true, 
        false, 
        furniture_id, 
        array['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800']
    ),
    (
        'Brass Arch Floor Lamp', 
        'brass-arch-floor-lamp', 
        'An elegant brass arch floor lamp with a heavy white marble base. The perfect reading companion that adds structural beauty to any modern living room.', 
        189.00, 
        12, 
        true, 
        false, 
        lighting_id, 
        array['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800']
    ),
    (
        'Ribbed Ceramic Vase Set', 
        'ribbed-ceramic-vase-set', 
        'Set of three ceramic vases with unique ribbed textures in organic sand and cream hues. Ideal for displaying dried pampas grass or fresh seasonal blooms.', 
        75.00, 
        20, 
        false, 
        false, 
        accessories_id, 
        array['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=800']
    ),
    (
        'Abstract Lines Wall Art', 
        'abstract-lines-wall-art', 
        'A set of two framed abstract canvas prints, featuring minimalist black ink lines on textured beige backgrounds. Complete with premium oak frames.', 
        120.00, 
        0, 
        false, 
        true, 
        wall_decor_id, 
        array['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800']
    ),
    (
        'Travertine Bookends', 
        'travertine-bookends', 
        'Carved from premium natural travertine stone, these sculptural bookends showcase the raw beauty of natural stone texture and hold your favorite volumes in style.', 
        95.00, 
        15, 
        true, 
        false, 
        accessories_id, 
        array['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800']
    );
end $$;

-- Seed Admin Credentials
insert into public.admin_users (email, password) values
('admin@sgbdecors.com', 'SGBdecorsAdmin2026!');

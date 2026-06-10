-- SGB Decors Supabase Database Schema Reset
-- Run this in your Supabase Project SQL Editor to set up the database.

-- Drop existing tables to start fresh
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
    slug text not null unique,
    image_url text,
    created_at timestamp with time zone default now() not null
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
    in_stock boolean default true not null,
    created_at timestamp with time zone default now() not null
);

-- Coupons Table
create table public.coupons (
    id uuid default gen_random_uuid() primary key,
    code text not null unique,
    discount_type text not null check (discount_type in ('percent', 'flat')),
    discount_value numeric not null check (discount_value > 0),
    is_active boolean default true not null,
    created_at timestamp with time zone default now() not null
);

-- Orders Table
create table public.orders (
    id uuid default gen_random_uuid() primary key,
    customer_name text not null,
    customer_phone text not null,
    customer_email text not null,
    items jsonb not null, -- Stores array of { product_id, name, qty, price }
    coupon_code text,
    total_amount numeric not null check (total_amount >= 0),
    whatsapp_sent boolean default true not null,
    created_at timestamp with time zone default now() not null
);

-- Hero Settings Table (Single-row configuration)
create table public.hero_settings (
    id integer primary key default 1 check (id = 1),
    heading text default 'Premium Car & Bike Accessories' not null,
    subheading text default 'Upgrade your ride with high-performance styling, premium lighting, and durable protective gear.' not null,
    image_url text,
    cta_text text default 'Shop Now' not null,
    updated_at timestamp with time zone default now() not null
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

create policy "Allow public read/write to categories" on public.categories
    for all using (true) with check (true);

-- Products Policies
create policy "Allow public read access to products" on public.products
    for select using (true);

create policy "Allow public read/write to products" on public.products
    for all using (true) with check (true);

-- Coupons Policies
create policy "Allow public read access to active coupons" on public.coupons
    for select using (is_active = true);

create policy "Allow public read/write to coupons" on public.coupons
    for all using (true) with check (true);

-- Orders Policies
create policy "Allow public insert access to orders" on public.orders
    for insert with check (true);

create policy "Allow public read/write to orders" on public.orders
    for all using (true) with check (true);

-- Hero Settings Policies
create policy "Allow public read access to hero_settings" on public.hero_settings
    for select using (true);

create policy "Allow public read/write to hero_settings" on public.hero_settings
    for all using (true) with check (true);

-- =========================================================================
-- 3. Seed Data
-- =========================================================================

-- Seed Categories
insert into public.categories (name, slug, image_url) values
('Car Styling', 'car-styling', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400'),
('Bike Accessories', 'bike-accessories', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400'),
('Car Protection', 'car-protection', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400'),
('LED Lighting', 'led-lighting', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400');

-- Seed Hero Settings (Default Row)
insert into public.hero_settings (id, heading, subheading, image_url, cta_text) values
(1, 'Premium Car & Bike Accessories', 'Upgrade your ride with high-performance styling, premium lighting, and durable protective gear.', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1600', 'Shop Now');

-- Seed Coupons
insert into public.coupons (code, discount_type, discount_value, is_active) values
('WELCOME10', 'percent', 10, true),
('RIDE500', 'flat', 500, true);

-- Seed Products
do $$
declare
    styling_id uuid;
    bike_id uuid;
    protection_id uuid;
    lighting_id uuid;
begin
    select id into styling_id from public.categories where slug = 'car-styling';
    select id into bike_id from public.categories where slug = 'bike-accessories';
    select id into protection_id from public.categories where slug = 'car-protection';
    select id into lighting_id from public.categories where slug = 'led-lighting';

    insert into public.products (name, slug, description, price, in_stock, category_id, images) values
    (
        'Leatherette Steering Wheel Cover', 
        'leatherette-steering-wheel-cover', 
        'Anti-slip, breathable micro-fiber steering wheel wrap providing an elegant grip and long lasting protection for all standard size steering wheels.', 
        899.00, 
        true, 
        styling_id, 
        array['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600']
    ),
    (
        'Dual-Port USB Car Fast Charger', 
        'dual-port-usb-car-fast-charger', 
        'Quick charge 3.0 metal car charger adapter, featuring intelligent voltage display and dual USB ports for simultaneously upgrading mobile battery on the move.', 
        499.00, 
        true, 
        styling_id, 
        array['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600']
    ),
    (
        'Heavy Duty Bike Body Cover', 
        'heavy-duty-bike-body-cover', 
        'All-weather UV protected, water-resistant scratch-proof motorcycle body cover with soft lining and security buckle straps to keep two wheelers safe.', 
        750.00, 
        true, 
        bike_id, 
        array['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600']
    ),
    (
        'LED H4 High Beam Headlight Bulb', 
        'led-h4-high-beam-headlight-bulb', 
        'Ultra-bright white light 6000K LED bulb set, designed with heat-sink fans providing superior night-time visibility and clear road cutoff lines.', 
        2499.00, 
        true, 
        lighting_id, 
        array['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600']
    ),
    (
        'Anti-Scratch Clear Door Guard Protectors', 
        'anti-scratch-clear-door-guard-protectors', 
        'Flexible transparent door edge guards to prevent scuffs, paint chips, and dings when opening doors in tight parking spots.', 
        350.00, 
        false, 
        protection_id, 
        array['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600']
    ),
    (
        'Universal Mobile Phone Mount Holder', 
        'universal-mobile-phone-mount-holder', 
        'Strong grip handlebar mount with 360 rotation, designed with shockproof corner pads to keep phones fully locked in during motorcycle journeys.', 
        599.00, 
        true, 
        bike_id, 
        array['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600']
    );
end $$;

-- Seed Admin Credentials
insert into public.admin_users (email, password) values
('admin@sgbdecors.com', 'SGBdecorsAdmin2026!');

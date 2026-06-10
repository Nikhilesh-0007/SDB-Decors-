'use server';

import { supabaseAdmin } from './supabase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Helper to verify admin authentication using session cookies
async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('sgb_admin_session')?.value;

  if (session !== 'authenticated_admin_session_active') {
    throw new Error('Unauthorized access. Admin authentication required.');
  }
  return true;
}

// Admin login action querying the public.admin_users table
export async function loginAdmin(email: string, password: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (data.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Set a secure, HTTP-only cookie to track the admin session
    const cookieStore = await cookies();
    cookieStore.set('sgb_admin_session', 'authenticated_admin_session_active', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (err: any) {
    console.error('Login error:', err);
    return { success: false, error: 'An unexpected connection error occurred.' };
  }
}

// Admin logout action clearing session cookies
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('sgb_admin_session');
  return { success: true };
}

// =========================================================================
// PUBLIC CATALOG ACTIONS (Server Components/Actions)
// =========================================================================

// Fetch all categories
export async function getCategories() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error fetching categories:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase DB connection offline: categories list fell back to empty.');
    return [];
  }
}

// Fetch products with search, filter, and sort options
export async function getProducts(options?: {
  categorySlug?: string;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'latest';
  featuredOnly?: boolean;
}) {
  try {
    let query = supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)');

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (options?.categorySlug && options.categorySlug !== 'all') {
      // We need to filter by category slug
      // First, let's find the category ID
      const { data: catData } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', options.categorySlug)
        .single();
      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (options?.searchQuery) {
      query = query.ilike('name', `%${options.searchQuery}%`);
    }

    if (options?.sortBy) {
      if (options.sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (options.sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching products:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase DB connection offline: products list fell back to empty.');
    return [];
  }
}

// Fetch a single product by slug
export async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .single();

    if (error) {
      console.warn(`Error fetching product with slug ${slug}:`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`Supabase DB connection offline: single product fetch for ${slug} fell back to null.`);
    return null;
  }
}

// Fetch related products (same category, excluding current product)
export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit = 4) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)')
      .eq('category_id', categoryId)
      .not('id', 'eq', excludeProductId)
      .limit(limit);

    if (error) {
      console.warn('Error fetching related products:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase DB connection offline: related products list fell back to empty.');
    return [];
  }
}

// Fetch Hero settings
export async function getHeroSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from('hero_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.warn('Error fetching hero settings:', error.message);
      // Return mock fallback settings if DB is not initialized yet
      return {
        title: 'Curated Decor For Modern Living',
        subtitle: 'Discover our premium handcrafted collection of home decor and furniture.',
        button_text: 'Explore Catalog',
        image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600',
        banner_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1600'
      };
    }
    return data;
  } catch (err) {
    console.warn('Supabase DB connection offline: hero settings fell back to default mock values.');
    return {
      title: 'Curated Decor For Modern Living',
      subtitle: 'Discover our premium handcrafted collection of home decor and furniture.',
      button_text: 'Explore Catalog',
      image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600',
      banner_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1600'
    };
  }
}

// =========================================================================
// CART & CHECKOUT ACTIONS
// =========================================================================

// Validate coupon code
export async function validateCoupon(code: string) {
  try {
    const trimmedCode = code.trim().toUpperCase();
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', trimmedCode)
      .eq('active', true)
      .single();

    if (error || !data) {
      return { isValid: false, message: 'Invalid or inactive coupon code.' };
    }

    const expiry = new Date(data.expiry_date);
    if (expiry < new Date()) {
      return { isValid: false, message: 'Coupon code has expired.' };
    }

    return {
      isValid: true,
      coupon: {
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
      },
    };
  } catch (err) {
    return { isValid: false, message: 'Invalid or inactive coupon code.' };
  }
}

// Submit a new order
export async function createOrder(orderData: {
  customer_name: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  coupon_code?: string;
  total_amount: number;
}) {
  try {
    // 1. Insert order into the database
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: orderData.customer_name,
        phone: orderData.phone,
        email: orderData.email,
        address: orderData.address || null,
        notes: orderData.notes || null,
        products_json: orderData.products,
        coupon_code: orderData.coupon_code || null,
        total_amount: orderData.total_amount,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Adjust stock levels for ordered items
    for (const item of orderData.products) {
      // Fetch current stock
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (prod) {
        const newStock = Math.max(0, prod.stock - item.quantity);
        const isOutOfStock = newStock <= 0;

        await supabaseAdmin
          .from('products')
          .update({
            stock: newStock,
            is_out_of_stock: isOutOfStock,
          })
          .eq('id', item.id);
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath('/products');

    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message || 'Failed to submit order' };
  }
}

// =========================================================================
// ADMIN CONTROL ACTIONS (Protected)
// =========================================================================

// Get statistics for admin dashboard
export async function getAdminDashboardStats() {
  await verifyAdmin();

  // 1. Fetch total counts
  const { count: totalProducts } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: totalCategories } = await supabaseAdmin
    .from('categories')
    .select('*', { count: 'exact', head: true });

  const { count: totalOrders } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // 2. Fetch recent orders
  const { data: recentOrders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // 3. Calculate total revenue
  const { data: revenueData } = await supabaseAdmin
    .from('orders')
    .select('total_amount');

  const totalRevenue = (revenueData || []).reduce(
    (sum, order) => sum + Number(order.total_amount),
    0
  );

  return {
    totalProducts: totalProducts || 0,
    totalCategories: totalCategories || 0,
    totalOrders: totalOrders || 0,
    totalRevenue,
    recentOrders: recentOrders || [],
  };
}

// Save Hero Settings
export async function updateHeroSettings(settings: {
  title: string;
  subtitle: string;
  button_text: string;
  image_url?: string;
  banner_url?: string;
}) {
  await verifyAdmin();

  const { error } = await supabaseAdmin
    .from('hero_settings')
    .upsert({
      id: 1,
      title: settings.title,
      subtitle: settings.subtitle,
      button_text: settings.button_text,
      image_url: settings.image_url,
      banner_url: settings.banner_url,
    });

  if (error) {
    console.error('Error updating hero settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

// Category CRUD
export async function createCategory(name: string, slug: string) {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/products');
  return { success: true, data };
}

export async function updateCategory(id: string, name: string, slug: string) {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({ name, slug })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/products');
  return { success: true, data };
}

export async function deleteCategory(id: string) {
  await verifyAdmin();

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/products');
  return { success: true };
}

// Product CRUD
export async function createProduct(productData: {
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  stock: number;
  is_featured: boolean;
  is_out_of_stock: boolean;
}) {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      price: productData.price,
      category_id: productData.category_id,
      images: productData.images,
      stock: productData.stock,
      is_featured: productData.is_featured,
      is_out_of_stock: productData.is_out_of_stock,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/products');
  return { success: true, data };
}

export async function updateProduct(
  id: string,
  productData: {
    name: string;
    slug: string;
    description: string;
    price: number;
    category_id: string;
    images: string[];
    stock: number;
    is_featured: boolean;
    is_out_of_stock: boolean;
  }
) {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      price: productData.price,
      category_id: productData.category_id,
      images: productData.images,
      stock: productData.stock,
      is_featured: productData.is_featured,
      is_out_of_stock: productData.is_out_of_stock,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${productData.slug}`);
  return { success: true, data };
}

export async function deleteProduct(id: string) {
  await verifyAdmin();

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/products');
  return { success: true };
}

// Coupon CRUD
export async function getCoupons() {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('expiry_date', { ascending: false });

  if (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
  return data || [];
}

export async function createCoupon(couponData: {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiry_date: string;
  active: boolean;
}) {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .insert({
      code: couponData.code.trim().toUpperCase(),
      discount_type: couponData.discount_type,
      discount_value: couponData.discount_value,
      expiry_date: couponData.expiry_date,
      active: couponData.active,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating coupon:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateCoupon(
  id: string,
  couponData: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    expiry_date: string;
    active: boolean;
  }
) {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .update({
      code: couponData.code.trim().toUpperCase(),
      discount_type: couponData.discount_type,
      discount_value: couponData.discount_value,
      expiry_date: couponData.expiry_date,
      active: couponData.active,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating coupon:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteCoupon(id: string) {
  await verifyAdmin();

  const { error } = await supabaseAdmin.from('coupons').delete().eq('id', id);

  if (error) {
    console.error('Error deleting coupon:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Order Management
export async function getOrders() {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data || [];
}

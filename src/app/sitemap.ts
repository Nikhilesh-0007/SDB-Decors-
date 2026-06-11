import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Regenerate sitemap once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sdbautoaccessories.com';

  let products: any[] = [];
  let categories: any[] = [];

  try {
    const { data: prodData } = await supabase.from('products').select('slug, created_at');
    if (prodData) products = prodData;

    const { data: catData } = await supabase.from('categories').select('slug');
    if (catData) categories = catData;
  } catch (err) {
    console.error('Sitemap query error:', err);
  }

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic product routes
  const productRoutes = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: new Date(prod.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic category queries
  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/products?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}

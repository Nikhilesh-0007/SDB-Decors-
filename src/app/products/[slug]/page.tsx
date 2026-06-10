import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from '@/components/product-detail-client';
import ProductCard from '@/components/product-card';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0; // Live details fetching

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    const { data: prodData } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .single();

    if (prodData) {
      product = prodData;

      // Load related products from the same category
      if (product.category_id) {
        const { data: relData } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('category_id', product.category_id)
          .not('id', 'eq', product.id)
          .eq('in_stock', true)
          .limit(4);
        if (relData) {
          relatedProducts = relData;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load product by slug:', err);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-muted font-light">
        <Link href="/products" className="inline-flex items-center hover:text-primary transition-colors">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Catalog
        </Link>
        <span>/</span>
        <span className="text-text line-clamp-1 font-semibold">{product.name}</span>
      </div>

      {/* Product Information Client Block */}
      <ProductDetailClient product={product} />

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-border space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold text-dark tracking-tight">You May Also Like</h2>
            <p className="text-sm text-muted font-light">
              Upgrades from the same category that fit your ride.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct: any) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

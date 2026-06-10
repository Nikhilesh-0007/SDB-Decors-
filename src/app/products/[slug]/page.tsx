import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/lib/actions';
import ProductDetailClient from '@/components/product-detail-client';
import ProductCard from '@/components/product-card';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0; // Dynamic detail pages, bypass compilation caching

export default async function ProductDetailPage({ params }: PageProps) {
  // Await the Next.js 15 parameters object
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products (same category, excluding current product)
  const relatedProducts = product.category_id
    ? await getRelatedProducts(product.category_id, product.id, 4)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      {/* Back to catalog & Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-foreground/50 font-light">
        <Link href="/products" className="inline-flex items-center hover:text-accent transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Link>
        <span>/</span>
        <span className="text-foreground/85 line-clamp-1">{product.name}</span>
      </div>

      {/* Main product presentation block */}
      <ProductDetailClient product={product} />

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-border/40 space-y-10">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-primary tracking-tight">You May Also Like</h2>
            <p className="text-sm text-foreground/50 font-light">
              Accent pieces that harmonize beautifully with this design item.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((relProduct: any) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

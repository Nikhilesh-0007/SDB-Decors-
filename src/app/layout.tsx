import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { CartProvider } from '@/components/cart-provider';

export const metadata: Metadata = {
  title: 'SGBdecors | Premium Furniture & Home Decor Catalog',
  description: 'Discover curated modern living furniture, lighting, wall decor, and home accessories. Order easily via WhatsApp catalog checkout.',
  keywords: 'furniture, home decor, modern living, lighting, wall decor, boutique furniture, whatsapp shopping',
  openGraph: {
    title: 'SGBdecors | Premium Furniture & Home Decor Catalog',
    description: 'Discover curated modern living furniture, lighting, wall decor, and home accessories. Order easily via WhatsApp.',
    type: 'website',
    url: 'https://sgbdecors.com',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
        width: 800,
        height: 600,
        alt: 'SGBdecors Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SGBdecors | Premium Furniture & Home Decor Catalog',
    description: 'Discover curated modern living furniture, lighting, wall decor, and home accessories.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent/20 selection:text-primary">
        <CartProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

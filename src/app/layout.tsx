import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AnnouncementBar from '@/components/announcement-bar';
import WhatsAppFloat from '@/components/whatsapp-float';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'SGB Decors | Premium Car & Bike Accessories Catalog',
  description: 'Upgrade your ride with SGB Decors. Premium car and bike accessories including styling, protection, utility, and lights in India. Order easily via WhatsApp.',
  keywords: 'car accessories, bike accessories, automotive decor, car styling, premium bike upgrades, india car parts, whatsapp shopping',
  openGraph: {
    title: 'SGB Decors | Premium Car & Bike Accessories Catalog',
    description: 'Upgrade your ride with premium styling, lights, and protection accessories. Fast delivery across India & WhatsApp support.',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
        width: 800,
        height: 600,
        alt: 'SGB Decors Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SGB Decors | Premium Car & Bike Accessories Catalog',
    description: 'Upgrade your ride with SGB Decors. Premium styling, lights, and protection accessories across India.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-bg text-text selection:bg-primary/20 selection:text-primary">
        <CartProvider>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AnnouncementBar from '@/components/announcement-bar';
import WhatsAppFloat from '@/components/whatsapp-float';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'SGB Decors | Premium Car & Bike Accessories',
  description: 'Upgrade your ride with SGB Decors. Premium car and bike accessories including styling, protection, utility, and lights in India. Order easily via WhatsApp.',
  keywords: 'car accessories, bike accessories, automotive decor, car styling, premium bike upgrades, india car parts, whatsapp shopping',
  openGraph: {
    title: 'SGB Decors | Premium Car & Bike Accessories',
    description: 'Upgrade your ride with premium styling, lights, and protection accessories. Fast delivery across India & WhatsApp support.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SGB Decors | Premium Car & Bike Accessories',
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
      <body className="min-h-full flex flex-col" style={{ background: '#0B0F0C', color: '#F8F3E8' }}>
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

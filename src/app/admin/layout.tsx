import React from 'react';

export const metadata = {
  title: 'SGBdecors | Admin Portal',
  description: 'Manage products, categories, coupons, and orders.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-secondary/15">{children}</div>;
}

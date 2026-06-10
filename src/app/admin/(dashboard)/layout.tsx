import React from 'react';
import AdminNav from '@/components/admin-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminNav>{children}</AdminNav>;
}

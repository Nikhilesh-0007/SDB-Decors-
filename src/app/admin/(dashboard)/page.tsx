import React from 'react';
import Link from 'next/link';
import { ShoppingBag, FolderTree, Receipt, DollarSign, ArrowRight, User } from 'lucide-react';
import { getAdminDashboardStats } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 0; // Dynamic dashboard stats

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    {
      name: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: Receipt,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      name: 'Active Catalog',
      value: `${stats.totalProducts} Products`,
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      name: 'Categories',
      value: stats.totalCategories.toString(),
      icon: FolderTree,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-primary text-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back, Admin</h1>
          <p className="text-white/60 text-xs mt-1 font-light">Here is a quick overview of your SGBdecors catalog cataloging, orders, and stats.</p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center text-xs font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-white hover:text-primary transition-all shadow-xs"
        >
          Manage Catalog
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.name}
              className="bg-card rounded-2xl border border-border/40 p-6 flex items-center space-x-4 shadow-xs"
            >
              <div className={`p-3 rounded-xl border ${c.color}`}>
                <Icon className="h-6 w-6 stroke-[1.5]" />
              </div>
              <div>
                <p className="text-xs text-foreground/45 font-medium">{c.name}</p>
                <h3 className="text-lg font-bold text-primary font-display mt-0.5">{c.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-card rounded-3xl border border-border/40 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-primary">Recent Orders</h3>
            <p className="text-xs text-foreground/45 font-light mt-0.5">The latest checkout submissions from SGBdecors.</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-xs font-semibold text-accent hover:underline"
          >
            All Orders
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>

        {stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-foreground/45 border-b border-border/40 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Customer</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Submitted</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-secondary/10 group transition-colors">
                    {/* Customer */}
                    <td className="py-4 pl-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center text-accent">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-primary">{order.customer_name}</span>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="py-4">
                      <div className="space-y-0.5 text-xs text-foreground/75 font-light">
                        <p>{order.email}</p>
                        <p>{order.phone}</p>
                      </div>
                    </td>
                    {/* Total */}
                    <td className="py-4 font-semibold text-primary font-display">
                      {formatCurrency(Number(order.total_amount))}
                    </td>
                    {/* Submitted date */}
                    <td className="py-4 text-xs text-foreground/50 font-light">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    {/* Details Link */}
                    <td className="py-4 pr-2 text-right">
                      <Link
                        href={`/admin/orders?id=${order.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-transparent px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty orders */
          <div className="text-center py-12 space-y-2">
            <span className="text-3xl">📭</span>
            <p className="text-sm font-semibold text-primary">No orders placed yet</p>
            <p className="text-xs text-foreground/45 font-light">Customer order details will appear here once submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
}

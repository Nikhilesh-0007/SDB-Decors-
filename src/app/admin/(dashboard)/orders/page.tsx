import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Phone, Mail, MapPin, ClipboardList, Tag, Receipt, Calendar } from 'lucide-react';
import { getOrders } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';

interface SearchParams {
  id?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export const revalidate = 0; // Dynamic order logs page

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  // Await searchParams as per Next.js 15 App Router specifications
  const params = await searchParams;
  const activeOrderId = params.id;

  const orders = await getOrders();

  // If an active ID is provided, show the detailed viewer for that specific order
  if (activeOrderId) {
    const order = orders.find((o) => o.id === activeOrderId);

    if (!order) {
      return (
        <div className="space-y-6">
          <Link href="/admin/orders" className="inline-flex items-center text-xs font-semibold text-foreground/50 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
          <div className="bg-card rounded-2xl border border-border/40 p-8 text-center">
            <p className="text-sm font-semibold text-primary">Order not found.</p>
            <p className="text-xs text-foreground/45 mt-1">The specified order ID does not exist in the database.</p>
          </div>
        </div>
      );
    }

    // Parse items list
    const lineItems = Array.isArray(order.products_json)
      ? order.products_json
      : JSON.parse(JSON.stringify(order.products_json || []));

    // Calculate subtotal before coupon
    const orderSubtotal = lineItems.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const orderTotal = Number(order.total_amount);
    const discountAmount = Math.max(0, orderSubtotal - orderTotal);

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb Back Button */}
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-xs font-semibold text-foreground/50 hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders List
          </Link>
        </div>

        {/* Detailed Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Customer Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Customer Profile Card */}
            <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-xs space-y-6">
              <h3 className="font-display text-sm font-bold text-primary flex items-center border-b border-border/40 pb-3">
                <User className="mr-2 h-4 w-4 text-accent" />
                Customer Profile
              </h3>

              <div className="space-y-4 text-xs">
                {/* Name */}
                <div>
                  <p className="text-foreground/40 font-semibold uppercase tracking-wider text-[10px]">Full Name</p>
                  <p className="text-sm font-semibold text-primary mt-1">{order.customer_name}</p>
                </div>
                {/* Contact numbers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-foreground/40 font-semibold uppercase tracking-wider text-[10px] flex items-center">
                      <Phone className="mr-1 h-3 w-3" /> Phone
                    </p>
                    <p className="text-foreground/80 mt-1 font-medium">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-foreground/40 font-semibold uppercase tracking-wider text-[10px] flex items-center">
                      <Mail className="mr-1 h-3 w-3" /> Email
                    </p>
                    <p className="text-foreground/80 mt-1 font-medium break-all">{order.email}</p>
                  </div>
                </div>
                {/* Shipping address */}
                <div>
                  <p className="text-foreground/40 font-semibold uppercase tracking-wider text-[10px] flex items-center">
                    <MapPin className="mr-1 h-3 w-3" /> Shipping Address
                  </p>
                  <p className="text-foreground/80 mt-1 leading-relaxed font-light bg-secondary/15 p-3 rounded-xl border border-border/20">
                    {order.address || 'No shipping address provided.'}
                  </p>
                </div>
                {/* Notes */}
                <div>
                  <p className="text-foreground/40 font-semibold uppercase tracking-wider text-[10px] flex items-center">
                    <ClipboardList className="mr-1 h-3 w-3" /> Order Notes
                  </p>
                  <p className="text-foreground/80 mt-1 leading-relaxed font-light bg-secondary/15 p-3 rounded-xl border border-border/20 italic">
                    {order.notes || 'No custom notes provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Timestamp Info */}
            <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-xs flex items-center space-x-3 text-xs text-foreground/50 font-light">
              <Calendar className="h-4.5 w-4.5 text-accent stroke-[1.5]" />
              <div>
                <p>Order Registered ID: {order.id}</p>
                <p className="mt-0.5">
                  Submitted at: {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Order Line items (7 Cols) */}
          <div className="lg:col-span-7 bg-card rounded-2xl border border-border/40 p-6 shadow-xs space-y-6">
            <h3 className="font-display text-sm font-bold text-primary flex items-center border-b border-border/40 pb-3">
              <Receipt className="mr-2 h-4 w-4 text-accent" />
              Line Items Summary
            </h3>

            {/* Line Items Grid */}
            <div className="divide-y divide-border/40">
              {lineItems.map((item: any, idx: number) => {
                const thumbnail = item.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=80';
                return (
                  <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                    <div className="relative aspect-square h-12 w-12 overflow-hidden rounded-lg bg-muted border border-border/20 shrink-0">
                      <Image src={thumbnail} alt={item.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-semibold text-primary line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-foreground/50 mt-0.5 font-light">
                        {item.quantity} units &bull; {formatCurrency(Number(item.price))} each
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-primary font-display shrink-0">
                      {formatCurrency(Number(item.price) * Number(item.quantity))}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Panel */}
            <div className="border-t border-border/40 pt-4 space-y-3 text-xs">
              <div className="flex justify-between text-foreground/60 font-light">
                <span>Subtotal</span>
                <span className="font-semibold text-primary">{formatCurrency(orderSubtotal)}</span>
              </div>

              {order.coupon_code && (
                <div className="flex justify-between text-emerald-600 font-light">
                  <span className="flex items-center">
                    <Tag className="mr-1.5 h-3.5 w-3.5" />
                    Promo Code: {order.coupon_code}
                  </span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-border/40 pt-4 flex justify-between font-display text-sm font-bold text-primary">
                <span>Grand Total Paid</span>
                <span>{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the list view of all orders in a table
  return (
    <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-xs space-y-6">
      <div>
        <h3 className="font-display text-base font-bold text-primary">Order Registry</h3>
        <p className="text-xs text-foreground/45 font-light mt-0.5">List of all customers who completed checking out via WhatsApp catalog.</p>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-foreground/45 border-b border-border/40 text-[10px] font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Customer Name</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Coupon</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Order Date</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-secondary/10 group transition-colors">
                  {/* Name */}
                  <td className="py-4 pl-2">
                    <span className="font-semibold text-primary">{order.customer_name}</span>
                  </td>
                  {/* Contact */}
                  <td className="py-4 text-xs font-light text-foreground/75">
                    <p>{order.email}</p>
                    <p className="mt-0.5">{order.phone}</p>
                  </td>
                  {/* Coupon */}
                  <td className="py-4 text-xs font-mono font-bold text-accent">
                    {order.coupon_code ? order.coupon_code : '-'}
                  </td>
                  {/* Total Amount */}
                  <td className="py-4 font-semibold text-primary font-display">
                    {formatCurrency(Number(order.total_amount))}
                  </td>
                  {/* Date */}
                  <td className="py-4 text-xs text-foreground/50 font-light">
                    {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  {/* Actions */}
                  <td className="py-4 pr-2 text-right">
                    <Link
                      href={`/admin/orders?id=${order.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-transparent px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty registry */
        <div className="text-center py-16 space-y-2">
          <span className="text-3xl">📭</span>
          <p className="text-sm font-semibold text-primary">No orders placed yet</p>
          <p className="text-xs text-foreground/45 font-light">Customer order details will appear here once submitted.</p>
        </div>
      )}
    </div>
  );
}

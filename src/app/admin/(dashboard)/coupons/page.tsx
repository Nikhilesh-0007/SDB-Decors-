'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Tag, Check, X, Calendar } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [active, setActive] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setExpiryDate('');
    setActive(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!code.trim()) {
      setErrorMsg('Coupon code is required.');
      return;
    }
    if (discountValue <= 0) {
      setErrorMsg('Discount value must be greater than 0.');
      return;
    }
    if (!expiryDate) {
      setErrorMsg('Please select an expiry date.');
      return;
    }

    setIsMutating(true);
    try {
      // Ensure date is in ISO string format
      const isoExpiry = new Date(expiryDate).toISOString();

      const payload = {
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        expiry_date: isoExpiry,
        active,
      };

      if (editingId) {
        const result = await updateCoupon(editingId, payload);
        if (result.success) {
          setSuccessMsg('Coupon updated successfully!');
          resetForm();
          await fetchCoupons();
        } else {
          setErrorMsg(result.error || 'Failed to update coupon.');
        }
      } else {
        const result = await createCoupon(payload);
        if (result.success) {
          setSuccessMsg('Coupon created successfully!');
          resetForm();
          await fetchCoupons();
        } else {
          setErrorMsg(result.error || 'Failed to create coupon.');
        }
      }
    } catch (err) {
      setErrorMsg('An error occurred during submission.');
    } finally {
      setIsMutating(false);
    }
  };

  const startEdit = (cpn: any) => {
    setEditingId(cpn.id);
    setCode(cpn.code);
    setDiscountType(cpn.discount_type);
    setDiscountValue(Number(cpn.discount_value));
    // Format timestamp to YYYY-MM-DD for date input
    const dateStr = new Date(cpn.expiry_date).toISOString().split('T')[0];
    setExpiryDate(dateStr);
    setActive(cpn.active);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This will permanently deactivate and delete it.')) {
      return;
    }

    setIsMutating(true);
    try {
      const result = await deleteCoupon(id);
      if (result.success) {
        setSuccessMsg('Coupon deleted successfully!');
        if (editingId === id) resetForm();
        await fetchCoupons();
      } else {
        alert(result.error || 'Failed to delete coupon.');
      }
    } catch (err) {
      alert('An error occurred while deleting.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleActive = async (cpn: any) => {
    setIsMutating(true);
    try {
      const payload = {
        code: cpn.code,
        discount_type: cpn.discount_type,
        discount_value: Number(cpn.discount_value),
        expiry_date: cpn.expiry_date,
        active: !cpn.active,
      };

      const result = await updateCoupon(cpn.id, payload);
      if (result.success) {
        await fetchCoupons();
      } else {
        alert(result.error || 'Failed to toggle coupon status.');
      }
    } catch (err) {
      alert('An error occurred while updating.');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Manage Coupons</h1>
        <p className="text-xs text-foreground/50 mt-1 font-light">
          Set up promotional discount codes that shoppers can apply in their cart.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            1. COUPON FORM (Left Column - 4 Cols)
           ========================================================================= */}
        <div className="lg:col-span-4 bg-card rounded-2xl border border-border/40 p-6 shadow-xs space-y-6">
          <h3 className="font-display text-base font-bold text-primary flex items-center">
            <Tag className="mr-2 h-5 w-5 text-accent stroke-[1.5]" />
            {editingId ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-xs font-semibold text-destructive">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-semibold text-emerald-700">
                {successMsg}
              </div>
            )}

            {/* Code */}
            <div className="space-y-1">
              <label htmlFor="code" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Promo Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10"
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/45 transition-colors uppercase"
                disabled={isMutating}
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-1">
              <label htmlFor="discountType" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Discount Type
              </label>
              <select
                id="discountType"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors cursor-pointer"
                disabled={isMutating}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="space-y-1">
              <label htmlFor="discountValue" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Discount Value
              </label>
              <input
                type="number"
                id="discountValue"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/45 transition-colors"
                disabled={isMutating}
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label htmlFor="expiryDate" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Expiry Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors cursor-pointer"
                  disabled={isMutating}
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs text-primary font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 border-border text-accent focus:ring-accent rounded cursor-pointer"
                  disabled={isMutating}
                />
                <span>Enable Coupon Code</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isMutating}
                className="flex-grow inline-flex items-center justify-center rounded-xl bg-primary py-3 px-4 text-xs font-semibold text-white shadow-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingId ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Coupon
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isMutating}
                  className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-transparent px-4 py-3 text-xs font-semibold text-primary hover:bg-secondary/40 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* =========================================================================
            2. COUPONS TABLE LIST (Right Column - 8 Cols)
           ========================================================================= */}
        <div className="lg:col-span-8 bg-card rounded-2xl border border-border/40 p-6 shadow-xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : coupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-foreground/45 border-b border-border/40 text-[10px] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Coupon Code</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3">Expires</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {coupons.map((cpn) => {
                    const isExpired = new Date(cpn.expiry_date) < new Date();
                    return (
                      <tr key={cpn.id} className="hover:bg-secondary/10 group transition-colors">
                        {/* Code */}
                        <td className="py-4 pl-2 font-mono font-bold text-sm text-primary">
                          {cpn.code}
                        </td>
                        {/* Value */}
                        <td className="py-4 text-xs font-semibold text-foreground/85">
                          {cpn.discount_type === 'percentage'
                            ? `${cpn.discount_value}% Off`
                            : `${formatCurrency(Number(cpn.discount_value))} Off`}
                        </td>
                        {/* Expiry */}
                        <td className={`py-4 text-xs font-light ${isExpired ? 'text-destructive font-medium' : 'text-foreground/50'}`}>
                          {new Date(cpn.expiry_date).toLocaleDateString()} {isExpired && '(Expired)'}
                        </td>
                        {/* Status Toggle */}
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleActive(cpn)}
                            disabled={isMutating || isExpired}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase border shadow-xs transition-colors ${
                              isExpired
                                ? 'bg-secondary text-foreground/40 border-border cursor-not-allowed'
                                : cpn.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 cursor-pointer'
                                : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 cursor-pointer'
                            }`}
                          >
                            {isExpired ? 'Expired' : cpn.active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        {/* Actions */}
                        <td className="py-4 pr-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => startEdit(cpn)}
                              disabled={isExpired}
                              className="p-1.5 text-foreground/45 hover:text-accent rounded-lg hover:bg-secondary/35 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Edit Coupon"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cpn.id)}
                              className="p-1.5 text-foreground/45 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-16 space-y-2">
              <span className="text-3xl">🎫</span>
              <p className="text-sm font-semibold text-primary">No coupons found</p>
              <p className="text-xs text-foreground/45 font-light">Create a coupon on the left side to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  slug: string;
  category_id?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  is_active?: boolean;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  usage_limit?: number | null;
  used_count?: number;
  usage_limit_per_customer?: number | null;
  allow_combine?: boolean;
  applicable_product_ids?: string[] | null;
  applicable_category_ids?: string[] | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  total: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('sdb_cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      const storedCoupon = localStorage.getItem('sdb_coupon');
      if (storedCoupon) {
        setCoupon(JSON.parse(storedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart data:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('sdb_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to save cart:', e);
      }
    }
  }, [cartItems, isLoaded]);

  // Save coupon to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        if (coupon) {
          localStorage.setItem('sdb_coupon', JSON.stringify(coupon));
        } else {
          localStorage.removeItem('sdb_coupon');
        }
      } catch (e) {
        console.error('Failed to save coupon:', e);
      }
    }
  }, [coupon, isLoaded]);

  const addToCart = (product: Omit<CartItem, 'qty'>, qty = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product_id === product.product_id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product_id === product.product_id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prevItems, { ...product, qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.product_id === productId ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('sdb_cart');
    localStorage.removeItem('sdb_coupon');
  };

  const applyCoupon = (appliedCoupon: Coupon) => {
    setCoupon(appliedCoupon);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  let discountAmount = 0;
  if (coupon) {
    // 1. Filter subtotal of applicable items
    let applicableSubtotal = 0;
    const hasProductConstraints = coupon.applicable_product_ids && coupon.applicable_product_ids.length > 0;
    const hasCategoryConstraints = coupon.applicable_category_ids && coupon.applicable_category_ids.length > 0;

    if (hasProductConstraints || hasCategoryConstraints) {
      cartItems.forEach(item => {
        let isApplicable = false;
        if (hasProductConstraints && coupon.applicable_product_ids?.includes(item.product_id)) {
          isApplicable = true;
        }
        if (hasCategoryConstraints && item.category_id && coupon.applicable_category_ids?.includes(item.category_id)) {
          isApplicable = true;
        }
        if (isApplicable) {
          applicableSubtotal += item.price * item.qty;
        }
      });
    } else {
      applicableSubtotal = subtotal;
    }

    // 2. Calculate coupon discount
    if (coupon.discount_type === 'percent') {
      discountAmount = (applicableSubtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount !== undefined && coupon.max_discount_amount !== null) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
      }
    } else {
      if (applicableSubtotal > 0) {
        discountAmount = Number(coupon.discount_value);
      }
    }

    // Cap discount to applicable subtotal
    discountAmount = Math.min(discountAmount, applicableSubtotal);
  }

  const total = Math.max(0, subtotal - discountAmount);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        total,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function validateCoupon(
  selected: any,
  subtotal: number,
  cartItems: any[]
): string | null {
  if (selected.is_active === false) {
    return 'This coupon is currently inactive.';
  }

  // Date validity
  const now = new Date();
  if (selected.start_date) {
    const startDate = new Date(selected.start_date);
    if (now < startDate) {
      return 'This coupon is not active yet.';
    }
  }
  if (selected.end_date) {
    const endDate = new Date(selected.end_date);
    if (now > endDate) {
      return 'This coupon has expired.';
    }
  }

  // Usage limit
  if (selected.usage_limit !== null && selected.usage_limit !== undefined) {
    const usedCount = selected.used_count || 0;
    if (usedCount >= selected.usage_limit) {
      return 'This coupon has reached its total usage limit.';
    }
  }

  // Min order amount
  if (selected.min_order_amount) {
    if (subtotal < Number(selected.min_order_amount)) {
      return `Minimum order amount of ₹${selected.min_order_amount} is required.`;
    }
  }

  // Product/Category constraints
  const hasProductConstraints = selected.applicable_product_ids && selected.applicable_product_ids.length > 0;
  const hasCategoryConstraints = selected.applicable_category_ids && selected.applicable_category_ids.length > 0;

  if (hasProductConstraints || hasCategoryConstraints) {
    const matchesConstraints = cartItems.some(item => {
      if (hasProductConstraints && selected.applicable_product_ids.includes(item.product_id)) {
        return true;
      }
      if (hasCategoryConstraints && item.category_id && selected.applicable_category_ids.includes(item.category_id)) {
        return true;
      }
      return false;
    });

    if (!matchesConstraints) {
      return 'This coupon is not applicable to any items in your cart.';
    }
  }

  return null;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  slug: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  is_active?: boolean;
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
    if (coupon.discount_type === 'percent') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }
  }

  // Cap discount to subtotal
  discountAmount = Math.min(discountAmount, subtotal);
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

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

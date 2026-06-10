'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, LayoutDashboard, Image as ImageIcon, Box, Folder, 
  Ticket, ClipboardList, LogOut, Menu, X, Plus, Edit2, 
  Trash2, ToggleLeft, ToggleRight, Search, ChevronDown, 
  ChevronUp, ExternalLink, Loader2, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, slugify } from '@/lib/utils';

type Tab = 'dashboard' | 'hero' | 'products' | 'categories' | 'coupons' | 'orders' | 'announcements';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Database States
  const [stats, setStats] = useState({ products: 0, categories: 0, coupons: 0, orders: 0 });
  const [hero, setHero] = useState({ heading: '', subheading: '', image_url: '', cta_text: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({ message: '', sort_order: 0, is_active: true });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Forms / Modals States
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [productForm, setProductForm] = useState({
    name: '', slug: '', description: '', price: 0, category_id: '', images: [''], in_stock: true
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', image_url: '' });
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percent' as 'percent' | 'flat', discount_value: 0, is_active: true });

  // Check Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('sgb_admin') === 'true';
      if (!isAuth) {
        router.replace('/admin');
      } else {
        setAuthorized(true);
        loadAllData();
      }
    }
  }, [router]);

  async function loadAllData() {
    setLoading(true);
    try {
      // Load Categories
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const loadedCats = cats || [];
      setCategories(loadedCats);

      // Load Products
      const { data: prods } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
      const loadedProds = prods || [];
      setProducts(loadedProds);

      // Load Hero Settings
      const { data: heroData } = await supabase.from('hero_settings').select('*').eq('id', 1).single();
      if (heroData) {
        setHero(heroData);
      }

      // Load Coupons
      const { data: coups } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      const loadedCoups = coups || [];
      setCoupons(loadedCoups);

      // Load Orders
      const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const loadedOrds = ords || [];
      setOrders(loadedOrds);

      // Load Announcements
      const { data: annoData } = await supabase.from('announcements').select('*').order('sort_order', { ascending: true });
      if (annoData) setAnnouncements(annoData);

      // Set Stats
      setStats({
        products: loadedProds.length,
        categories: loadedCats.length,
        coupons: loadedCoups.filter(c => c.is_active).length,
        orders: loadedOrds.length
      });

    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }

  // Logout Handler
  const handleLogout = () => {
    sessionStorage.removeItem('sgb_admin');
    router.push('/admin');
  };

  // Hero upsert
  const handleHeroSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('hero_settings')
        .upsert({
          id: 1,
          heading: hero.heading,
          subheading: hero.subheading,
          image_url: hero.image_url,
          cta_text: hero.cta_text,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      alert('Hero settings saved successfully!');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  // Category CRUD
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: categoryForm.name,
        slug: categoryForm.slug || slugify(categoryForm.name),
        image_url: categoryForm.image_url
      };

      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }
      setShowCategoryModal(false);
      setCategoryForm({ name: '', slug: '', image_url: '' });
      setEditingId(null);
      loadAllData();
    } catch (err: any) {
      alert(`Failed to save category: ${err.message}`);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All products using it will have category set to null.')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      loadAllData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Product CRUD
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        slug: productForm.slug || slugify(productForm.name),
        description: productForm.description,
        price: Number(productForm.price),
        category_id: productForm.category_id || null,
        images: productForm.images.filter(img => img.trim() !== ''),
        in_stock: productForm.in_stock
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        // Warning if approaching limit
        if (products.length >= 200) {
          alert('You have reached the limit of 200 products. Please delete existing items first.');
          return;
        }
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
      setShowProductModal(false);
      setEditingId(null);
      setProductForm({ name: '', slug: '', description: '', price: 0, category_id: '', images: [''], in_stock: true });
      loadAllData();
    } catch (err: any) {
      alert(`Failed to save product: ${err.message}`);
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadAllData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const toggleProductStock = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setProducts(prev => prev.map(p => p.id === id ? { ...p, in_stock: !currentStatus } : p));
      const { error } = await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert(`Stock toggle failed: ${err.message}`);
      loadAllData();
    }
  };

  // Coupon CRUD
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.discount_value),
        is_active: couponForm.is_active
      };

      if (editingId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
      }
      setShowCouponModal(false);
      setEditingId(null);
      setCouponForm({ code: '', discount_type: 'percent', discount_value: 0, is_active: true });
      loadAllData();
    } catch (err: any) {
      alert(`Failed to save coupon: ${err.message}`);
    }
  };

  const handleCouponDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      loadAllData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const toggleCouponActive = async (id: string, currentStatus: boolean) => {
    try {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
      loadAllData();
    }
  };

  // Dynamic lists rendering based on searches
  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) || 
    o.customer_phone.includes(orderSearch)
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Manage dynamic multiple images input
  const addImageRow = () => {
    setProductForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };
  const removeImageRow = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  const handleImageChange = (index: number, val: string) => {
    setProductForm(prev => {
      const nextImgs = [...prev.images];
      nextImgs[index] = val;
      return { ...prev, images: nextImgs };
    });
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row">
      {/* =========================================================================
          SIDEBAR NAVIGATION (Desktop)
         ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-dark text-white shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary fill-primary" />
          <span className="font-display text-lg font-bold">SGB Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'hero', label: 'Hero Settings', icon: ImageIcon },
            { id: 'products', label: 'Products', icon: Box },
            { id: 'categories', label: 'Categories', icon: Folder },
            { id: 'coupons', label: 'Coupons', icon: Ticket },
            { id: 'orders', label: 'Orders Log', icon: ClipboardList },
            { id: 'announcements', label: 'Announcements', icon: Info }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-primary text-white' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE NAVIGATION TOPBAR
         ========================================================================= */}
      <header className="md:hidden bg-dark text-white p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-2">
          <Car className="h-5 w-5 text-primary fill-primary" />
          <span className="font-display text-base font-bold">SGB Admin</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 cursor-pointer">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark/95 text-white border-b border-white/10 flex flex-col p-4 space-y-1 z-50">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'hero', label: 'Hero Settings', icon: ImageIcon },
            { id: 'products', label: 'Products', icon: Box },
            { id: 'categories', label: 'Categories', icon: Folder },
            { id: 'coupons', label: 'Coupons', icon: Ticket },
            { id: 'orders', label: 'Orders Log', icon: ClipboardList },
            { id: 'announcements', label: 'Announcements', icon: Info }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer ${
                  activeTab === item.id ? 'bg-primary text-white' : 'text-white/70'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-primary cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          MAIN CONTENT VIEW AREA
         ========================================================================= */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-3 text-sm text-muted">Retrieving configurations...</span>
          </div>
        ) : (
          <div>
            {/* =========================================================================
                A. TAB: DASHBOARD
               ========================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-display text-2xl font-bold text-dark">Dashboard Overview</h1>
                  <p className="text-sm text-muted">Real-time statistics of SGB Decors catalog.</p>
                </div>

                {/* Product counter alert */}
                {products.length >= 190 && (
                  <div className="flex items-start space-x-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold">Approaching 200 product limit</h5>
                      <p className="text-xs text-amber-700 mt-1">
                        You currently have {products.length} products listed. Delete old items if you plan to add new inventory.
                      </p>
                    </div>
                  </div>
                )}

                {/* Stat Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Products', value: stats.products, color: 'border-l-primary' },
                    { label: 'Total Categories', value: stats.categories, color: 'border-l-dark' },
                    { label: 'Active Coupons', value: stats.coupons, color: 'border-l-accent' },
                    { label: 'Total Orders', value: stats.orders, color: 'border-l-emerald-600' }
                  ].map((stat, i) => (
                    <div key={i} className={`bg-white rounded-xl border border-border/60 p-5 shadow-sm border-l-4 ${stat.color}`}>
                      <span className="text-xs font-semibold text-muted uppercase tracking-wider block">{stat.label}</span>
                      <span className="text-2xl font-bold text-dark font-display mt-1 block">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Products progress limit slider */}
                <div className="bg-white rounded-xl border border-border/60 p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="font-bold text-dark">Database Storage Quota</span>
                    <span className="text-xs font-semibold text-muted">{products.length} / 200 products used</span>
                  </div>
                  <div className="w-full bg-bg h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        products.length > 180 ? 'bg-primary' : 'bg-dark'
                      }`}
                      style={{ width: `${Math.min(100, (products.length / 200) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                B. TAB: HERO SETTINGS
               ========================================================================= */}
            {activeTab === 'hero' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-display text-2xl font-bold text-dark">Hero Banner Settings</h1>
                  <p className="text-sm text-muted">Update landing header titles and background imagery.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left edit form */}
                  <form onSubmit={handleHeroSave} className="lg:col-span-7 bg-white rounded-xl border border-border/60 p-6 shadow-sm space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-dark uppercase tracking-wider block">Heading</label>
                      <input 
                        type="text" 
                        value={hero.heading}
                        onChange={e => setHero(prev => ({ ...prev, heading: e.target.value }))}
                        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-dark uppercase tracking-wider block">Subheading</label>
                      <textarea 
                        rows={3}
                        value={hero.subheading}
                        onChange={e => setHero(prev => ({ ...prev, subheading: e.target.value }))}
                        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none resize-none"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-dark uppercase tracking-wider block">CTA Button Text</label>
                      <input 
                        type="text" 
                        value={hero.cta_text}
                        onChange={e => setHero(prev => ({ ...prev, cta_text: e.target.value }))}
                        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-dark uppercase tracking-wider block">Image URL</label>
                      <input 
                        type="text" 
                        value={hero.image_url}
                        onChange={e => setHero(prev => ({ ...prev, image_url: e.target.value }))}
                        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                        required
                      />
                    </div>
                    <button type="submit" className="bg-primary text-white font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-primary/95 cursor-pointer">
                      Save Changes
                    </button>
                  </form>

                  {/* Right Live Preview Frame */}
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider block">Live Banner Preview</span>
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-md border border-border">
                      {hero.image_url ? (
                        <img src={hero.image_url} alt="Hero image" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-dark" />
                      )}
                      <div className="absolute inset-0 bg-dark/70" />
                      <div className="absolute inset-0 flex flex-col justify-center p-6 space-y-2">
                        <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded uppercase self-start">âš¡ PREVIEW</span>
                        <h3 className="font-display font-bold text-white text-base leading-tight pr-4 border-l-2 border-primary pl-2">{hero.heading || 'Heading'}</h3>
                        <p className="text-white/70 text-[10px] line-clamp-2 leading-relaxed font-light">{hero.subheading || 'Subheading'}</p>
                        <button className="bg-primary text-white text-[10px] font-bold py-1.5 px-3 rounded self-start mt-1">
                          {hero.cta_text || 'CTA Text'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                C. TAB: PRODUCTS
               ========================================================================= */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-dark">Manage Products</h1>
                    <p className="text-sm text-muted">Create, edit, or toggle inventory status of your catalog.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingId(null);
                      setProductForm({ name: '', slug: '', description: '', price: 0, category_id: '', images: [''], in_stock: true });
                      setShowProductModal(true);
                    }}
                    className="flex items-center space-x-1.5 bg-primary text-white font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-primary/95 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center bg-white p-4 rounded-xl border border-border/60 shadow-sm">
                  <div className="relative flex-grow max-w-md">
                    <input 
                      type="text" 
                      placeholder="Search items by name..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-bg text-muted border-b border-border/60 font-semibold text-xs uppercase tracking-wider">
                        <th className="p-4">Thumbnail</th>
                        <th className="p-4">Name / Slug</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4 text-center">In Stock</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredProducts.map(prod => (
                        <tr key={prod.id} className="hover:bg-bg/25">
                          <td className="p-4">
                            <div className="relative h-12 w-12 rounded-lg bg-bg border border-border/40 overflow-hidden">
                              <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=100'} alt="" className="object-cover h-full w-full" />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-dark">{prod.name}</div>
                            <div className="text-xs text-muted font-mono">{prod.slug}</div>
                          </td>
                          <td className="p-4 text-muted">{prod.categories?.name || 'Unassigned'}</td>
                          <td className="p-4 font-bold text-dark">{formatCurrency(prod.price)}</td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => toggleProductStock(prod.id, prod.in_stock)}
                              className="text-primary hover:scale-105 transition-transform inline-block cursor-pointer focus:outline-none"
                            >
                              {prod.in_stock ? (
                                <ToggleRight className="h-7 w-7 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="h-7 w-7 text-muted" />
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingId(prod.id);
                                  setProductForm({
                                    name: prod.name,
                                    slug: prod.slug,
                                    description: prod.description || '',
                                    price: prod.price,
                                    category_id: prod.category_id || '',
                                    images: prod.images?.length > 0 ? prod.images : [''],
                                    in_stock: prod.in_stock
                                  });
                                  setShowProductModal(true);
                                }}
                                className="p-1.5 text-muted hover:text-dark border border-border rounded hover:bg-bg cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleProductDelete(prod.id)}
                                className="p-1.5 text-muted hover:text-primary border border-border rounded hover:bg-bg cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-muted">
                            No products matching search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                D. TAB: CATEGORIES
               ========================================================================= */}
            {activeTab === 'categories' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-dark">Manage Categories</h1>
                    <p className="text-sm text-muted">Define parent navigation folders for vehicle accessories.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingId(null);
                      setCategoryForm({ name: '', slug: '', image_url: '' });
                      setShowCategoryModal(true);
                    }}
                    className="flex items-center space-x-1.5 bg-primary text-white font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-primary/95 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-bg text-muted border-b border-border/60 font-semibold text-xs uppercase tracking-wider">
                        <th className="p-4">Visual Image</th>
                        <th className="p-4">Category Name</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-bg/25">
                          <td className="p-4">
                            <div className="relative h-10 w-10 bg-bg border border-border/40 rounded overflow-hidden">
                              <img src={cat.image_url || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=100'} alt="" className="object-cover h-full w-full" />
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-dark">{cat.name}</td>
                          <td className="p-4 font-mono text-xs text-muted">{cat.slug}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingId(cat.id);
                                  setCategoryForm({ name: cat.name, slug: cat.slug, image_url: cat.image_url || '' });
                                  setShowCategoryModal(true);
                                }}
                                className="p-1.5 text-muted hover:text-dark border border-border rounded hover:bg-bg cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleCategoryDelete(cat.id)}
                                className="p-1.5 text-muted hover:text-primary border border-border rounded hover:bg-bg cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                E. TAB: COUPONS
               ========================================================================= */}
            {activeTab === 'coupons' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-dark">Discount Coupons</h1>
                    <p className="text-sm text-muted">Manage promotional codes applied during cart checkout.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingId(null);
                      setCouponForm({ code: '', discount_type: 'percent', discount_value: 0, is_active: true });
                      setShowCouponModal(true);
                    }}
                    className="flex items-center space-x-1.5 bg-primary text-white font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-primary/95 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Coupon</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-bg text-muted border-b border-border/60 font-semibold text-xs uppercase tracking-wider">
                        <th className="p-4">Coupon Code</th>
                        <th className="p-4">Discount Type</th>
                        <th className="p-4">Value</th>
                        <th className="p-4 text-center">Active Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {coupons.map(coup => (
                        <tr key={coup.id} className="hover:bg-bg/25">
                          <td className="p-4 font-mono font-bold text-dark text-sm">{coup.code}</td>
                          <td className="p-4 text-muted capitalize">{coup.discount_type === 'percent' ? 'Percentage' : 'Flat Off'}</td>
                          <td className="p-4 font-semibold text-dark">
                            {coup.discount_type === 'percent' ? `${coup.discount_value}%` : formatCurrency(coup.discount_value)}
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => toggleCouponActive(coup.id, coup.is_active)}
                              className="text-primary hover:scale-105 transition-transform inline-block cursor-pointer focus:outline-none"
                            >
                              {coup.is_active ? (
                                <ToggleRight className="h-7 w-7 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="h-7 w-7 text-muted" />
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingId(coup.id);
                                  setCouponForm({
                                    code: coup.code,
                                    discount_type: coup.discount_type as 'percent' | 'flat',
                                    discount_value: coup.discount_value,
                                    is_active: coup.is_active
                                  });
                                  setShowCouponModal(true);
                                }}
                                className="p-1.5 text-muted hover:text-dark border border-border rounded hover:bg-bg cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleCouponDelete(coup.id)}
                                className="p-1.5 text-muted hover:text-primary border border-border rounded hover:bg-bg cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                F. TAB: ORDERS
               ========================================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-display text-2xl font-bold text-dark">Logged Orders</h1>
                  <p className="text-sm text-muted">Read-only logging of user checkout submissions.</p>
                </div>

                {/* Search */}
                <div className="flex items-center bg-white p-4 rounded-xl border border-border/60 shadow-sm">
                  <div className="relative flex-grow max-w-md">
                    <input 
                      type="text" 
                      placeholder="Search orders by customer name or phone..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                  </div>
                </div>

                {/* Orders Log list */}
                <div className="space-y-4">
                  {filteredOrders.map(ord => {
                    const dateStr = new Date(ord.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    const isExpanded = expandedOrder === ord.id;
                    const orderItems = ord.items || [];

                    return (
                      <div key={ord.id} className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                        {/* Summary Header */}
                        <div 
                          onClick={() => setExpandedOrder(isExpanded ? null : ord.id)}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-bg/20 transition-colors"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-dark">{ord.customer_name}</span>
                              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded uppercase">Logged</span>
                            </div>
                            <p className="text-xs text-muted mt-1">Logged on: {dateStr}</p>
                          </div>
                          
                          <div className="flex items-center space-x-6 justify-between w-full sm:w-auto shrink-0">
                            <div>
                              <span className="text-xs text-muted block text-right">Invoice Total</span>
                              <span className="font-bold text-primary text-base font-display block text-right">{formatCurrency(ord.total_amount)}</span>
                            </div>
                            <div className="p-1 rounded bg-bg text-muted border border-border/50">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Detailed expansion items list */}
                        {isExpanded && (
                          <div className="border-t border-border bg-bg/15 p-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                              <div>
                                <span className="text-xs text-muted uppercase font-bold tracking-wider">Contact Info</span>
                                <div className="mt-1.5 space-y-0.5 text-dark font-medium">
                                  <div>Phone: {ord.customer_phone}</div>
                                  <div>Email: {ord.customer_email}</div>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-muted uppercase font-bold tracking-wider">Coupon Code</span>
                                <div className="mt-1.5 text-dark font-mono font-semibold">
                                  {ord.coupon_code || 'None'}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-muted uppercase font-bold tracking-wider">WhatsApp Status</span>
                                <div className="mt-1.5 text-emerald-600 font-semibold flex items-center space-x-1">
                                  <span>âœ“ Triggered</span>
                                </div>
                              </div>
                            </div>

                            {/* Itemized Grid list */}
                            <div className="border border-border/60 rounded-lg bg-white overflow-hidden">
                              <div className="p-3 bg-bg/50 border-b border-border text-xs font-bold text-muted uppercase tracking-wider grid grid-cols-12">
                                <span className="col-span-8">Product Upgrade</span>
                                <span className="col-span-2 text-center">Qty</span>
                                <span className="col-span-2 text-right">Price</span>
                              </div>
                              <div className="divide-y divide-border/40 text-xs">
                                {orderItems.map((item: any, idx: number) => (
                                  <div key={idx} className="p-3 grid grid-cols-12 text-dark font-medium">
                                    <span className="col-span-8 truncate pr-4">{item.name}</span>
                                    <span className="col-span-2 text-center font-bold">{item.qty}</span>
                                    <span className="col-span-2 text-right font-bold">{formatCurrency(item.price)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-border/60 text-muted">
                      No order logs match search criteria.
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* =========================================================================
                G. TAB: ANNOUNCEMENTS
               ========================================================================= */}
            {activeTab === 'announcements' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-dark">Announcement Bar</h1>
                    <p className="text-sm text-muted">Manage scrolling messages shown at the top of the website. Add as many as you want.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingAnnouncementId(null);
                      setAnnouncementForm({ message: '', sort_order: announcements.length, is_active: true });
                      setShowAnnouncementModal(true);
                    }}
                    className="flex items-center space-x-1.5 bg-primary text-white font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-primary/95 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Message</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-bg text-muted border-b border-border/60 font-semibold text-xs uppercase tracking-wider">
                        <th className="p-4">Order</th>
                        <th className="p-4">Message</th>
                        <th className="p-4 text-center">Active</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {announcements.map(ann => (
                        <tr key={ann.id} className="hover:bg-bg/25">
                          <td className="p-4 text-muted font-mono text-xs">{ann.sort_order}</td>
                          <td className="p-4 font-medium text-dark">{ann.message}</td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={async () => {
                                const newVal = !ann.is_active;
                                setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, is_active: newVal } : a));
                                await supabase.from('announcements').update({ is_active: newVal }).eq('id', ann.id);
                              }}
                              className="cursor-pointer focus:outline-none"
                            >
                              {ann.is_active ? (
                                <ToggleRight className="h-7 w-7 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="h-7 w-7 text-muted" />
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingAnnouncementId(ann.id);
                                  setAnnouncementForm({ message: ann.message, sort_order: ann.sort_order, is_active: ann.is_active });
                                  setShowAnnouncementModal(true);
                                }}
                                className="p-1.5 text-muted hover:text-dark border border-border rounded hover:bg-bg cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (!confirm('Delete this announcement?')) return;
                                  await supabase.from('announcements').delete().eq('id', ann.id);
                                  loadAllData();
                                }}
                                className="p-1.5 text-muted hover:text-primary border border-border rounded hover:bg-bg cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {announcements.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-muted">
                            No announcements yet. Add your first scrolling message.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                  <p className="font-semibold">ðŸ’¡ How it works</p>
                  <p className="text-xs text-amber-700 mt-1">All active messages scroll horizontally in the gold bar at the top of your website. Add offers, delivery info, or any short message. They appear in the order you set.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: ANNOUNCEMENT ADD/EDIT
         ========================================================================= */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border">
            <div className="p-5 border-b border-border flex justify-between items-center bg-bg/40">
              <h3 className="font-display font-bold text-dark text-base">{editingAnnouncementId ? 'Edit Announcement' : 'Add Announcement'}</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-muted hover:text-dark cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = {
                    message: announcementForm.message.trim(),
                    sort_order: Number(announcementForm.sort_order),
                    is_active: announcementForm.is_active,
                  };
                  if (editingAnnouncementId) {
                    const { error } = await supabase.from('announcements').update(payload).eq('id', editingAnnouncementId);
                    if (error) throw error;
                  } else {
                    const { error } = await supabase.from('announcements').insert(payload);
                    if (error) throw error;
                  }
                  setShowAnnouncementModal(false);
                  setEditingAnnouncementId(null);
                  setAnnouncementForm({ message: '', sort_order: 0, is_active: true });
                  loadAllData();
                } catch (err: any) {
                  alert(`Failed: ${err.message}`);
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Message Text</label>
                <input 
                  type="text"
                  value={announcementForm.message}
                  onChange={e => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="e.g. Free delivery on orders above â‚¹499"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Sort Order (lower = first)</label>
                <input 
                  type="number"
                  value={announcementForm.sort_order}
                  onChange={e => setAnnouncementForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox"
                  id="ann_active"
                  checked={announcementForm.is_active}
                  onChange={e => setAnnouncementForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="ann_active" className="text-sm font-semibold text-dark cursor-pointer">Active</label>
              </div>
              <div className="pt-4 border-t border-border flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-muted hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 cursor-pointer"
                >
                  {editingAnnouncementId ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CATEGORIES ADD/EDIT FORM
         ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border">
            <div className="p-5 border-b border-border flex justify-between items-center bg-bg/40">
              <h3 className="font-display font-bold text-dark text-base">{editingId ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-muted hover:text-dark cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Category Name</label>
                <input 
                  type="text"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="e.g. Car Styling"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Slug (Auto-Generated)</label>
                <input 
                  type="text"
                  value={categoryForm.slug}
                  onChange={e => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="car-styling"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Image URL</label>
                <input 
                  type="text"
                  value={categoryForm.image_url}
                  onChange={e => setCategoryForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                />
              </div>
              <div className="pt-4 border-t border-border flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-muted hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 cursor-pointer"
                >
                  {editingId ? 'Save Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: COUPONS ADD/EDIT FORM
         ========================================================================= */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border">
            <div className="p-5 border-b border-border flex justify-between items-center bg-bg/40">
              <h3 className="font-display font-bold text-dark text-base">{editingId ? 'Edit Coupon' : 'Add New Coupon'}</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-muted hover:text-dark cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCouponSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Code</label>
                <input 
                  type="text"
                  value={couponForm.code}
                  onChange={e => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. DECOR50"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none uppercase font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Discount Type</label>
                <select
                  value={couponForm.discount_type}
                  onChange={e => setCouponForm(prev => ({ ...prev, discount_type: e.target.value as 'percent' | 'flat' }))}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                >
                  <option value="percent">Percentage Off (%)</option>
                  <option value="flat">Flat Amount Off (â‚¹)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Discount Value</label>
                <input 
                  type="number"
                  value={couponForm.discount_value || ''}
                  onChange={e => setCouponForm(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                  placeholder="e.g. 10 or 150"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox"
                  id="is_active"
                  checked={couponForm.is_active}
                  onChange={e => setCouponForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-dark cursor-pointer">Active Coupon</label>
              </div>
              <div className="pt-4 border-t border-border flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-muted hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 cursor-pointer"
                >
                  {editingId ? 'Save Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PRODUCTS ADD/EDIT FORM
         ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 border border-border">
            <div className="p-5 border-b border-border flex justify-between items-center bg-bg/40">
              <h3 className="font-display font-bold text-dark text-base">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-muted hover:text-dark cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider block">Product Name</label>
                  <input 
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value, slug: slugify(e.target.value) }))}
                    placeholder="e.g. Leather Steering Cover"
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider block">Slug (Auto-Generated)</label>
                  <input 
                    type="text"
                    value={productForm.slug}
                    onChange={e => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="leather-steering-cover"
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider block">Price (â‚¹)</label>
                  <input 
                    type="number"
                    value={productForm.price || ''}
                    onChange={e => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="e.g. 899"
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider block">Category</label>
                  <select
                    value={productForm.category_id}
                    onChange={e => setProductForm(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark uppercase tracking-wider block">Description</label>
                <textarea 
                  rows={3}
                  value={productForm.description}
                  onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide product utility, styling aspects, vehicle compatibility details..."
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider block">Product Images URLs</label>
                  <button 
                    type="button" 
                    onClick={addImageRow}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Add Image Link Row
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {productForm.images.map((img, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text"
                        value={img}
                        onChange={e => handleImageChange(idx, e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-grow bg-bg border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none"
                      />
                      {productForm.images.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeImageRow(idx)}
                          className="p-2 border border-border rounded hover:bg-bg text-muted hover:text-primary cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox"
                  id="in_stock"
                  checked={productForm.in_stock}
                  onChange={e => setProductForm(prev => ({ ...prev, in_stock: e.target.checked }))}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="in_stock" className="text-sm font-semibold text-dark cursor-pointer">Product in stock</label>
              </div>

              <div className="pt-4 border-t border-border flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-muted hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 cursor-pointer"
                >
                  {editingId ? 'Save Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

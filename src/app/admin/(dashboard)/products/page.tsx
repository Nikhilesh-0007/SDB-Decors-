'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Loader2, ArrowLeft, Image as ImageIcon, Check, X, Search } from 'lucide-react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '@/lib/actions';
import { formatCurrency, slugify } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Panel Toggle & State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrlInputs, setImageUrlInputs] = useState<string[]>(['']);
  const [stock, setStock] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const prodData = await getProducts();
      const catData = await getCategories();
      setProducts(prodData);
      setCategories(catData);
      if (catData.length > 0) {
        setCategoryId(catData[0].id);
      }
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(slugify(val));
    }
  };

  // Dynamic Image URL Inputs
  const handleAddImageField = () => {
    setImageUrlInputs([...imageUrlInputs, '']);
  };

  const handleRemoveImageField = (idx: number) => {
    const nextFields = imageUrlInputs.filter((_, i) => i !== idx);
    setImageUrlInputs(nextFields.length > 0 ? nextFields : ['']);
  };

  const handleImageFieldChange = (idx: number, val: string) => {
    const nextFields = [...imageUrlInputs];
    nextFields[idx] = val;
    setImageUrlInputs(nextFields);
  };

  // Reset Form
  const openNewForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setPrice(0);
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    setImageUrlInputs(['']);
    setStock(0);
    setIsFeatured(false);
    setIsOutOfStock(false);
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const openEditForm = (prod: any) => {
    setEditingId(prod.id);
    setName(prod.name);
    setSlug(prod.slug);
    setDescription(prod.description || '');
    setPrice(Number(prod.price));
    setCategoryId(prod.category_id || '');
    setImageUrlInputs(prod.images && prod.images.length > 0 ? prod.images : ['']);
    setStock(prod.stock || 0);
    setIsFeatured(prod.is_featured || false);
    setIsOutOfStock(prod.is_out_of_stock || false);
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setPrice(0);
    setImageUrlInputs(['']);
    setStock(0);
    setIsFeatured(false);
    setIsOutOfStock(false);
    setErrorMsg('');
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!name.trim() || !slug.trim()) {
      setErrorMsg('Product name and slug are required.');
      return;
    }
    if (price < 0) {
      setErrorMsg('Price must be greater than or equal to 0.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a product category.');
      return;
    }

    // Filter out empty image strings
    const filteredImages = imageUrlInputs.filter((url) => url.trim() !== '');

    setIsMutating(true);
    try {
      const payload = {
        name,
        slug,
        description,
        price,
        category_id: categoryId,
        images: filteredImages,
        stock,
        is_featured: isFeatured,
        is_out_of_stock: isOutOfStock || stock <= 0, // Auto-mark out of stock if stock is 0
      };

      if (editingId) {
        // Update
        const result = await updateProduct(editingId, payload);
        if (result.success) {
          setSuccessMsg('Product updated successfully!');
          setTimeout(() => {
            closeForm();
            loadData();
          }, 1000);
        } else {
          setErrorMsg(result.error || 'Failed to update product.');
        }
      } else {
        // Create
        const result = await createProduct(payload);
        if (result.success) {
          setSuccessMsg('Product created successfully!');
          setTimeout(() => {
            closeForm();
            loadData();
          }, 1000);
        } else {
          setErrorMsg(result.error || 'Failed to create product.');
        }
      }
    } catch (err) {
      setErrorMsg('An error occurred during submission.');
    } finally {
      setIsMutating(false);
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsMutating(true);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.error || 'Failed to delete product.');
      }
    } catch (err) {
      alert('An error occurred while deleting.');
    } finally {
      setIsMutating(false);
    }
  };

  // Toggle Out of Stock directly from the table
  const handleToggleOutOfStock = async (prod: any) => {
    setIsMutating(true);
    try {
      const payload = {
        name: prod.name,
        slug: prod.slug,
        description: prod.description || '',
        price: Number(prod.price),
        category_id: prod.category_id,
        images: prod.images || [],
        stock: prod.is_out_of_stock ? Math.max(1, prod.stock) : 0, // Set stock to 1 if enabling, 0 if disabling
        is_featured: prod.is_featured,
        is_out_of_stock: !prod.is_out_of_stock,
      };

      const result = await updateProduct(prod.id, payload);
      if (result.success) {
        await loadData();
      } else {
        alert(result.error || 'Failed to update stock status.');
      }
    } catch (err) {
      alert('An error occurred while updating status.');
    } finally {
      setIsMutating(false);
    }
  };

  // Search filter
  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* 1. HEADER & VIEW SWITCHER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Manage Products</h1>
          <p className="text-xs text-foreground/50 mt-1 font-light">Add, edit, inventory track, and manage your decor items.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={openNewForm}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent transition-colors shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Product
          </button>
        )}
      </div>

      {/* 2. FORM INTERFACE (IF OPENED) */}
      {isFormOpen ? (
        <div className="bg-card rounded-3xl border border-border/40 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <button
              onClick={closeForm}
              className="inline-flex items-center text-xs font-semibold text-foreground/50 hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products List
            </button>
            <h3 className="font-display text-base font-bold text-primary">
              {editingId ? 'Edit Product Details' : 'Create New Catalog Item'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-xs font-semibold text-destructive">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs font-semibold text-emerald-700">
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sven Velvet Sofa"
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors"
                  disabled={isMutating}
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="e.g. sven-velvet-sofa"
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors"
                  disabled={isMutating}
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="e.g. 999.00"
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors"
                  disabled={isMutating}
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors cursor-pointer"
                  disabled={isMutating}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Stock Quantity</label>
                <input
                  type="number"
                  value={stock || ''}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="e.g. 10"
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors"
                  disabled={isMutating}
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center space-x-8 pt-4">
                {/* Featured Toggle */}
                <label className="flex items-center space-x-2 text-xs text-primary font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 border-border text-accent focus:ring-accent rounded cursor-pointer"
                  />
                  <span>Featured Catalog Item</span>
                </label>

                {/* Availability Toggle */}
                <label className="flex items-center space-x-2 text-xs text-primary font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOutOfStock}
                    onChange={(e) => setIsOutOfStock(e.target.checked)}
                    className="h-4 w-4 border-border text-accent focus:ring-accent rounded cursor-pointer"
                  />
                  <span>Mark Out of Stock</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Product Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product sizing, materials, craftsmanship details..."
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors resize-none"
                disabled={isMutating}
              />
            </div>

            {/* Image URLs Dynamic List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Image URLs</label>
                <button
                  type="button"
                  onClick={handleAddImageField}
                  className="inline-flex items-center text-[10px] font-bold uppercase text-accent hover:underline"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Image URL
                </button>
              </div>
              <div className="space-y-2.5">
                {imageUrlInputs.map((val, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleImageFieldChange(idx, e.target.value)}
                      placeholder="https://images.unsplash.com/... or Supabase storage link"
                      className="flex-grow bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary transition-colors"
                      disabled={isMutating}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageField(idx)}
                      className="p-2.5 text-foreground/45 hover:text-destructive rounded-xl hover:bg-secondary/35 transition-colors"
                      title="Remove field"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/40 justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={isMutating}
                className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-transparent px-5 py-3 text-xs font-semibold text-primary hover:bg-secondary/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isMutating}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingId ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* 3. PRODUCTS LIST TABLE */
        <div className="bg-card rounded-3xl border border-border/40 p-6 shadow-xs space-y-6">
          {/* Table Toolbar (Search) */}
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary/20 border border-border/60 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/45 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-foreground/40" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-foreground/45 border-b border-border/40 text-[10px] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Inventory</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredProducts.map((prod) => {
                    const mainImage = prod.images?.[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=80';
                    return (
                      <tr key={prod.id} className="hover:bg-secondary/10 group transition-colors">
                        {/* Image & Title */}
                        <td className="py-4 pl-2">
                          <div className="flex items-center space-x-3">
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-border/20 shrink-0 bg-muted">
                              <Image src={mainImage} alt={prod.name} fill sizes="40px" className="object-cover" />
                            </div>
                            <div>
                              <span className="font-semibold text-primary block leading-tight">{prod.name}</span>
                              {prod.is_featured && (
                                <span className="inline-block text-[9px] font-bold text-accent uppercase tracking-wider mt-0.5">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Category */}
                        <td className="py-4 text-xs font-semibold text-foreground/75 uppercase tracking-wider">
                          {prod.categories?.name || 'Unassigned'}
                        </td>
                        {/* Price */}
                        <td className="py-4 font-semibold text-primary font-display">
                          {formatCurrency(Number(prod.price))}
                        </td>
                        {/* Stock */}
                        <td className="py-4 text-xs font-light text-foreground/70">
                          {prod.stock} items
                        </td>
                        {/* Out of Stock Toggle */}
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleOutOfStock(prod)}
                            disabled={isMutating}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase shadow-xs transition-colors cursor-pointer border ${
                              prod.is_out_of_stock || prod.stock <= 0
                                ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                            }`}
                          >
                            {prod.is_out_of_stock || prod.stock <= 0 ? 'Out of Stock' : 'In Stock'}
                          </button>
                        </td>
                        {/* Actions */}
                        <td className="py-4 pr-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditForm(prod)}
                              className="p-1.5 text-foreground/45 hover:text-accent rounded-lg hover:bg-secondary/35 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id)}
                              className="p-1.5 text-foreground/45 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                              title="Delete Product"
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
              <span className="text-3xl">🏺</span>
              <p className="text-sm font-semibold text-primary">No products found</p>
              <p className="text-xs text-foreground/45 font-light">Add decor products to populate your catalog browse list.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

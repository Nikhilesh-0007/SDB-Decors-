'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, FolderPlus, Check, X } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/actions';
import { slugify } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Name Change to Auto-generate Slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(slugify(val));
    }
  };

  // Clear Form
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setErrorMsg('');
  };

  // Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !slug.trim()) {
      setErrorMsg('Name and slug are required fields.');
      return;
    }

    setIsMutating(true);
    try {
      if (editingId) {
        // Update
        const result = await updateCategory(editingId, name, slug);
        if (result.success) {
          setSuccessMsg('Category updated successfully!');
          resetForm();
          await fetchCategories();
        } else {
          setErrorMsg(result.error || 'Failed to update category.');
        }
      } else {
        // Create
        const result = await createCategory(name, slug);
        if (result.success) {
          setSuccessMsg('Category created successfully!');
          resetForm();
          await fetchCategories();
        } else {
          setErrorMsg(result.error || 'Failed to create category.');
        }
      }
    } catch (err) {
      setErrorMsg('An error occurred during submission.');
    } finally {
      setIsMutating(false);
    }
  };

  // Handle Edit Action
  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Handle Delete Action
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will remain, but their category reference will be removed.')) {
      return;
    }

    setIsMutating(true);
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        setSuccessMsg('Category deleted successfully!');
        if (editingId === id) resetForm();
        await fetchCategories();
      } else {
        alert(result.error || 'Failed to delete category.');
      }
    } catch (err) {
      alert('An error occurred while deleting.');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Manage Categories</h1>
        <p className="text-xs text-foreground/50 mt-1 font-light">
          Organize your shop catalog by adding, editing, or deleting product categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            1. CATEGORY FORM (Left Column - 4 Cols)
           ========================================================================= */}
        <div className="lg:col-span-4 bg-card rounded-2xl border border-border/40 p-6 shadow-xs space-y-6">
          <h3 className="font-display text-base font-bold text-primary flex items-center">
            <FolderPlus className="mr-2 h-5 w-5 text-accent stroke-[1.5]" />
            {editingId ? 'Edit Category' : 'Add New Category'}
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

            {/* Category Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Designer Seating"
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/45 transition-colors"
                disabled={isMutating}
              />
            </div>

            {/* Category Slug */}
            <div className="space-y-1">
              <label htmlFor="slug" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="e.g. designer-seating"
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-primary placeholder-foreground/45 transition-colors"
                disabled={isMutating}
              />
            </div>

            {/* Submit Controls */}
            <div className="flex gap-2 pt-2">
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
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Category
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
            2. CATEGORIES TABLE LIST (Right Column - 8 Cols)
           ========================================================================= */}
        <div className="lg:col-span-8 bg-card rounded-2xl border border-border/40 p-6 shadow-xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-foreground/45 border-b border-border/40 text-[10px] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Category Name</th>
                    <th className="pb-3">Slug / Routing</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-secondary/10 group transition-colors">
                      {/* Name */}
                      <td className="py-4 pl-2 font-semibold text-primary">
                        {cat.name}
                      </td>
                      {/* Slug */}
                      <td className="py-4 font-mono text-xs text-foreground/50">
                        /products?category={cat.slug}
                      </td>
                      {/* Actions */}
                      <td className="py-4 pr-2 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 text-foreground/45 hover:text-accent rounded-lg hover:bg-secondary/35 transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 text-foreground/45 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty list */
            <div className="text-center py-16 space-y-2">
              <span className="text-3xl">📁</span>
              <p className="text-sm font-semibold text-primary">No categories found</p>
              <p className="text-xs text-foreground/45 font-light">Create a category on the left side to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

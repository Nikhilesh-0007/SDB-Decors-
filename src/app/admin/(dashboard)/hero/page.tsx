'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { getHeroSettings, updateHeroSettings } from '@/lib/actions';

export default function AdminHeroSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getHeroSettings();
      setTitle(data.title || '');
      setSubtitle(data.subtitle || '');
      setButtonText(data.button_text || '');
      setImageUrl(data.image_url || '');
      setBannerUrl(data.banner_url || '');
    } catch (err) {
      console.error('Failed to load hero settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !subtitle.trim() || !buttonText.trim()) {
      setErrorMsg('Title, subtitle, and button text are required fields.');
      return;
    }

    setIsMutating(true);
    try {
      const result = await updateHeroSettings({
        title,
        subtitle,
        button_text: buttonText,
        image_url: imageUrl,
        banner_url: bannerUrl,
      });

      if (result.success) {
        setSuccessMsg('Hero settings updated successfully! Storefront updated in real-time.');
      } else {
        setErrorMsg(result.error || 'Failed to update hero settings.');
      }
    } catch (err) {
      setErrorMsg('An error occurred during submission.');
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Manage Hero Section</h1>
        <p className="text-xs text-foreground/50 mt-1 font-light">
          Customize the main entrance area of SGBdecors storefront catalog.
        </p>
      </div>

      {/* Settings Form Card */}
      <div className="bg-card rounded-3xl border border-border/40 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-1 gap-6">
            {/* Title */}
            <div className="space-y-1">
              <label htmlFor="title" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Hero Title Heading
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Curated Decor For Modern Living"
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent/80 focus:border-accent text-primary transition-colors"
                disabled={isMutating}
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label htmlFor="subtitle" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Hero Subtitle Description
              </label>
              <textarea
                id="subtitle"
                rows={3}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Discover our premium handcrafted collection of home decor and furniture..."
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-accent/80 focus:border-accent text-primary transition-colors resize-none"
                disabled={isMutating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Button Text */}
              <div className="space-y-1">
                <label htmlFor="buttonText" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                  Action Button Text
                </label>
                <input
                  type="text"
                  id="buttonText"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Explore Catalog"
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent/80 focus:border-accent text-primary transition-colors"
                  disabled={isMutating}
                />
              </div>

              {/* Main Image URL */}
              <div className="space-y-1">
                <label htmlFor="imageUrl" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                  Main Hero Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent/80 focus:border-accent text-primary transition-colors"
                  disabled={isMutating}
                />
              </div>
            </div>

            {/* Banner Image URL */}
            <div className="space-y-1">
              <label htmlFor="bannerUrl" className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Announcement Banner Image URL <span className="text-[9px] text-foreground/45 lowercase font-light">(optional)</span>
              </label>
              <input
                type="text"
                id="bannerUrl"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-secondary/20 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent/80 focus:border-accent text-primary transition-colors"
                disabled={isMutating}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex gap-2 pt-4 border-t border-border/40 justify-end">
            <button
              type="submit"
              disabled={isMutating}
              className="inline-flex items-center justify-center rounded-xl bg-primary py-3.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> Save Hero settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

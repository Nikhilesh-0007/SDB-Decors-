'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Announcement {
  id: string;
  message: string;
}

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, message')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (data && !error && data.length > 0) {
          setAnnouncements(data);
        } else {
          // Fallback defaults
          setAnnouncements([
            { id: '1', message: 'Free delivery on orders above ₹499' },
            { id: '2', message: 'WhatsApp orders welcome' },
            { id: '3', message: 'Premium quality guaranteed' },
          ]);
        }
      } catch {
        setAnnouncements([
          { id: '1', message: 'Free delivery on orders above ₹499' },
          { id: '2', message: 'WhatsApp orders welcome' },
        ]);
      }
      setLoaded(true);
    }
    fetchAnnouncements();
  }, []);

  if (!loaded) {
    return (
      <div style={{ background: '#D6A313', height: '32px' }} />
    );
  }

  // Build the scrolling text with pipe separators
  const scrollText = announcements.map(a => a.message).join('   •   ');
  // Duplicate for seamless loop
  const fullText = `${scrollText}   •   ${scrollText}   •   ${scrollText}`;

  return (
    <div
      style={{
        background: '#D6A313',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="animate-marquee"
        style={{
          display: 'inline-block',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '12px',
          color: '#101510',
          letterSpacing: '0.03em',
          paddingLeft: '100%',
        }}
      >
        {fullText}
      </div>
    </div>
  );
}

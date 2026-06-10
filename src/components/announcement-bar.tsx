'use client';

import React from 'react';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#0D1B14] text-[#C9A84C] text-xs font-semibold py-2.5 px-4 text-center tracking-widest flex items-center justify-center space-x-2 border-b border-[#C9A84C]/20">
      <span className="opacity-70">✦</span>
      <span>FREE DELIVERY ON ORDERS ABOVE ₹499 &nbsp;|&nbsp; WHATSAPP ORDERS WELCOME</span>
      <span className="opacity-70">✦</span>
    </div>
  );
}

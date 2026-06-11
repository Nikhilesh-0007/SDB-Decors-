'use client';

import React from 'react';

export default function WhatsAppFloat() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const encodedText = encodeURIComponent('Hi, I need help with an order from SDB Auto Accessories');
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedText}`;

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      <span className="absolute right-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-dark text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
        Chat with us
      </span>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-pulse flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full text-white shadow-xl hover:bg-[#20ba56] transition-colors duration-300"
        aria-label="Chat with SDB Auto Accessories on WhatsApp"
      >
        <svg
          className="w-8 h-8 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.53 1.981 14.062.956 11.43.956c-5.44 0-9.866 4.372-9.87 9.802 0 1.64.45 3.238 1.302 4.646L1.821 21.8l6.164-1.597c1.01.551 2.093.84 3.19.843h.004zm9.95-6.852c-.29-.144-1.717-.837-1.983-.933-.266-.096-.46-.144-.652.144-.192.288-.744.933-.912 1.125-.168.192-.336.216-.626.072-1.355-.678-2.29-1.228-3.196-2.77-.24-.41.24-.38.686-1.25.075-.15.038-.282-.019-.396-.056-.114-.46-1.093-.63-1.49-.166-.388-.349-.335-.48-.342-.124-.007-.267-.008-.41-.008-.143 0-.376.053-.572.267-.197.214-.752.724-.752 1.764 0 1.04.767 2.04.873 2.183.107.143 1.51 2.277 3.657 3.193.51.218.909.348 1.22.444.512.162.977.139 1.345.085.41-.06 1.717-.69 1.959-1.358.242-.668.242-1.24.17-1.358-.073-.118-.266-.192-.557-.336z" />
        </svg>
      </a>
    </div>
  );
}

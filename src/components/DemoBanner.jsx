import { useState } from 'react';
import { BookOpenCheck, X } from 'lucide-react';

export default function DemoBanner({ visible, onDismiss }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!visible) return null;

  return (
    <div className="erp-demo-banner mb-5" role="region" aria-label="Portfolio Project Overview">
      <div className="flex-1 flex items-center gap-4 px-5 py-3.5 z-10">
        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/15 border border-white/20 items-center justify-center shrink-0">
          <BookOpenCheck className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-0.5">
            Portfolio Project · School Management System
          </div>
          <h2 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
            School ERP — Principal &amp; School Data System
          </h2>
          <p className="text-xs sm:text-[13px] text-blue-50/95 mt-1 leading-relaxed max-w-3xl">
            Yeh ek portfolio project hai jo school aur principal ke liye banaya gaya hai. Yeh system
            school ka sara data save aur manage karne ke liye use hota hai — students record, mahana
            fees, teachers salary, expenses aur stock sab kuch ek hi jagah asani se handle karein.
          </p>
        </div>
      </div>

      {!imgFailed && (
        <div className="banner-image-wrap hidden md:block">
          <img
            src="/src/assets/images/school_banner_campus_1795458596042.jpg"
            alt="School Campus Building"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close banner"
        title="Close for this session"
        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/85 text-white flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

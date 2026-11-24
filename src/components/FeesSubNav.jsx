import { NavLink } from 'react-router-dom';

const FEES_TABS = [
  { to: '/fees', label: 'Overview', end: true },
  { to: '/fees/vouchers', label: 'Vouchers' },
  { to: '/fees/receipts', label: 'Receipts' },
  { to: '/fees/defaulters', label: 'Defaulters' },
];

export default function FeesSubNav() {
  return (
    <nav
      aria-label="Fees sections"
      className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-xl w-fit max-w-full"
    >
      {FEES_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-[#0066eb] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LogOut,
  MessageCircle,
  Package,
  Receipt,
  Search,
  Settings,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import DemoBanner from './DemoBanner';
import * as studentsApi from '../api/students';
import * as feesApi from '../api/fees';
import * as stockApi from '../api/stock';
import { formatMoney } from '../utils/erpLogic';

export default function Layout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [feesMenuOpen, setFeesMenuOpen] = useState(() => location.pathname.startsWith('/fees'));
  const [bannerVisible, setBannerVisible] = useState(true);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Global Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // Real notifications count from defaulters & low stock
  const [alerts, setAlerts] = useState({ defaulters: [], lowStock: [] });

  useEffect(() => {
    setProfileMenuOpen(false);
    setNotifOpen(false);
    setSearchOpen(false);
    if (location.pathname.startsWith('/fees')) {
      setFeesMenuOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    Promise.all([feesApi.getDefaulters(), stockApi.getStock()])
      .then(([defs, stk]) => {
        if (!active) return;
        setAlerts({
          defaulters: defs.slice(0, 4),
          lowStock: (stk.items || []).filter((i) => i.quantity < 5),
        });
      })
      .catch(() => {
        if (!active) return;
        setAlerts({ defaulters: [], lowStock: [] });
      });
    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const [stus, vchs] = await Promise.all([
          studentsApi.getStudents({ search: q }),
          feesApi.getVouchers({ search: q }),
        ]);
        if (cancelled) return;
        const results = [
          ...stus.slice(0, 4).map((s) => ({
            type: 'Student',
            label: s.name,
            sub: `${s.className} · ${s.fatherName}`,
            to: `/students/${s.id}`,
          })),
          ...vchs.slice(0, 3).map((v) => ({
            type: 'Voucher',
            label: `${v.voucherNo} (${v.studentName})`,
            sub: `${formatMoney(v.net)} · ${v.status}`,
            to: `/fees/vouchers/${v.id}`,
          })),
        ];
        setSearchResults(results);
      } catch {
        if (!cancelled) setSearchResults([]);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const alertCount = alerts.defaulters.length + alerts.lowStock.length;
  const schoolName = settings?.schoolName || 'ABC Public School';

  return (
    <div className="erp-shell">
      {/* Compact Left Sidebar — Always visible beside content */}
      <aside className="erp-sidebar no-print">
        <div className="erp-brand">
          <div className="brand-emblem">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="brand-text-wrap min-w-0 flex-1">
            <div className="brand-title truncate">School ERP</div>
            <div className="brand-sub truncate">School Management</div>
          </div>
        </div>

        <nav className="erp-nav" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            title="Dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="truncate">Dashboard</span>
            </span>
          </NavLink>

          <NavLink
            to="/students"
            title="Students"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Students</span>
            </span>
          </NavLink>

          <NavLink
            to="/classes"
            title="Classes"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <Layers className="w-4 h-4 shrink-0" />
              <span className="truncate">Classes</span>
            </span>
          </NavLink>

          {/* Expandable Fees Menu */}
          <div>
            <button
              type="button"
              title="Fees"
              onClick={() => {
                setFeesMenuOpen((p) => !p);
                if (!location.pathname.startsWith('/fees')) {
                  navigate('/fees');
                }
              }}
              aria-expanded={feesMenuOpen}
              className={`nav-item ${location.pathname === '/fees' ? 'is-active' : ''}`}
            >
              <span className="nav-item-main">
                <CircleDollarSign className="w-4 h-4 shrink-0" />
                <span className="truncate">Fees</span>
              </span>
              <span className="nav-chevron">
                {feesMenuOpen ? (
                  <ChevronDown className="w-4 h-4 opacity-80" />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-80" />
                )}
              </span>
            </button>

            {feesMenuOpen && (
              <div className="nav-sublist">
                <NavLink
                  to="/fees"
                  end
                  className={({ isActive }) => `nav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span>Overview</span>
                </NavLink>
                <NavLink
                  to="/fees/vouchers"
                  className={({ isActive }) => `nav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span>Vouchers</span>
                </NavLink>
                <NavLink
                  to="/fees/receipts"
                  className={({ isActive }) => `nav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span>Receipts</span>
                </NavLink>
                <NavLink
                  to="/fees/defaulters"
                  className={({ isActive }) => `nav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span>Defaulters</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/teachers"
            title="Teachers"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span className="truncate">Teachers</span>
            </span>
          </NavLink>

          <NavLink
            to="/salary"
            title="Salary"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <Wallet className="w-4 h-4 shrink-0" />
              <span className="truncate">Salary</span>
            </span>
          </NavLink>

          <NavLink
            to="/expenses"
            title="Expenses"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <Receipt className="w-4 h-4 shrink-0" />
              <span className="truncate">Expenses</span>
            </span>
          </NavLink>

          <NavLink
            to="/stock"
            title="Stock"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <Package className="w-4 h-4 shrink-0" />
              <span className="truncate">Stock</span>
            </span>
          </NavLink>

          <NavLink
            to="/whatsapp"
            title="WhatsApp Reminders"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">WhatsApp</span>
            </span>
          </NavLink>

          <NavLink
            to="/settings"
            title="Settings"
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-item-main">
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">Settings</span>
            </span>
          </NavLink>
        </nav>

        <div className="erp-sidebar-footer">
          <NavLink
            to="/profile"
            title="Profile"
            className={({ isActive }) => `footer-link ${isActive ? 'is-active' : ''}`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="footer-link is-danger text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>

          <div className="sidebar-promo-card">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-[11px] text-white leading-snug">
                Smart School, Better Future
              </div>
              <div className="text-[10px] text-blue-100/90 mt-0.5">
                Manage · Grow · Excel
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Vertical flow only, zero horizontal scroll) */}
      <div className="erp-main">
        {/* Top Header */}
        <header className="erp-header no-print">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search students, vouchers, family no..."
                aria-label="Search students or vouchers"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100/80 border border-slate-200/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />

              {searchOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-11 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-500">No records found.</div>
                  ) : (
                    searchResults.map((res, idx) => (
                      <button
                        key={`${res.to}_${idx}`}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          navigate(res.to);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{res.label}</div>
                          <div className="text-xs text-slate-500 truncate">{res.sub}</div>
                        </div>
                        <span className="text-[11px] font-medium text-blue-700 shrink-0">
                          {res.type}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden xl:inline text-sm font-medium text-slate-600 whitespace-nowrap">
              Welcome, <strong className="text-slate-900">{user?.name || 'Principal'}</strong>
            </span>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setProfileMenuOpen(false);
                }}
                aria-label="Notifications"
                className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {alertCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-display font-bold text-sm text-slate-900">Alerts & Reminders</span>
                    <span className="text-xs text-slate-500 tabular-nums">{alertCount} items</span>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {alerts.defaulters.map((d) => (
                      <button
                        key={d.studentId}
                        type="button"
                        onClick={() => navigate('/fees/defaulters')}
                        className="text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer"
                      >
                        <div className="text-xs font-semibold text-slate-900">
                          Fee Pending: {d.studentName} ({d.className})
                        </div>
                        <div className="text-[11px] text-red-600 tabular-nums mt-0.5">
                          Pending: {formatMoney(d.totalDue)}
                        </div>
                      </button>
                    ))}
                    {alerts.lowStock.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => navigate('/stock')}
                        className="text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer"
                      >
                        <div className="text-xs font-semibold text-slate-900">
                          Low Stock: {s.name}
                        </div>
                        <div className="text-[11px] text-amber-600 tabular-nums mt-0.5">
                          Only {s.quantity} left
                        </div>
                      </button>
                    ))}
                    {alertCount === 0 && (
                      <div className="text-xs text-slate-500 py-3 text-center">All caught up!</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen((p) => !p);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {!avatarFailed ? (
                  <img
                    src="/src/assets/images/principal_avatar_1795458597869.jpg"
                    alt={user?.name || 'Principal'}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {(user?.name || 'P').charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-slate-900 leading-tight whitespace-nowrap">
                    {user?.name || 'Principal'}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight whitespace-nowrap max-w-[140px] truncate">
                    {schoolName}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 max-w-[1440px] w-full mx-auto">
          <DemoBanner visible={bannerVisible} onDismiss={() => setBannerVisible(false)} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

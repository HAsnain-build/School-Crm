import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FilePlus2,
  GraduationCap,
  MessageCircle,
  Package,
  Phone,
  Receipt,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import * as dashboardApi from '../api/dashboard';
import * as feesApi from '../api/fees';
import { FeeDonutChart, StudentsBarChart } from '../components/Charts';
import { useToast } from '../context/ToastContext';
import { formatDisplayDate, formatMoney, formatMonthLabel, formatPhoneForWhatsapp } from '../utils/erpLogic';

const MONTHS = ['2026-11', '2026-10', '2026-09'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [month, setMonth] = useState('2026-11');
  const [summary, setSummary] = useState(null);
  const [classCounts, setClassCounts] = useState([]);
  const [recent, setRecent] = useState({ recentReceipts: [], recentExpenses: [], topDefaulters: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadDashboard = async (selectedMonth) => {
    setLoading(true);
    try {
      const [sum, cls, rec] = await Promise.all([
        dashboardApi.getDashboardSummary(selectedMonth),
        dashboardApi.getClassCounts(),
        dashboardApi.getDashboardRecent(selectedMonth),
      ]);
      setSummary(sum);
      setClassCounts(cls);
      setRecent(rec);
    } catch (err) {
      addToast(err?.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(month);
  }, [month]);

  const handleQuickGenerateVouchers = async () => {
    setGenerating(true);
    try {
      const res = await feesApi.generateVouchers(month);
      addToast(
        res.createdCount > 0
          ? `${res.createdCount} new vouchers generated (${formatMonthLabel(month)})`
          : `All vouchers for ${formatMonthLabel(month)} are already generated`
      );
      loadDashboard(month);
    } catch (err) {
      addToast(err?.message || 'Failed to generate vouchers', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const kpiCards = summary
    ? [
        {
          title: 'Total Students',
          sub: 'All Students',
          value: summary.totalStudents.toLocaleString('en-PK'),
          icon: Users,
          iconBg: 'bg-blue-100 text-blue-600',
          to: '/students',
        },
        {
          title: 'Active Students',
          sub: 'Currently Active',
          value: summary.activeStudents.toLocaleString('en-PK'),
          icon: UserCheck,
          iconBg: 'bg-emerald-100 text-emerald-600',
          to: '/students?status=active',
        },
        {
          title: 'Inactive Students',
          sub: 'Left / Inactive',
          value: summary.inactiveStudents.toLocaleString('en-PK'),
          icon: UserMinus,
          iconBg: 'bg-red-100 text-red-600',
          to: '/students?status=inactive',
        },
        {
          title: 'Fee Collected',
          sub: 'Received',
          value: formatMoney(summary.feeCollected),
          icon: Banknote,
          iconBg: 'bg-emerald-100 text-emerald-600',
          to: '/fees',
        },
        {
          title: 'Fee Pending',
          sub: 'Due Balance',
          value: formatMoney(summary.feePending),
          icon: Wallet,
          iconBg: 'bg-amber-100 text-amber-600',
          to: '/fees/defaulters',
        },
        {
          title: 'Salaries Paid',
          sub: `${summary.salariesPaidCount} Teachers`,
          value: formatMoney(summary.salariesPaidAmount),
          icon: GraduationCap,
          iconBg: 'bg-indigo-100 text-indigo-600',
          to: '/salary',
        },
        {
          title: 'Salaries Pending',
          sub: `${summary.salariesPendingCount} Teachers`,
          value: formatMoney(summary.salariesPendingAmount),
          icon: CircleDollarSign,
          iconBg: 'bg-teal-100 text-teal-600',
          to: '/salary',
        },
        {
          title: "This Month's Expenses",
          sub: 'Monthly Total',
          value: formatMoney(summary.totalExpenses),
          icon: Receipt,
          iconBg: 'bg-violet-100 text-violet-600',
          to: '/expenses',
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Page Title & Month Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Principal Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete overview of school students, fees, salaries, and expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="dashboard-month" className="text-xs font-semibold text-slate-600">
            Month:
          </label>
          <select
            id="dashboard-month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-600"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 8 KPI Cards (2 rows of 4) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="kpi-card animate-pulse h-[82px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => navigate(card.to)}
                className="kpi-card"
              >
                <div className={`kpi-icon-circle ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-500 truncate">{card.title}</div>
                  <div className="kpi-value mt-0.5 truncate">{card.value}</div>
                  <div className="text-[11px] font-medium text-slate-400 mt-0.5">{card.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Middle 3-Column Row: Students by Class Bar Chart + Fee Collection Donut + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <section className="erp-card xl:col-span-5">
          <div className="erp-card-header">
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <BarChart3 className="w-4 h-4 text-blue-300" />
              <span>Students by Class</span>
            </div>
            <Link
              to="/classes"
              className="text-xs font-medium text-blue-200 hover:text-white flex items-center gap-1 whitespace-nowrap"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4">
            <StudentsBarChart
              data={classCounts}
              onBarClick={(cls) => navigate(`/classes/${cls.id}`)}
            />
          </div>
        </section>

        <section className="erp-card xl:col-span-4">
          <div className="erp-card-header">
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <CreditCard className="w-4 h-4 text-blue-300" />
              <span>Fee Collection</span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-center min-h-[210px]">
            <FeeDonutChart
              collected={summary?.feeCollected || 0}
              pending={summary?.feePending || 0}
            />
          </div>
        </section>

        <section className="erp-card xl:col-span-3">
          <div className="erp-card-header">
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Quick Actions</span>
            </div>
          </div>
          <div className="p-3.5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/students/new')}
              className="quick-action-tile bg-blue-50 text-blue-800 border-blue-100"
            >
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Add Student</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/fees/vouchers')}
              className="quick-action-tile bg-emerald-50 text-emerald-800 border-emerald-100"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Collect Fee</span>
            </button>
            <button
              type="button"
              disabled={generating}
              onClick={handleQuickGenerateVouchers}
              className="quick-action-tile bg-violet-50 text-violet-800 border-violet-100 disabled:opacity-60"
            >
              <FilePlus2 className="w-5 h-5 text-violet-600" />
              <span>{generating ? 'Generating...' : 'Generate Vouchers'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/teachers/new')}
              className="quick-action-tile bg-amber-50 text-amber-800 border-amber-100"
            >
              <GraduationCap className="w-5 h-5 text-amber-600" />
              <span>Add Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/expenses?new=1')}
              className="quick-action-tile bg-teal-50 text-teal-800 border-teal-100"
            >
              <Receipt className="w-5 h-5 text-teal-600" />
              <span>Add Expense</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/stock')}
              className="quick-action-tile bg-indigo-50 text-indigo-800 border-indigo-100"
            >
              <Package className="w-5 h-5 text-indigo-600" />
              <span>Manage Stock</span>
            </button>
          </div>
        </section>
      </div>

      {/* Bottom 3-Column Row: Recent Receipts + Recent Expenses + Fee Defaulters */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Receipts */}
        <section className="erp-card">
          <div className="erp-card-header">
            <span className="font-display font-semibold text-sm">Recent Receipts</span>
            <Link
              to="/fees/receipts"
              className="text-xs font-medium text-blue-200 hover:text-white flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="erp-table-wrap">
            <table className="erp-table is-compact">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.recentReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-xs text-slate-500 py-6">
                      No receipts found for this month.
                    </td>
                  </tr>
                ) : (
                  recent.recentReceipts.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="font-semibold text-slate-900">{r.studentName}</div>
                        <div className="text-[11px] text-slate-400">{formatDisplayDate(r.date)}</div>
                      </td>
                      <td className="text-slate-600">{r.className}</td>
                      <td className="font-semibold text-slate-900 tabular-nums">
                        {formatMoney(r.amount)}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => navigate(`/fees/receipts?print=${r.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#0066eb] hover:bg-[#0052bd] text-white text-xs font-medium cursor-pointer"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Expenses */}
        <section className="erp-card">
          <div className="erp-card-header">
            <span className="font-display font-semibold text-sm">Recent Expenses</span>
            <Link
              to="/expenses"
              className="text-xs font-medium text-blue-200 hover:text-white flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="erp-table-wrap">
            <table className="erp-table is-compact">
              <thead>
                <tr>
                  <th>Title / Payee</th>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.recentExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-xs text-slate-500 py-6">
                      No expenses recorded for this month.
                    </td>
                  </tr>
                ) : (
                  recent.recentExpenses.map((ex) => (
                    <tr key={ex.id}>
                      <td>
                        <div className="font-semibold text-slate-900">{ex.note || ex.payee}</div>
                        <div className="text-[11px] text-slate-400">{formatDisplayDate(ex.date)}</div>
                      </td>
                      <td className="text-slate-600">{ex.categoryName}</td>
                      <td className="font-semibold text-slate-900 tabular-nums text-right">
                        {formatMoney(ex.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fee Defaulters */}
        <section className="erp-card">
          <div className="erp-card-header">
            <span className="font-display font-semibold text-sm">Fee Defaulters</span>
            <Link
              to="/fees/defaulters"
              className="text-xs font-medium text-blue-200 hover:text-white flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="erp-table-wrap">
            <table className="erp-table is-compact">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Pending</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {recent.topDefaulters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-xs text-slate-500 py-6">
                      No pending defaulters!
                    </td>
                  </tr>
                ) : (
                  recent.topDefaulters.map((d) => {
                    const waPhone = formatPhoneForWhatsapp(d.phone);
                    return (
                      <tr key={d.studentId}>
                        <td>
                          <Link
                            to={`/students/${d.studentId}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 block"
                          >
                            {d.studentName}
                          </Link>
                          <div className="text-[11px] text-slate-400">{d.className}</div>
                        </td>
                        <td className="font-semibold text-red-600 tabular-nums">
                          {formatMoney(d.pending)}
                        </td>
                        <td>
                          <div className="flex flex-wrap items-center gap-1">
                            <a
                              href={`tel:${d.phone}`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-medium"
                              title={`Call ${d.phone}`}
                            >
                              <Phone className="w-3 h-3" /> Call
                            </a>
                            <a
                              href={`https://wa.me/${waPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-medium"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" /> WA
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

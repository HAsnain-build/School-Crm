import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Clock,
  FilePlus2,
  FileText,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react';
import * as feesApi from '../api/fees';
import FeesSubNav from '../components/FeesSubNav';
import { useToast } from '../context/ToastContext';
import { formatMoney, formatMonthLabel } from '../utils/erpLogic';

const MONTHS = ['2026-12', '2026-11', '2026-10', '2026-09'];

export default function FeesOverviewPage() {
  const { addToast } = useToast();
  const [month, setMonth] = useState('2026-11');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async (m) => {
    setLoading(true);
    try {
      const res = await feesApi.getFeeSummary(m);
      setSummary(res);
    } catch (err) {
      addToast(err?.message || 'Failed to load fees summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(month);
  }, [month]);

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const res = await feesApi.generateVouchers(month);
      addToast(
        res.createdCount > 0
          ? `${res.createdCount} new vouchers generated`
          : `Vouchers for ${formatMonthLabel(month)} are already generated`
      );
      load(month);
    } catch (err) {
      addToast(err?.message || 'Failed to generate vouchers', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleApplyLateFee = async () => {
    setBusy(true);
    try {
      const res = await feesApi.applyLateFee(month);
      addToast(`Late fee updated on ${res.updatedCount} vouchers`);
      load(month);
    } catch (err) {
      addToast(err?.message || 'Failed to update late fee', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <FeesSubNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Fees Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate monthly vouchers, track fee collection, and manage defaulters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Select Month"
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:border-blue-600"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={busy}
            onClick={handleApplyLateFee}
            className="h-10 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Clock className="w-4 h-4" />
            <span>Apply Late Fee</span>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={handleGenerate}
            className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Generate Monthly Vouchers</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      {loading || !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kpi-card h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card cursor-default">
            <div className="kpi-icon-circle bg-blue-100 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Fee ({summary.voucherCount} Vouchers)</div>
              <div className="kpi-value mt-0.5">{formatMoney(summary.totalFee)}</div>
            </div>
          </div>

          <div className="kpi-card cursor-default">
            <div className="kpi-icon-circle bg-emerald-100 text-emerald-600">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Collected</div>
              <div className="kpi-value mt-0.5 text-emerald-700">{formatMoney(summary.collected)}</div>
            </div>
          </div>

          <div className="kpi-card cursor-default">
            <div className="kpi-icon-circle bg-amber-100 text-amber-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Pending</div>
              <div className="kpi-value mt-0.5 text-amber-700">{formatMoney(summary.pending)}</div>
            </div>
          </div>

          <div className="kpi-card cursor-default">
            <div className="kpi-icon-circle bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Defaulters</div>
              <div className="kpi-value mt-0.5 text-red-600">{summary.defaultersCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links to Sub-Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/fees/vouchers"
          className="erp-panel hover:border-blue-400 transition-colors flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-slate-900">Vouchers List</div>
              <div className="text-xs text-slate-500">All vouchers, print, waivers, and collection</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-600" />
        </Link>

        <Link
          to="/fees/receipts"
          className="erp-panel hover:border-blue-400 transition-colors flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-slate-900">Receipts List</div>
              <div className="text-xs text-slate-500">Search and reprint past receipts</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        </Link>

        <Link
          to="/fees/defaulters"
          className="erp-panel hover:border-blue-400 transition-colors flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-slate-900">Fee Defaulters</div>
              <div className="text-xs text-slate-500">Students with pending fee, call and WhatsApp</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-red-600" />
        </Link>
      </div>
    </div>
  );
}

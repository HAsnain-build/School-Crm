import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Printer, Search, Users } from 'lucide-react';
import * as feesApi from '../api/fees';
import FeesSubNav from '../components/FeesSubNav';
import { useSettings } from '../context/SettingsContext';
import { formatDisplayDate, formatMoney, formatMonthLabel } from '../utils/erpLogic';

const MONTHS = ['', '2026-12', '2026-11', '2026-10', '2026-09'];

export default function VouchersListPage() {
  const { classes, settings } = useSettings();
  const navigate = useNavigate();

  const [month, setMonth] = useState('2026-11');
  const [classId, setClassId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [familyWise, setFamilyWise] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkPrintMode, setBulkPrintMode] = useState(false);

  useEffect(() => {
    setLoading(true);
    feesApi
      .getVouchers({ month, classId, status, search })
      .then((res) => setVouchers(res))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, [month, classId, status, search]);

  const familyGroups = useMemo(() => {
    if (!familyWise) return [];
    const map = {};
    for (const v of vouchers) {
      if (!map[v.familyNo]) {
        map[v.familyNo] = {
          familyNo: v.familyNo,
          fatherName: v.fatherName,
          items: [],
          totalNet: 0,
          totalBalance: 0,
        };
      }
      map[v.familyNo].items.push(v);
      map[v.familyNo].totalNet += v.net;
      map[v.familyNo].totalBalance += v.balance;
    }
    return Object.values(map);
  }, [vouchers, familyWise]);

  const handleBulkPrint = () => {
    setBulkPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (bulkPrintMode) {
    return (
      <div className="flex flex-col gap-6">
        <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-sm font-semibold text-slate-900">
            Bulk Print Preview ({vouchers.length} Vouchers)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-9 px-4 rounded-lg bg-[#0066eb] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print All
            </button>
            <button
              type="button"
              onClick={() => setBulkPrintMode(false)}
              className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium cursor-pointer"
            >
              Back to List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.slice(0, 40).map((v) => (
            <div key={v.id} className="print-sheet border border-slate-300 rounded-xl p-4 bg-white">
              <div className="flex items-start justify-between border-b border-slate-200 pb-2 mb-3">
                <div>
                  <div className="font-display font-bold text-base text-slate-900">
                    {settings?.schoolName || 'ABC Public School'}
                  </div>
                  <div className="text-xs text-slate-500">Fee Voucher · {formatMonthLabel(v.month)}</div>
                </div>
                <div className="text-right font-mono-num text-xs">
                  <div className="font-bold">{v.voucherNo}</div>
                  <div>Due: {formatDisplayDate(v.dueDate)}</div>
                </div>
              </div>
              <div className="text-xs grid grid-cols-2 gap-1 mb-3">
                <div>Student: <strong>{v.studentName}</strong></div>
                <div>Class: <strong>{v.className}</strong></div>
                <div>Father: <strong>{v.fatherName}</strong></div>
                <div>Family: <strong className="font-mono-num">{v.familyNo}</strong></div>
              </div>
              <div className="border-t border-slate-200 pt-2 text-xs flex flex-col gap-1">
                <div className="flex justify-between"><span>Tuition Fee</span><span className="tabular-nums">{formatMoney(v.tuition)}</span></div>
                {v.arrears > 0 && <div className="flex justify-between"><span>Arrears</span><span className="tabular-nums">{formatMoney(v.arrears)}</span></div>}
                {v.lateFee > 0 && <div className="flex justify-between"><span>Late Fee</span><span className="tabular-nums">{formatMoney(v.lateFee)}</span></div>}
                {v.waiver > 0 && <div className="flex justify-between text-emerald-700"><span>Waiver</span><span className="tabular-nums">-{formatMoney(v.waiver)}</span></div>}
                <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-1 mt-1">
                  <span>Net Payable</span>
                  <span className="tabular-nums">{formatMoney(v.net)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <FeesSubNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Fee Vouchers</h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Total {vouchers.length} vouchers · Paid, Partial, and Unpaid records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setFamilyWise((p) => !p)}
            aria-pressed={familyWise}
            className={`h-10 px-4 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
              familyWise
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family Wise View</span>
          </button>

          <button
            type="button"
            onClick={handleBulkPrint}
            className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print All</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="erp-panel flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Voucher no, student name, or family no..."
            aria-label="Search vouchers"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          aria-label="Filter by month"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
        >
          {MONTHS.map((m) => (
            <option key={m || 'all'} value={m}>
              {m ? formatMonthLabel(m) : 'All Months'}
            </option>
          ))}
        </select>

        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          aria-label="Filter by class"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Family Wise View OR Standard Table */}
      {familyWise ? (
        <div className="flex flex-col gap-4">
          {familyGroups.map((grp) => (
            <div key={grp.familyNo} className="erp-card">
              <div className="erp-card-header">
                <div>
                  <span className="font-display font-bold text-sm">Family {grp.familyNo}</span>
                  <span className="text-xs text-blue-200 ml-2">({grp.fatherName})</span>
                </div>
                <div className="text-xs font-semibold tabular-nums">
                  Total Pending: {formatMoney(grp.totalBalance)}
                </div>
              </div>
              <div className="erp-table-wrap hidden lg:block">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Voucher / Month</th>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Net / Pending</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grp.items.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <div className="font-mono-num text-xs font-semibold">{v.voucherNo}</div>
                          <div className="text-[11px] text-slate-500">{formatMonthLabel(v.month)}</div>
                        </td>
                        <td className="font-semibold">{v.studentName}</td>
                        <td>{v.className}</td>
                        <td>
                          <div className="tabular-nums">{formatMoney(v.net)}</div>
                          <div className="tabular-nums text-[11px] text-red-600 font-semibold">
                            Pending: {formatMoney(v.balance)}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-label ${
                              v.status === 'Paid' ? 'is-paid' : v.status === 'Partial' ? 'is-partial' : 'is-unpaid'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/fees/vouchers/${v.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium inline-block"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y divide-slate-100">
                {grp.items.map((v) => (
                  <div key={v.id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{v.studentName}</div>
                        <div className="text-xs text-slate-500">
                          {v.voucherNo} · {v.className} · {formatMonthLabel(v.month)}
                        </div>
                      </div>
                      <span
                        className={`status-label ${
                          v.status === 'Paid' ? 'is-paid' : v.status === 'Partial' ? 'is-partial' : 'is-unpaid'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="tabular-nums">
                        Net: <strong>{formatMoney(v.net)}</strong> · Pending:{' '}
                        <strong className="text-red-600">{formatMoney(v.balance)}</strong>
                      </span>
                      <Link
                        to={`/fees/vouchers/${v.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-table-wrap hidden xl:block">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Voucher / Month</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Total / Charges</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-sm text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                      No vouchers found.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <div className="font-mono-num text-xs font-semibold">{v.voucherNo}</div>
                        <div className="text-[11px] text-slate-500">{formatMonthLabel(v.month)}</div>
                      </td>
                      <td>
                        <Link
                          to={`/students/${v.studentId}`}
                          className="font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {v.studentName}
                        </Link>
                        <div className="text-[11px] text-slate-400">{v.familyNo}</div>
                      </td>
                      <td>{v.className}</td>
                      <td className="tabular-nums text-xs">
                        <div>Base: {formatMoney(v.tuition + v.arrears)}</div>
                        {(v.lateFee > 0 || v.waiver > 0) && (
                          <div className="text-[11px] text-slate-500">
                            {v.lateFee > 0 ? `+${formatMoney(v.lateFee)} late ` : ''}
                            {v.waiver > 0 ? `-${formatMoney(v.waiver)} waiver` : ''}
                          </div>
                        )}
                      </td>
                      <td className="tabular-nums font-bold">{formatMoney(v.net)}</td>
                      <td>
                        <span
                          className={`status-label ${
                            v.status === 'Paid' ? 'is-paid' : v.status === 'Partial' ? 'is-partial' : 'is-unpaid'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/fees/vouchers/${v.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          {v.balance > 0 && (
                            <button
                              type="button"
                              onClick={() => navigate(`/fees/collect/${v.id}`)}
                              className="px-2.5 py-1 rounded-lg bg-[#0066eb] hover:bg-[#0052bd] text-white text-xs font-medium cursor-pointer"
                            >
                              Collect
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Stacked Card View (< xl) */}
          <div className="xl:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
            ) : vouchers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No vouchers found.</div>
            ) : (
              vouchers.map((v) => (
                <div key={v.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/students/${v.studentId}`}
                        className="font-display font-bold text-sm text-slate-900 hover:text-blue-600"
                      >
                        {v.studentName}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {v.voucherNo} · {v.className} · {formatMonthLabel(v.month)} · {v.familyNo}
                      </div>
                    </div>
                    <span
                      className={`status-label shrink-0 ${
                        v.status === 'Paid' ? 'is-paid' : v.status === 'Partial' ? 'is-partial' : 'is-unpaid'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="text-xs tabular-nums">
                      Net: <strong className="text-slate-900">{formatMoney(v.net)}</strong>
                      {v.balance > 0 && (
                        <span className="text-red-600 font-semibold ml-2">
                          Balance: {formatMoney(v.balance)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/fees/vouchers/${v.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium cursor-pointer"
                      >
                        View
                      </button>
                      {v.balance > 0 && (
                        <button
                          type="button"
                          onClick={() => navigate(`/fees/collect/${v.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#0066eb] text-white text-xs font-medium cursor-pointer"
                        >
                          Collect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

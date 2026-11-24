import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, CheckCircle2, FilePlus2, FileText, Wallet } from 'lucide-react';
import * as salaryApi from '../api/salary';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { formatDisplayDate, formatMoney, formatMonthLabel } from '../utils/erpLogic';

const MONTHS = ['2026-12', '2026-11', '2026-10', '2026-09'];

export default function SalaryPage() {
  const { addToast } = useToast();
  const [month, setMonth] = useState('2026-11');
  const [data, setData] = useState({ records: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [payTarget, setPayTarget] = useState(null);
  const [payForm, setPayForm] = useState({
    paidDate: new Date().toISOString().slice(0, 10),
    method: 'Cash',
    deduction: 0,
  });

  const load = async (m) => {
    setLoading(true);
    try {
      const res = await salaryApi.getSalaries(m);
      setData(res);
    } catch (err) {
      addToast(err?.message || 'Failed to load salary records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(month);
  }, [month]);

  const handleGenerate = async () => {
    try {
      const res = await salaryApi.generateSalaries(month);
      addToast(
        res.createdCount > 0
          ? `Salary entries created for ${res.createdCount} teachers`
          : 'Salary entries already exist for all active teachers'
      );
      load(month);
    } catch (err) {
      addToast(err?.message || 'Failed to generate salary entries', 'error');
    }
  };

  const openPayModal = (rec) => {
    setPayTarget(rec);
    setPayForm({
      paidDate: new Date().toISOString().slice(0, 10),
      method: 'Cash',
      deduction: rec.deduction || 0,
    });
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    try {
      await salaryApi.paySalary(payTarget.id, payForm);
      addToast(`Salary paid to ${payTarget.teacherName}`);
      setPayTarget(null);
      load(month);
    } catch (err) {
      addToast(err?.message || 'Failed to save salary payment', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Teachers Salary</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly salary status, payments, and salary slips
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Select salary month"
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerate}
            className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4" /> Generate Entries
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {data.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="kpi-card cursor-default">
            <div className="kpi-icon-circle bg-blue-100 text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Salary</div>
              <div className="kpi-value mt-0.5">{formatMoney(data.summary.totalSalary)}</div>
            </div>
          </div>

          <div className="kpi-card cursor-default">
            <div className="kpi-icon-circle bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Paid ({data.summary.paidCount} Teachers)</div>
              <div className="kpi-value mt-0.5 text-emerald-700">{formatMoney(data.summary.paidAmount)}</div>
            </div>
          </div>

          <div className="kpi-card cursor-default">
            <div className="kpi-icon-circle bg-amber-100 text-amber-600">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Pending ({data.summary.pendingCount} Teachers)</div>
              <div className="kpi-value mt-0.5 text-amber-700">{formatMoney(data.summary.pendingAmount)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="erp-card">
        <div className="erp-table-wrap hidden xl:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Monthly Salary</th>
                <th>Deduction</th>
                <th>Net</th>
                <th>Status</th>
                <th>Paid Date</th>
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
              ) : data.records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                    No salary entries for this month. Click &ldquo;Generate Entries&rdquo; above.
                  </td>
                </tr>
              ) : (
                data.records.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-semibold text-slate-900">{r.teacherName}</div>
                      <div className="text-[11px] text-slate-400">{r.subjectClass}</div>
                    </td>
                    <td className="tabular-nums">{formatMoney(r.basic)}</td>
                    <td className="tabular-nums text-amber-700">{formatMoney(r.deduction)}</td>
                    <td className="tabular-nums font-bold">{formatMoney(r.net)}</td>
                    <td>
                      <span className={`status-label ${r.status === 'Paid' ? 'is-paid' : 'is-unpaid'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.paidDate ? `${formatDisplayDate(r.paidDate)} (${r.method})` : '—'}
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        {r.status !== 'Paid' && (
                          <button
                            type="button"
                            onClick={() => openPayModal(r)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        <Link
                          to={`/salary/slip/${r.id}`}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> Salary Slip
                        </Link>
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
          ) : data.records.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No salary entries for this month. Click &ldquo;Generate Entries&rdquo; above.
            </div>
          ) : (
            data.records.map((r) => (
              <div key={r.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display font-bold text-sm text-slate-900">{r.teacherName}</div>
                    <div className="text-xs text-slate-500">{r.subjectClass}</div>
                  </div>
                  <span className={`status-label ${r.status === 'Paid' ? 'is-paid' : 'is-unpaid'}`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-xs flex flex-wrap gap-3 tabular-nums">
                  <span>Basic: {formatMoney(r.basic)}</span>
                  <span className="text-amber-700">Deduction: {formatMoney(r.deduction)}</span>
                  <span className="font-bold text-slate-900">Net: {formatMoney(r.net)}</span>
                </div>
                {r.paidDate && (
                  <div className="text-[11px] text-slate-500">
                    Paid: {formatDisplayDate(r.paidDate)} ({r.method})
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {r.status !== 'Paid' && (
                    <button
                      type="button"
                      onClick={() => openPayModal(r)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Mark Paid
                    </button>
                  )}
                  <Link
                    to={`/salary/slip/${r.id}`}
                    className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> Salary Slip
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pay Salary Modal */}
      <Modal
        open={Boolean(payTarget)}
        onClose={() => setPayTarget(null)}
        title={payTarget ? `Pay Salary — ${payTarget.teacherName}` : 'Pay Salary'}
      >
        {payTarget && (
          <form onSubmit={handlePaySubmit} className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm flex justify-between">
              <span>Basic Salary:</span>
              <strong className="tabular-nums">{formatMoney(payTarget.basic)}</strong>
            </div>

            <div>
              <label htmlFor="sal-ded" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Deduction (Rs.) — Optional
              </label>
              <input
                id="sal-ded"
                type="number"
                min="0"
                max={payTarget.basic}
                value={payForm.deduction}
                onChange={(e) => setPayForm({ ...payForm, deduction: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sal-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date
                </label>
                <input
                  id="sal-date"
                  type="date"
                  required
                  value={payForm.paidDate}
                  onChange={(e) => setPayForm({ ...payForm, paidDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label htmlFor="sal-method" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Method
                </label>
                <select
                  id="sal-method"
                  value={payForm.method}
                  onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayTarget(null)}
                className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

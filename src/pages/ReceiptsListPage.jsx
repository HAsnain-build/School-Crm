import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, Search } from 'lucide-react';
import * as feesApi from '../api/fees';
import FeesSubNav from '../components/FeesSubNav';
import Modal from '../components/Modal';
import { useSettings } from '../context/SettingsContext';
import { formatDisplayDate, formatMoney, formatMonthLabel } from '../utils/erpLogic';

export default function ReceiptsListPage() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReceipt, setActiveReceipt] = useState(null);

  useEffect(() => {
    setLoading(true);
    feesApi
      .getReceipts({ search, date })
      .then((res) => {
        setReceipts(res);
        const printId = searchParams.get('print');
        if (printId) {
          const found = res.find((r) => r.id === printId);
          if (found) setActiveReceipt(found);
        }
      })
      .catch(() => setReceipts([]))
      .finally(() => setLoading(false));
  }, [search, date, searchParams]);

  const closeModal = () => {
    setActiveReceipt(null);
    if (searchParams.has('print')) {
      const next = new URLSearchParams(searchParams);
      next.delete('print');
      setSearchParams(next);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <FeesSubNav />
      <div>
        <h1 className="font-display font-bold text-xl text-slate-900">Fee Receipts</h1>
        <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
          Total {receipts.length} receipts · Search and reprint any previous receipt
        </p>
      </div>

      <div className="erp-panel flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Receipt no, student name, or voucher no..."
            aria-label="Search receipts"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Filter by date"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm"
        />
        {date && (
          <button
            type="button"
            onClick={() => setDate('')}
            className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer"
          >
            Clear Date
          </button>
        )}
      </div>

      <div className="erp-card">
        <div className="erp-table-wrap hidden xl:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Receipt / Date</th>
                <th>Student</th>
                <th>Class</th>
                <th>Voucher No.</th>
                <th>Amount Paid</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-mono-num text-xs font-semibold">{r.receiptNo}</div>
                      <div className="text-[11px] text-slate-400">{formatDisplayDate(r.date)}</div>
                    </td>
                    <td className="font-semibold text-slate-900">{r.studentName}</td>
                    <td>{r.className}</td>
                    <td className="font-mono-num text-xs text-slate-600">{r.voucherNo}</td>
                    <td>
                      <div className="tabular-nums font-bold text-emerald-700">{formatMoney(r.amount)}</div>
                      <div className="text-[11px] text-slate-400">{r.method}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(r)}
                        className="px-3 py-1 rounded-lg bg-[#0066eb] hover:bg-[#0052bd] text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
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
          ) : receipts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No receipts found.</div>
          ) : (
            receipts.map((r) => (
              <div key={r.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display font-bold text-sm text-slate-900">{r.studentName}</div>
                    <div className="text-xs text-slate-500">
                      {r.receiptNo} · {r.className} · {formatDisplayDate(r.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular-nums font-bold text-sm text-emerald-700">
                      {formatMoney(r.amount)}
                    </div>
                    <div className="text-[11px] text-slate-400">{r.method}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="font-mono-num text-xs text-slate-500">Voucher: {r.voucherNo}</span>
                  <button
                    type="button"
                    onClick={() => setActiveReceipt(r)}
                    className="px-3 py-1 rounded-lg bg-[#0066eb] text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Receipt Print Modal */}
      <Modal
        open={Boolean(activeReceipt)}
        onClose={closeModal}
        title={activeReceipt ? `Receipt ${activeReceipt.receiptNo}` : 'Receipt'}
        maxWidth="max-w-xl"
      >
        {activeReceipt && (
          <div className="flex flex-col gap-4">
            <div className="print-sheet border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <div className="font-display font-bold text-lg text-slate-900">
                    {settings?.schoolName || 'ABC Public School'}
                  </div>
                  <div className="text-xs text-slate-500">{settings?.address}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono-num font-bold text-sm">{activeReceipt.receiptNo}</div>
                  <div className="text-xs text-slate-500">{formatDisplayDate(activeReceipt.date)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg mb-4">
                <div>Student: <strong>{activeReceipt.studentName}</strong></div>
                <div>Class: <strong>{activeReceipt.className}</strong></div>
                <div>Father: <strong>{activeReceipt.fatherName}</strong></div>
                <div>Month: <strong>{formatMonthLabel(activeReceipt.month)}</strong></div>
              </div>

              <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-3">
                <span>Amount Paid ({activeReceipt.method})</span>
                <span className="tabular-nums text-emerald-700">{formatMoney(activeReceipt.amount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Remaining Balance</span>
                <span className="tabular-nums">{formatMoney(activeReceipt.remainingAfter)}</span>
              </div>
            </div>

            <div className="no-print flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="h-9 px-5 rounded-lg bg-[#0066eb] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Printer } from 'lucide-react';
import * as feesApi from '../api/fees';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { formatDisplayDate, formatMoney, formatMonthLabel } from '../utils/erpLogic';

export default function FeeCollectPage() {
  const { voucherId } = useParams();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [voucher, setVoucher] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    setLoading(true);
    feesApi
      .getVoucherById(voucherId)
      .then((v) => {
        setVoucher(v);
        setAmount(String(v.balance));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [voucherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await feesApi.collectFee(voucherId, {
        amount: Number(amount),
        method,
        date,
      });
      setReceipt(res.receipt);
      addToast('Fee collected and receipt created!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="erp-panel text-sm text-slate-500">Loading voucher details...</div>;
  }

  if (receipt) {
    return (
      <div className="flex flex-col gap-5">
        <div className="no-print flex items-center justify-between">
          <Link
            to="/fees/receipts"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Receipts
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-5 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>

        <div className="print-sheet w-full">
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-5">
            <div>
              <h1 className="font-display font-bold text-2xl text-slate-900">
                {settings?.schoolName || 'ABC Public School'}
              </h1>
              <p className="text-xs text-slate-600">{settings?.address} · {settings?.phone}</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase text-emerald-700">Fee Receipt</div>
              <div className="font-mono-num font-bold text-lg">{receipt.receiptNo}</div>
              <div className="text-xs text-slate-500">{formatDisplayDate(receipt.date)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
            <div>Student: <strong>{receipt.studentName}</strong></div>
            <div>Class: <strong>{receipt.className}</strong></div>
            <div>Father: <strong>{receipt.fatherName}</strong></div>
            <div>Voucher No: <strong className="font-mono-num">{receipt.voucherNo}</strong></div>
            <div>Month: <strong>{formatMonthLabel(receipt.month)}</strong></div>
            <div>Method: <strong>{receipt.method}</strong></div>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2 text-sm mb-6">
            <div className="flex justify-between">
              <span>Total Voucher Amount (Net)</span>
              <span className="tabular-nums font-semibold">{formatMoney(receipt.voucherNet)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold text-base border-t border-slate-100 pt-2">
              <span>Amount Paid</span>
              <span className="tabular-nums">{formatMoney(receipt.amount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Remaining Balance</span>
              <span className="tabular-nums font-semibold">{formatMoney(receipt.remainingAfter)}</span>
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-500 pt-4 border-t border-dashed border-slate-300">
            <span>Received By: Principal / Office</span>
            <span>Signature: ___________________</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <Link
          to={`/fees/vouchers/${voucherId}`}
          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Voucher
        </Link>
        <h1 className="font-display font-bold text-xl text-slate-900 mt-1">
          Collect Fee & Generate Receipt
        </h1>
      </div>

      {voucher && (
        <div className="erp-panel flex flex-col gap-5">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 grid grid-cols-2 gap-2 text-sm">
            <div>Student: <strong>{voucher.studentName}</strong></div>
            <div>Class: <strong>{voucher.className}</strong></div>
            <div>Voucher No: <strong className="font-mono-num">{voucher.voucherNo}</strong></div>
            <div>Month: <strong>{formatMonthLabel(voucher.month)}</strong></div>
            <div>Net Payable: <strong className="tabular-nums">{formatMoney(voucher.net)}</strong></div>
            <div>Remaining Balance: <strong className="tabular-nums text-red-600">{formatMoney(voucher.balance)}</strong></div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="collect-amt" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount Received (Rs.) * (Full or partial)
              </label>
              <input
                id="collect-amt"
                type="number"
                min="1"
                max={voucher.balance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-base font-mono-num font-bold focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="collect-method" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  id="collect-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label htmlFor="collect-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Date
                </label>
                <input
                  id="collect-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || voucher.balance <= 0}
              className="mt-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Creating receipt...' : 'Save Fee & Create Receipt'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

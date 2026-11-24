import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, MessageCircle, Percent, Printer } from 'lucide-react';
import * as feesApi from '../api/fees';
import Modal from '../components/Modal';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import {
  buildWhatsappReminderText,
  formatDisplayDate,
  formatMoney,
  formatMonthLabel,
  formatPhoneForWhatsapp,
} from '../utils/erpLogic';

export default function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waiverModalOpen, setWaiverModalOpen] = useState(false);
  const [waiverMode, setWaiverMode] = useState('amount');
  const [waiverValue, setWaiverValue] = useState('');
  const [waiverReason, setWaiverReason] = useState('');
  const [waiverError, setWaiverError] = useState('');
  const [savingWaiver, setSavingWaiver] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await feesApi.getVoucherById(id);
      setVoucher(res);
    } catch {
      setVoucher(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleWaiverSubmit = async (e) => {
    e.preventDefault();
    setWaiverError('');
    if (!waiverReason.trim()) {
      setWaiverError('Please enter a reason for the waiver (e.g. sibling discount)');
      return;
    }
    setSavingWaiver(true);
    try {
      await feesApi.applyWaiver(voucher.id, {
        mode: waiverMode,
        value: Number(waiverValue),
        reason: waiverReason,
      });
      addToast('Fee waiver saved');
      setWaiverModalOpen(false);
      load();
    } catch (err) {
      setWaiverError(err.message);
    } finally {
      setSavingWaiver(false);
    }
  };

  if (loading) {
    return <div className="erp-panel text-sm text-slate-500">Loading voucher...</div>;
  }

  if (!voucher) {
    return <div className="erp-panel text-sm text-red-600">Voucher not found.</div>;
  }

  const waPhone = formatPhoneForWhatsapp(voucher.phone);
  const waText = encodeURIComponent(
    buildWhatsappReminderText({
      template: settings?.whatsappTemplate || '',
      studentName: voucher.studentName,
      fatherName: voucher.fatherName,
      className: voucher.className,
      monthLabel: formatMonthLabel(voucher.month),
      amount: voucher.balance,
      dueDate: voucher.dueDate,
    })
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/fees/vouchers"
          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Vouchers List
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print
          </button>

          {voucher.balance > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  setWaiverValue(String(voucher.waiver || ''));
                  setWaiverReason(voucher.waiverReason || '');
                  setWaiverError('');
                  setWaiverModalOpen(true);
                }}
                className="h-10 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Percent className="w-4 h-4" /> Add Waiver
              </button>

              <a
                href={`https://wa.me/${waPhone}?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Send WhatsApp
              </a>

              <button
                type="button"
                onClick={() => navigate(`/fees/collect/${voucher.id}`)}
                className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Banknote className="w-4 h-4" /> Collect Fee
              </button>
            </>
          )}
        </div>
      </div>

      {/* Printable Voucher Sheet */}
      <div className="print-sheet w-full">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4 mb-5">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">
              {settings?.schoolName || 'ABC Public School'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {settings?.address || 'Main Gulberg Road, Lahore'} · Phone: {settings?.phone || '042-35761234'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fee Voucher</div>
            <div className="font-mono-num font-bold text-lg text-slate-900">{voucher.voucherNo}</div>
            <div className="text-xs text-slate-600 mt-0.5">
              Status:{' '}
              <strong
                className={
                  voucher.status === 'Paid'
                    ? 'text-emerald-700'
                    : voucher.status === 'Partial'
                    ? 'text-amber-700'
                    : 'text-red-700'
                }
              >
                {voucher.status}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
          <div>Student Name: <strong className="text-slate-900">{voucher.studentName}</strong></div>
          <div>Class: <strong className="text-slate-900">{voucher.className}</strong></div>
          <div>Father Name: <strong className="text-slate-900">{voucher.fatherName}</strong></div>
          <div>Family No: <strong className="font-mono-num text-slate-900">{voucher.familyNo}</strong></div>
          <div>Month: <strong className="text-slate-900">{formatMonthLabel(voucher.month)}</strong></div>
          <div>Due Date: <strong className="text-slate-900">{formatDisplayDate(voucher.dueDate)}</strong></div>
        </div>

        <table className="w-full text-sm border-collapse mb-5">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs text-slate-500">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount (Rs.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2.5">Monthly Tuition Fee</td>
              <td className="py-2.5 text-right tabular-nums font-medium">{formatMoney(voucher.tuition)}</td>
            </tr>
            <tr>
              <td className="py-2.5">Previous Balance (Arrears)</td>
              <td className="py-2.5 text-right tabular-nums font-medium">{formatMoney(voucher.arrears)}</td>
            </tr>
            <tr>
              <td className="py-2.5">Late Fee</td>
              <td className="py-2.5 text-right tabular-nums font-medium">{formatMoney(voucher.lateFee)}</td>
            </tr>
            <tr>
              <td className="py-2.5 text-emerald-700">
                Fee Waiver{voucher.waiverReason ? ` — ${voucher.waiverReason}` : ''}
              </td>
              <td className="py-2.5 text-right tabular-nums font-medium text-emerald-700">
                - {formatMoney(voucher.waiver)}
              </td>
            </tr>
            <tr className="border-t-2 border-slate-900 font-bold text-base">
              <td className="py-3">Net Payable</td>
              <td className="py-3 text-right tabular-nums">{formatMoney(voucher.net)}</td>
            </tr>
            <tr>
              <td className="py-2 text-emerald-700">Paid Amount</td>
              <td className="py-2 text-right tabular-nums font-semibold text-emerald-700">
                {formatMoney(voucher.paid)}
              </td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td className="py-2.5 px-2">Remaining Balance</td>
              <td className="py-2.5 px-2 text-right tabular-nums text-red-600">
                {formatMoney(voucher.balance)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-6 border-t border-dashed border-slate-300">
          <span>Accountant / Principal Signature: ___________________</span>
          <span>Late fee applies after the due date.</span>
        </div>
      </div>

      {/* Waiver Modal */}
      <Modal open={waiverModalOpen} onClose={() => setWaiverModalOpen(false)} title="Apply Fee Waiver">
        <form onSubmit={handleWaiverSubmit} className="flex flex-col gap-4">
          {waiverError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {waiverError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Waiver Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWaiverMode('amount')}
                className={`h-9 rounded-lg border text-xs font-semibold cursor-pointer ${
                  waiverMode === 'amount'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Amount (Rs.)
              </button>
              <button
                type="button"
                onClick={() => setWaiverMode('percent')}
                className={`h-9 rounded-lg border text-xs font-semibold cursor-pointer ${
                  waiverMode === 'percent'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Percentage (%)
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="waiver-val" className="block text-xs font-semibold text-slate-700 mb-1.5">
              {waiverMode === 'percent' ? 'Percentage (0 - 100)' : 'Amount (Rs.)'}
            </label>
            <input
              id="waiver-val"
              type="number"
              min="0"
              max={waiverMode === 'percent' ? 100 : undefined}
              required
              value={waiverValue}
              onChange={(e) => setWaiverValue(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
            />
          </div>

          <div>
            <label htmlFor="waiver-reason" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason (Required) *
            </label>
            <input
              id="waiver-reason"
              type="text"
              required
              value={waiverReason}
              onChange={(e) => setWaiverReason(e.target.value)}
              placeholder="e.g. Sibling discount, Staff child"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWaiverModalOpen(false)}
              className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingWaiver}
              className="h-9 px-5 rounded-lg bg-[#0066eb] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
            >
              {savingWaiver ? 'Saving...' : 'Save Waiver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

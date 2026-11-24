import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import * as salaryApi from '../api/salary';
import { useSettings } from '../context/SettingsContext';
import { formatDisplayDate, formatMoney, formatMonthLabel } from '../utils/erpLogic';

export default function SalarySlipPage() {
  const { id } = useParams();
  const { settings } = useSettings();
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    salaryApi
      .getSalarySlip(id)
      .then((res) => setSlip(res))
      .catch(() => setSlip(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="erp-panel text-sm text-slate-500">Loading salary slip...</div>;
  }

  if (!slip) {
    return <div className="erp-panel text-sm text-red-600">Salary slip not found.</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="no-print flex items-center justify-between">
        <Link
          to="/salary"
          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Salary List
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="h-10 px-5 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Slip
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
            <div className="text-xs font-semibold uppercase text-slate-500">Salary Slip</div>
            <div className="font-display font-bold text-base text-slate-900">
              {formatMonthLabel(slip.month)}
            </div>
            <div className="text-xs text-slate-500">
              Status: <strong>{slip.status}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
          <div>Teacher: <strong>{slip.teacher?.name || '—'}</strong></div>
          <div>Subject/Class: <strong>{slip.teacher?.subjectClass || '—'}</strong></div>
          <div>Father: <strong>{slip.teacher?.fatherName || '—'}</strong></div>
          <div>CNIC: <strong className="font-mono-num">{slip.teacher?.cnic || '—'}</strong></div>
          <div>Paid Date: <strong>{slip.paidDate ? formatDisplayDate(slip.paidDate) : 'Pending'}</strong></div>
          <div>Method: <strong>{slip.method || '—'}</strong></div>
        </div>

        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs text-slate-500">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount (Rs.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2.5">Basic Monthly Salary</td>
              <td className="py-2.5 text-right tabular-nums font-medium">{formatMoney(slip.basic)}</td>
            </tr>
            <tr>
              <td className="py-2.5 text-red-600">Deduction</td>
              <td className="py-2.5 text-right tabular-nums font-medium text-red-600">
                - {formatMoney(slip.deduction)}
              </td>
            </tr>
            <tr className="border-t-2 border-slate-900 font-bold text-base">
              <td className="py-3">Net Salary Paid</td>
              <td className="py-3 text-right tabular-nums">{formatMoney(slip.net)}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between text-xs text-slate-500 pt-6 border-t border-dashed border-slate-300">
          <span>Teacher Signature: ___________________</span>
          <span>Principal Signature: ___________________</span>
        </div>
      </div>
    </div>
  );
}

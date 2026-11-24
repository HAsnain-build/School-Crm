import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, MessageCircle, Phone } from 'lucide-react';
import * as feesApi from '../api/fees';
import FeesSubNav from '../components/FeesSubNav';
import { formatMoney, formatPhoneForWhatsapp } from '../utils/erpLogic';

export default function DefaultersPage() {
  const navigate = useNavigate();
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feesApi
      .getDefaulters()
      .then((res) => setDefaulters(res))
      .catch(() => setDefaulters([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPending = defaulters.reduce((s, d) => s + d.totalDue, 0);

  return (
    <div className="flex flex-col gap-5">
      <FeesSubNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Fee Defaulters</h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {defaulters.length} students owe a total of {formatMoney(totalPending)} (highest first)
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/whatsapp')}
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Send WhatsApp Reminders</span>
        </button>
      </div>

      <div className="erp-card">
        <div className="erp-table-wrap hidden xl:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Father Name</th>
                <th>Class</th>
                <th>Months Due</th>
                <th>Total Due</th>
                <th>Phone</th>
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
              ) : defaulters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                    Great! No fee defaulters found.
                  </td>
                </tr>
              ) : (
                defaulters.map((d) => {
                  const waPhone = formatPhoneForWhatsapp(d.phone);
                  return (
                    <tr key={d.studentId}>
                      <td>
                        <Link
                          to={`/students/${d.studentId}`}
                          className="font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {d.studentName}
                        </Link>
                      </td>
                      <td>{d.fatherName}</td>
                      <td>{d.className}</td>
                      <td className="tabular-nums font-medium">{d.monthsCount} {d.monthsCount === 1 ? 'Month' : 'Months'}</td>
                      <td className="tabular-nums font-bold text-red-600">{formatMoney(d.totalDue)}</td>
                      <td className="font-mono-num text-xs">{d.phone}</td>
                      <td>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <a
                            href={`tel:${d.phone}`}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                          <Link
                            to={`/fees/vouchers/${d.latestVoucherId}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Voucher
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Stacked Card View (< xl) */}
        <div className="xl:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
          ) : defaulters.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">Great! No fee defaulters found.</div>
          ) : (
            defaulters.map((d) => {
              const waPhone = formatPhoneForWhatsapp(d.phone);
              return (
                <div key={d.studentId} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/students/${d.studentId}`}
                        className="font-display font-bold text-sm text-slate-900 hover:text-blue-600"
                      >
                        {d.studentName}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Father: {d.fatherName} · {d.className} · {d.phone}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="tabular-nums font-bold text-sm text-red-600">
                        {formatMoney(d.totalDue)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {d.monthsCount} {d.monthsCount === 1 ? 'Month' : 'Months'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <a
                      href={`tel:${d.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <Link
                      to={`/fees/vouchers/${d.latestVoucherId}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Voucher
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

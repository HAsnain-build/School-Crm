import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, MessageCircle, Phone, Users } from 'lucide-react';
import * as studentsApi from '../api/students';
import { formatDisplayDate, formatMoney, formatMonthLabel, formatPhoneForWhatsapp } from '../utils/erpLogic';

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    studentsApi
      .getStudentById(id)
      .then((res) => setStudent(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="erp-panel text-sm text-slate-500">Loading student profile...</div>;
  }

  if (error || !student) {
    return (
      <div className="erp-panel">
        <div className="text-red-600 font-semibold text-sm">{error || 'Student not found'}</div>
        <Link to="/students" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          Back to Students List
        </Link>
      </div>
    );
  }

  const waPhone = formatPhoneForWhatsapp(student.phone);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          to="/students"
          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Students List
        </Link>
      </div>

      {/* Top Student Profile Summary */}
      <div className="erp-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-bold text-2xl text-slate-900">{student.name}</h1>
            <span className={`status-label ${student.status === 'Active' ? 'is-active' : 'is-inactive'}`}>
              {student.status}
            </span>
          </div>
          <div className="text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>Father: <strong className="text-slate-900">{student.fatherName}</strong></span>
            <span>·</span>
            <span>Class: <strong className="text-slate-900">{student.className}</strong></span>
            <span>·</span>
            <span>Family No: <strong className="font-mono-num text-slate-900">{student.familyNo}</strong></span>
            <span>·</span>
            <span>B-Form: <strong className="font-mono-num text-slate-900">{student.bForm}</strong></span>
          </div>
          <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-3">
            <span>Admission: {formatDisplayDate(student.admissionDate)}</span>
            <span>·</span>
            <span>Monthly Fee: <strong className="text-slate-800">{formatMoney(student.monthlyFee)}</strong></span>
            <span>·</span>
            <span>Phone: <strong className="font-mono-num text-slate-800">{student.phone}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={`tel:${student.phone}`}
            className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Phone className="w-4 h-4" /> Call
          </a>
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noreferrer"
            className="h-10 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <Link
            to={`/students/${student.id}/edit`}
            className="h-10 px-4 rounded-xl bg-[#0066eb] text-white hover:bg-[#0052bd] text-sm font-semibold inline-flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </Link>
        </div>
      </div>

      {/* Grid: Fee History + Siblings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="erp-card xl:col-span-2">
          <div className="erp-card-header">
            <span className="font-display font-semibold text-sm">Fee History (Vouchers)</span>
          </div>
          <div className="erp-table-wrap hidden lg:block">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Voucher / Month</th>
                  <th>Net / Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {student.vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-xs text-slate-500">
                      No vouchers generated yet.
                    </td>
                  </tr>
                ) : (
                  student.vouchers.map((v) => {
                    const bal = Math.max(0, v.net - v.paid);
                    return (
                      <tr key={v.id}>
                        <td>
                          <div className="font-mono-num text-xs font-semibold">{v.voucherNo}</div>
                          <div className="text-xs text-slate-500">{formatMonthLabel(v.month)}</div>
                        </td>
                        <td>
                          <div className="tabular-nums font-medium">{formatMoney(v.net)}</div>
                          <div className="tabular-nums text-[11px] text-emerald-700">Paid: {formatMoney(v.paid)}</div>
                        </td>
                        <td className="tabular-nums text-red-600 font-semibold">{formatMoney(bal)}</td>
                        <td>
                          <span
                            className={`status-label ${
                              v.status === 'Paid'
                                ? 'is-paid'
                                : v.status === 'Partial'
                                ? 'is-partial'
                                : 'is-unpaid'
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
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium cursor-pointer"
                            >
                              Voucher
                            </button>
                            {bal > 0 && (
                              <button
                                type="button"
                                onClick={() => navigate(`/fees/collect/${v.id}`)}
                                className="px-2.5 py-1 rounded-lg bg-[#0066eb] hover:bg-[#0052bd] text-white text-xs font-medium cursor-pointer"
                              >
                                Collect Fee
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Stacked Fee History (< lg) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {student.vouchers.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500">
                No vouchers generated yet.
              </div>
            ) : (
              student.vouchers.map((v) => {
                const bal = Math.max(0, v.net - v.paid);
                return (
                  <div key={v.id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono-num text-xs font-bold text-slate-900">{v.voucherNo}</div>
                        <div className="text-xs text-slate-500">{formatMonthLabel(v.month)}</div>
                      </div>
                      <span
                        className={`status-label ${
                          v.status === 'Paid'
                            ? 'is-paid'
                            : v.status === 'Partial'
                            ? 'is-partial'
                            : 'is-unpaid'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <div className="text-xs flex flex-wrap gap-3 tabular-nums">
                      <span>Net: <strong>{formatMoney(v.net)}</strong></span>
                      <span className="text-emerald-700">Paid: {formatMoney(v.paid)}</span>
                      <span className="text-red-600 font-semibold">Balance: {formatMoney(bal)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/fees/vouchers/${v.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium cursor-pointer"
                      >
                        Voucher
                      </button>
                      {bal > 0 && (
                        <button
                          type="button"
                          onClick={() => navigate(`/fees/collect/${v.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#0066eb] text-white text-xs font-medium cursor-pointer"
                        >
                          Collect Fee
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Family / Siblings */}
        <section className="erp-card">
          <div className="erp-card-header">
            <span className="font-display font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-300" /> Family ({student.familyNo})
            </span>
          </div>
          <div className="p-4">
            {student.siblings.length === 0 ? (
              <p className="text-xs text-slate-500">No other siblings registered under this family number.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {student.siblings.map((sib) => (
                  <Link
                    key={sib.id}
                    to={`/students/${sib.id}`}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{sib.name}</div>
                      <div className="text-xs text-slate-500">{sib.className}</div>
                    </div>
                    <span className={`status-label ${sib.status === 'Active' ? 'is-active' : 'is-inactive'}`}>
                      {sib.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

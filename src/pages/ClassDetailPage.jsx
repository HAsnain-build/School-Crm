import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Eye, MessageCircle, Phone, PhoneCall, Plus } from 'lucide-react';
import * as classesApi from '../api/classes';
import * as studentsApi from '../api/students';
import { formatMoney, formatPhoneForWhatsapp } from '../utils/erpLogic';

export default function ClassDetailPage() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([classesApi.getClassById(id), studentsApi.getStudents({ classId: id })])
      .then(([c, stus]) => {
        setCls(c);
        setStudents(stus);
      })
      .catch(() => {
        setCls(null);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="erp-panel text-sm text-slate-500">Loading class details...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/classes"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Classes
          </Link>
          <h1 className="font-display font-bold text-xl text-slate-900 mt-1">
            {cls?.name || 'Class'} — Students List
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Total {students.length} students · Monthly Fee: {formatMoney(cls?.monthlyFee || 0)}
          </p>
        </div>

        <Link
          to="/students/new"
          className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Student
        </Link>
      </div>

      <div className="erp-card">
        <div className="erp-table-wrap hidden xl:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Father Name</th>
                <th>Phone / Family</th>
                <th>Status</th>
                <th>Fee Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                    No students found in this class.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const waPhone = formatPhoneForWhatsapp(s.phone);
                  const isPending = s.feeStatus !== 'Paid';
                  return (
                    <tr key={s.id}>
                      <td>
                        <Link
                          to={`/students/${s.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td>{s.fatherName}</td>
                      <td>
                        <div className="font-mono-num text-xs whitespace-nowrap">{s.phone}</div>
                        <div className="font-mono-num text-[11px] text-slate-400 whitespace-nowrap">{s.familyNo}</div>
                      </td>
                      <td>
                        <span className={`status-label ${s.status === 'Active' ? 'is-active' : 'is-inactive'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <span className={`status-label ${s.feeStatus === 'Paid' ? 'is-paid' : 'is-unpaid'}`}>
                          {isPending ? 'Pending' : 'Paid'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            to={`/students/${s.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </Link>
                          <Link
                            to={`/students/${s.id}/edit`}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </Link>
                          <a
                            href={`tel:${s.phone}`}
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
                          {isPending && (
                            <a
                              href={`tel:${s.phone}`}
                              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <PhoneCall className="w-3.5 h-3.5" /> Call Home
                            </a>
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

        {/* Stacked View (< xl) */}
        <div className="xl:hidden divide-y divide-slate-100">
          {students.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No students found in this class.
            </div>
          ) : (
            students.map((s) => {
              const waPhone = formatPhoneForWhatsapp(s.phone);
              const isPending = s.feeStatus !== 'Paid';
              return (
                <div key={s.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/students/${s.id}`}
                        className="font-display font-bold text-sm text-slate-900 hover:text-blue-600"
                      >
                        {s.name}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Father: {s.fatherName} · {s.familyNo} · {s.phone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`status-label ${s.status === 'Active' ? 'is-active' : 'is-inactive'}`}>
                        {s.status}
                      </span>
                      <span className={`status-label ${s.feeStatus === 'Paid' ? 'is-paid' : 'is-unpaid'}`}>
                        {isPending ? 'Pending' : 'Paid'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Link
                      to={`/students/${s.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium"
                    >
                      View
                    </Link>
                    <Link
                      to={`/students/${s.id}/edit`}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
                    >
                      Edit
                    </Link>
                    <a
                      href={`tel:${s.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium"
                    >
                      WhatsApp
                    </a>
                    {isPending && (
                      <a
                        href={`tel:${s.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold"
                      >
                        Call Home
                      </a>
                    )}
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

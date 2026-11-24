import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Download,
  Edit3,
  Eye,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  Search,
} from 'lucide-react';
import * as studentsApi from '../api/students';
import { useSettings } from '../context/SettingsContext';
import { downloadCsv } from '../utils/csv';
import { formatMoney, formatPhoneForWhatsapp } from '../utils/erpLogic';

export default function StudentsListPage() {
  const { classes } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState(searchParams.get('classId') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [feeStatus, setFeeStatus] = useState(searchParams.get('feeStatus') || '');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    studentsApi
      .getStudents({ search, classId, status, feeStatus })
      .then((res) => {
        if (active) setStudents(res);
      })
      .catch(() => {
        if (active) setStudents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, classId, status, feeStatus]);

  const handleStatusFilter = (val) => {
    setStatus(val);
    const next = new URLSearchParams(searchParams);
    if (val) next.set('status', val);
    else next.delete('status');
    setSearchParams(next);
  };

  const handleExportCsv = () => {
    downloadCsv(
      'students-list.csv',
      ['ID', 'Name', 'Father Name', 'Class', 'Phone', 'Family No', 'B-Form', 'Status', 'Fee Status', 'Monthly Fee'],
      students.map((s) => [
        s.id,
        s.name,
        s.fatherName,
        s.className,
        s.phone,
        s.familyNo,
        s.bForm,
        s.status,
        s.feeStatus,
        s.monthlyFee,
      ])
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Students</h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Showing {students.length} students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV Export</span>
          </button>
          <Link
            to="/students/new"
            className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="erp-panel flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, father name, phone, or family no..."
            aria-label="Search students"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          aria-label="Filter by Class"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-600"
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
          onChange={(e) => handleStatusFilter(e.target.value)}
          aria-label="Filter by Status"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={feeStatus}
          onChange={(e) => setFeeStatus(e.target.value)}
          aria-label="Filter by Fee Status"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="">All Fee Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table (Desktop >= xl, zero horizontal scroll) */}
      <div className="erp-card">
        <div className="erp-table-wrap hidden xl:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Father Name</th>
                <th>Class</th>
                <th>Phone / Family</th>
                <th>Status</th>
                <th>Fee Status</th>
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="text-sm font-semibold text-slate-700">No students found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Try changing your search or filters, or add a new student.
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const waPhone = formatPhoneForWhatsapp(s.phone);
                  return (
                    <tr key={s.id}>
                      <td>
                        <Link
                          to={`/students/${s.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {s.name}
                        </Link>
                        <div className="text-[11px] text-slate-400 font-mono-num">
                          {formatMoney(s.monthlyFee)}/mo
                        </div>
                      </td>
                      <td className="text-slate-700">{s.fatherName}</td>
                      <td className="whitespace-nowrap">{s.className}</td>
                      <td>
                        <div className="font-mono-num text-xs text-slate-800 whitespace-nowrap">{s.phone}</div>
                        <div className="font-mono-num text-[11px] text-slate-400 whitespace-nowrap">{s.familyNo}</div>
                      </td>
                      <td>
                        <span
                          className={`status-label ${
                            s.status === 'Active' ? 'is-active' : 'is-inactive'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-label ${
                            s.feeStatus === 'Paid' ? 'is-paid' : 'is-unpaid'
                          }`}
                        >
                          {s.feeStatus}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            to={`/students/${s.id}`}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                            title="View"
                          >
                            <Eye className="w-3 h-3" /> View
                          </Link>
                          <Link
                            to={`/students/${s.id}/edit`}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium inline-flex items-center gap-1"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </Link>
                          <a
                            href={`tel:${s.phone}`}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium inline-flex items-center gap-1"
                            title={`Call ${s.phone}`}
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" /> WA
                          </a>
                          {s.feeStatus !== 'Paid' && (
                            <a
                              href={`tel:${s.phone}`}
                              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <PhoneCall className="w-3 h-3" /> Call Home
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

        {/* Stacked Card View (< xl: laptop, tablet & mobile, vertical scroll only) */}
        <div className="xl:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
          ) : students.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No students found</div>
          ) : (
            students.map((s) => {
              const waPhone = formatPhoneForWhatsapp(s.phone);
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
                        S/O {s.fatherName} · {s.className} · {s.familyNo} · {s.phone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`status-label ${s.status === 'Active' ? 'is-active' : 'is-inactive'}`}>
                        {s.status}
                      </span>
                      <span className={`status-label ${s.feeStatus === 'Paid' ? 'is-paid' : 'is-unpaid'}`}>
                        {s.feeStatus}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Link
                      to={`/students/${s.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      View
                    </Link>
                    <Link
                      to={`/students/${s.id}/edit`}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
                    >
                      Edit
                    </Link>
                    <a
                      href={`tel:${s.phone}`}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
                    >
                      WhatsApp
                    </a>
                    {s.feeStatus !== 'Paid' && (
                      <a
                        href={`tel:${s.phone}`}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold"
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

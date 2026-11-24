import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, MessageCircle, Phone, Plus, Save, Search } from 'lucide-react';
import * as teachersApi from '../api/teachers';
import { useToast } from '../context/ToastContext';
import { formatDisplayDate, formatMoney, formatPhoneForWhatsapp, isValidPhone } from '../utils/erpLogic';

export function TeachersListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    teachersApi
      .getTeachers({ search, status })
      .then((res) => setTeachers(res))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, [search, status]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Teachers</h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Total {teachers.length} teachers · Records, qualification, and monthly salary
          </p>
        </div>
        <Link
          to="/teachers/new"
          className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </Link>
      </div>

      <div className="erp-panel flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Teacher name, subject, or phone..."
            aria-label="Search teachers"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter teacher status"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="erp-card">
        <div className="erp-table-wrap hidden xl:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone / Joined</th>
                <th>Qualification / Subject</th>
                <th>Monthly Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                teachers.map((t) => {
                  const waPhone = formatPhoneForWhatsapp(t.phone);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="font-semibold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-400">S/O {t.fatherName}</div>
                      </td>
                      <td>
                        <div className="font-mono-num text-xs whitespace-nowrap">{t.phone}</div>
                        <div className="text-[11px] text-slate-400 whitespace-nowrap">{formatDisplayDate(t.joiningDate)}</div>
                      </td>
                      <td>
                        <div className="text-slate-900">{t.subjectClass}</div>
                        <div className="text-[11px] text-slate-400">{t.qualification}</div>
                      </td>
                      <td className="tabular-nums font-bold">{formatMoney(t.salary)}</td>
                      <td>
                        <span className={`status-label ${t.status === 'Active' ? 'is-active' : 'is-inactive'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            to={`/teachers/${t.id}/edit`}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </Link>
                          <a
                            href={`tel:${t.phone}`}
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
                            <MessageCircle className="w-3.5 h-3.5" /> WA
                          </a>
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
          ) : teachers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No teachers found.</div>
          ) : (
            teachers.map((t) => {
              const waPhone = formatPhoneForWhatsapp(t.phone);
              return (
                <div key={t.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {t.subjectClass} · {t.qualification} · {t.phone}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="tabular-nums font-bold text-sm text-slate-900">
                        {formatMoney(t.salary)}
                      </div>
                      <span className={`status-label ${t.status === 'Active' ? 'is-active' : 'is-inactive'}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Link
                      to={`/teachers/${t.id}/edit`}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <a
                      href={`tel:${t.phone}`}
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
                      <MessageCircle className="w-3.5 h-3.5" /> WA
                    </a>
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

export function TeacherFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    cnic: '',
    phone: '',
    qualification: '',
    subjectClass: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    salary: 25000,
    status: 'Active',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    teachersApi
      .getTeacherById(id)
      .then((t) => setForm(t))
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidPhone(form.phone)) {
      setError('Please enter a valid phone number (e.g. 0300-1234567)');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await teachersApi.updateTeacher(id, form);
      } else {
        await teachersApi.createTeacher(form);
      }
      addToast('Teacher record saved');
      navigate('/teachers');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <Link
          to="/teachers"
          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Teachers List
        </Link>
        <h1 className="font-display font-bold text-xl text-slate-900 mt-1">
          {isEdit ? 'Edit Teacher Details' : 'Add New Teacher'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="erp-panel flex flex-col gap-4">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="t-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Teacher Name *
            </label>
            <input
              id="t-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="t-father" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Father Name *
            </label>
            <input
              id="t-father"
              type="text"
              required
              value={form.fatherName}
              onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="t-cnic" className="block text-xs font-semibold text-slate-700 mb-1.5">
              CNIC
            </label>
            <input
              id="t-cnic"
              type="text"
              value={form.cnic}
              onChange={(e) => setForm({ ...form, cnic: e.target.value })}
              placeholder="35201-1234567-1"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-mono-num"
            />
          </div>
          <div>
            <label htmlFor="t-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone *
            </label>
            <input
              id="t-phone"
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0300-1234567"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-mono-num"
            />
          </div>
          <div>
            <label htmlFor="t-qual" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Qualification
            </label>
            <input
              id="t-qual"
              type="text"
              value={form.qualification}
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              placeholder="M.Sc / B.Ed"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="t-sub" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject / Class
            </label>
            <input
              id="t-sub"
              type="text"
              value={form.subjectClass}
              onChange={(e) => setForm({ ...form, subjectClass: e.target.value })}
              placeholder="Mathematics (Class 8-10)"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="t-join" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Joining Date
            </label>
            <input
              id="t-join"
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="t-salary" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Monthly Salary (Rs.) *
            </label>
            <input
              id="t-salary"
              type="number"
              min="0"
              required
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-mono-num"
            />
          </div>
          <div>
            <label htmlFor="t-status" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status
            </label>
            <select
              id="t-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Link
            to="/teachers"
            className="h-10 px-5 rounded-xl border border-slate-200 text-sm font-medium inline-flex items-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Teacher
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import * as studentsApi from '../api/students';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { formatBFormInput, isValidBForm, isValidPhone } from '../utils/erpLogic';

export default function StudentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { classes } = useSettings();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    classId: 'c0',
    phone: '',
    familyNo: '',
    admissionDate: new Date().toISOString().slice(0, 10),
    bForm: '',
    status: 'Active',
    monthlyFee: 2500,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit && classes.length > 0 && !form.monthlyFee) {
      setForm((prev) => ({
        ...prev,
        classId: classes[0].id,
        monthlyFee: classes[0].monthlyFee,
      }));
    }
  }, [classes, isEdit, form.monthlyFee]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    studentsApi
      .getStudentById(id)
      .then((s) => {
        setForm({
          name: s.name,
          fatherName: s.fatherName,
          classId: s.classId,
          phone: s.phone,
          familyNo: s.familyNo,
          admissionDate: s.admissionDate,
          bForm: s.bForm,
          status: s.status,
          monthlyFee: s.monthlyFee,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleClassChange = (newClassId) => {
    const cls = classes.find((c) => c.id === newClassId);
    setForm((prev) => ({
      ...prev,
      classId: newClassId,
      monthlyFee: cls ? cls.monthlyFee : prev.monthlyFee,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.fatherName.trim()) {
      setError('Student name and father name are required');
      return;
    }
    if (!form.familyNo.trim()) {
      setError('Family Number cannot be empty');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError('Please enter a valid Phone / WhatsApp number (e.g. 0300-1234567)');
      return;
    }
    if (!isValidBForm(form.bForm)) {
      setError('B-Form must be 13 digits (e.g. 35202-1234567-1)');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await studentsApi.updateStudent(id, form);
      } else {
        await studentsApi.createStudent(form);
      }
      addToast('Student record saved');
      navigate('/students');
    } catch (err) {
      setError(err.message || 'Failed to save student record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="erp-panel text-sm text-slate-500">Loading student details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            to="/students"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Students List
          </Link>
          <h1 className="font-display font-bold text-xl text-slate-900 mt-1">
            {isEdit ? 'Edit Student Details' : 'Add New Student'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="erp-panel flex flex-col gap-5">
        {error && (
          <div role="alert" className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stu-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Student Name *
            </label>
            <input
              id="stu-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Zainab Fatima"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="stu-father" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Father Name *
            </label>
            <input
              id="stu-father"
              type="text"
              required
              value={form.fatherName}
              onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
              placeholder="e.g. Tariq Mahmood"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="stu-class" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Class *
            </label>
            <select
              id="stu-class"
              value={form.classId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stu-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone / WhatsApp Number *
            </label>
            <input
              id="stu-phone"
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0300-1234567"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-mono-num focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="stu-family" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Family Number * (Links siblings together)
            </label>
            <input
              id="stu-family"
              type="text"
              required
              value={form.familyNo}
              onChange={(e) => setForm({ ...form, familyNo: e.target.value })}
              placeholder="FAM-101"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-mono-num focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="stu-bform" className="block text-xs font-semibold text-slate-700 mb-1.5">
              B-Form Number * (13 Digits)
            </label>
            <input
              id="stu-bform"
              type="text"
              required
              value={form.bForm}
              onChange={(e) => setForm({ ...form, bForm: formatBFormInput(e.target.value) })}
              placeholder="35202-1234567-1"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-mono-num focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="stu-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admission Date *
            </label>
            <input
              id="stu-date"
              type="date"
              required
              value={form.admissionDate}
              onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="stu-fee" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Monthly Fee (Rs.) *
            </label>
            <input
              id="stu-fee"
              type="number"
              min="0"
              required
              value={form.monthlyFee}
              onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-mono-num focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="stu-status" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status *
            </label>
            <select
              id="stu-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Link
            to="/students"
            className="h-10 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium inline-flex items-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Student'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

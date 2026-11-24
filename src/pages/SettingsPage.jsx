import { useEffect, useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { settings, classes, saveSettings, resetDemo } = useSettings();
  const { addToast } = useToast();

  const [schoolForm, setSchoolForm] = useState({
    schoolName: '',
    address: '',
    phone: '',
    dueDay: 10,
    lateFeeType: 'fixed',
    lateFeeAmount: 200,
    lateFeeMax: 500,
    whatsappTemplate: '',
  });
  const [classList, setClassList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setSchoolForm(settings);
    }
    if (classes) {
      setClassList(classes.map((c) => ({ ...c })));
    }
  }, [settings, classes]);

  const handleFeeChange = (id, fee) => {
    setClassList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, monthlyFee: Number(fee) } : c))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings({ settings: schoolForm, classes: classList });
      addToast('Settings saved successfully');
    } catch (err) {
      addToast(err?.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    setSaving(true);
    try {
      await resetDemo();
      addToast('Demo data has been reset');
    } catch (err) {
      addToast(err?.message || 'Failed to reset demo data', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            School details, class fee structure, due date, late fee rules, and WhatsApp template
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDemo}
          disabled={saving}
          className="h-10 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset Demo Data
        </button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* School Info */}
        <section className="erp-panel flex flex-col gap-4">
          <h2 className="font-display font-bold text-base text-slate-900">School Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="set-sname" className="block text-xs font-semibold text-slate-700 mb-1.5">
                School Name
              </label>
              <input
                id="set-sname"
                type="text"
                required
                value={schoolForm.schoolName}
                onChange={(e) => setSchoolForm({ ...schoolForm, schoolName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label htmlFor="set-addr" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Address
              </label>
              <input
                id="set-addr"
                type="text"
                value={schoolForm.address}
                onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label htmlFor="set-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone
              </label>
              <input
                id="set-phone"
                type="text"
                value={schoolForm.phone}
                onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
              />
            </div>
          </div>
        </section>

        {/* Due Date & Late Fee Rule */}
        <section className="erp-panel flex flex-col gap-4">
          <h2 className="font-display font-bold text-base text-slate-900">Due Date & Late Fee Rule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="set-dueday" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Due Day (Day of Month)
              </label>
              <input
                id="set-dueday"
                type="number"
                min="1"
                max="28"
                value={schoolForm.dueDay}
                onChange={(e) => setSchoolForm({ ...schoolForm, dueDay: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
              />
            </div>
            <div>
              <label htmlFor="set-lft" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Late Fee Type
              </label>
              <select
                id="set-lft"
                value={schoolForm.lateFeeType}
                onChange={(e) => setSchoolForm({ ...schoolForm, lateFeeType: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="fixed">Fixed (One Time)</option>
                <option value="daily">Daily (Per Day)</option>
              </select>
            </div>
            <div>
              <label htmlFor="set-lfa" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Late Fee Amount (Rs.)
              </label>
              <input
                id="set-lfa"
                type="number"
                min="0"
                value={schoolForm.lateFeeAmount}
                onChange={(e) => setSchoolForm({ ...schoolForm, lateFeeAmount: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
              />
            </div>
            <div>
              <label htmlFor="set-lfm" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maximum Cap (Max Rs.)
              </label>
              <input
                id="set-lfm"
                type="number"
                min="0"
                value={schoolForm.lateFeeMax}
                onChange={(e) => setSchoolForm({ ...schoolForm, lateFeeMax: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
              />
            </div>
          </div>
        </section>

        {/* Class-wise Fee Structure */}
        <section className="erp-panel flex flex-col gap-4">
          <h2 className="font-display font-bold text-base text-slate-900">Class Fee Structure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {classList.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
              >
                <label htmlFor={`fee-${cls.id}`} className="text-xs font-semibold text-slate-700">
                  {cls.name}
                </label>
                <input
                  id={`fee-${cls.id}`}
                  type="number"
                  min="0"
                  value={cls.monthlyFee}
                  onChange={(e) => handleFeeChange(cls.id, e.target.value)}
                  className="w-28 h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-sm font-mono-num text-right"
                />
              </div>
            ))}
          </div>
        </section>

        {/* WhatsApp Template */}
        <section className="erp-panel flex flex-col gap-3">
          <label htmlFor="set-wa" className="font-display font-bold text-base text-slate-900">
            WhatsApp Reminder Template
          </label>
          <textarea
            id="set-wa"
            rows={3}
            value={schoolForm.whatsappTemplate}
            onChange={(e) => setSchoolForm({ ...schoolForm, whatsappTemplate: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm"
          />
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white font-display font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import * as whatsappApi from '../api/whatsapp';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import {
  buildWhatsappReminderText,
  formatDisplayDate,
  formatMoney,
  formatMonthLabel,
  formatPhoneForWhatsapp,
} from '../utils/erpLogic';

export default function WhatsappPage() {
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [list, setList] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settings?.whatsappTemplate && !template) {
      setTemplate(settings.whatsappTemplate);
    }
  }, [settings, template]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await whatsappApi.getPendingReminders();
      setList(res);
      setSelectedIds(new Set(res.map((r) => r.studentId)));
    } catch (err) {
      addToast(err?.message || 'Failed to load reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAll = () => {
    if (selectedIds.size === list.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(list.map((r) => r.studentId)));
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async (row) => {
    try {
      const text = buildWhatsappReminderText({
        template,
        studentName: row.studentName,
        fatherName: row.fatherName,
        className: row.className,
        monthLabel: formatMonthLabel(row.latestMonth),
        amount: row.totalDue,
        dueDate: row.dueDate,
      });
      const waPhone = formatPhoneForWhatsapp(row.phone);
      await whatsappApi.logReminder({ studentId: row.studentId, month: row.latestMonth });
      addToast(`Opening WhatsApp message for ${row.studentName}`);
      window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      load();
    } catch (err) {
      addToast(err?.message || 'Failed to send WhatsApp reminder', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl text-slate-900">WhatsApp Fee Reminders</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Send WhatsApp fee reminders to students with pending fees in one click
        </p>
      </div>

      {/* Template Editor */}
      <div className="erp-panel flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="wa-template" className="text-xs font-bold text-slate-700">
            Message Template (Placeholders: {'{father_name}'}, {'{student_name}'}, {'{class}'}, {'{month}'}, {'{amount}'}, {'{due_date}'})
          </label>
        </div>
        <textarea
          id="wa-template"
          rows={3}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Pending List */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={list.length > 0 && selectedIds.size === list.length}
                onChange={toggleAll}
                className="w-4 h-4 accent-blue-400"
              />
              <span>Select All ({selectedIds.size}/{list.length})</span>
            </label>
          </div>
          <span className="text-xs text-blue-200">Click &ldquo;Send&rdquo; to open WhatsApp</span>
        </div>

        <div className="erp-table-wrap hidden xl:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>Student / Father</th>
                <th>Class</th>
                <th>Pending Amount</th>
                <th>Phone</th>
                <th>Last Reminder</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                    No students have pending fees!
                  </td>
                </tr>
              ) : (
                list.map((row) => (
                  <tr key={row.studentId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.studentId)}
                        onChange={() => toggleOne(row.studentId)}
                        aria-label={`Select ${row.studentName}`}
                        className="w-4 h-4 accent-blue-600"
                      />
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{row.studentName}</div>
                      <div className="text-[11px] text-slate-400">Father: {row.fatherName}</div>
                    </td>
                    <td>{row.className}</td>
                    <td className="tabular-nums font-bold text-red-600">{formatMoney(row.totalDue)}</td>
                    <td className="font-mono-num text-xs">{row.phone}</td>
                    <td className="text-xs">
                      {row.lastSentAt ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {formatDisplayDate(row.lastSentAt)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not sent yet</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleSend(row)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Send</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stacked Card View (< xl) */}
        <div className="xl:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No students have pending fees!</div>
          ) : (
            list.map((row) => (
              <div key={row.studentId} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.studentId)}
                      onChange={() => toggleOne(row.studentId)}
                      aria-label={`Select ${row.studentName}`}
                      className="w-4 h-4 accent-blue-600 mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm text-slate-900">{row.studentName}</div>
                      <div className="text-xs text-slate-500">
                        Father: {row.fatherName} · {row.className} · {row.phone}
                      </div>
                    </div>
                  </div>
                  <div className="tabular-nums font-bold text-sm text-red-600 shrink-0">
                    {formatMoney(row.totalDue)}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 pl-6">
                  <div className="text-xs">
                    {row.lastSentAt ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sent {formatDisplayDate(row.lastSentAt)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Not sent yet</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSend(row)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

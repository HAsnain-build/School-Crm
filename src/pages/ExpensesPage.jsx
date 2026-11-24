import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart2, Edit3, FolderPlus, Plus, Search, Trash2 } from 'lucide-react';
import * as expensesApi from '../api/expenses';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { formatDisplayDate, formatMoney, formatMonthLabel } from '../utils/erpLogic';

const MONTHS = ['', '2026-12', '2026-11', '2026-10', '2026-09'];

export default function ExpensesPage() {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [month, setMonth] = useState('2026-11');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    categoryId: '',
    payee: '',
    amount: '',
    note: '',
  });
  const [newCatName, setNewCatName] = useState('');
  const [catModalOpen, setCatModalOpen] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [exList, cats] = await Promise.all([
        expensesApi.getExpenses({ month, categoryId, search }),
        expensesApi.getCategories(),
      ]);
      setExpenses(exList);
      setCategories(cats);
      return cats;
    } catch (err) {
      addToast(err?.message || 'Failed to load expenses', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll().then((cats) => {
      // Handle shortcut from Stock page (?new=1&category=Stock Purchase&note=...)
      if (searchParams.get('new') === '1') {
        const catName = searchParams.get('category');
        const matched = cats.find((c) => c.name.toLowerCase() === (catName || '').toLowerCase());
        setEditingId(null);
        setForm({
          date: new Date().toISOString().slice(0, 10),
          categoryId: matched?.id || cats[0]?.id || '',
          payee: searchParams.get('payee') || '',
          amount: '',
          note: searchParams.get('note') || '',
        });
        setModalOpen(true);
        const next = new URLSearchParams(searchParams);
        next.delete('new');
        next.delete('category');
        next.delete('payee');
        next.delete('note');
        setSearchParams(next, { replace: true });
      }
    });
  }, [month, categoryId, search]);

  const openNewModal = () => {
    setEditingId(null);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      categoryId: categories[0]?.id || '',
      payee: '',
      amount: '',
      note: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (ex) => {
    setEditingId(ex.id);
    setForm({
      date: ex.date,
      categoryId: ex.categoryId,
      payee: ex.payee,
      amount: String(ex.amount),
      note: ex.note || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await expensesApi.updateExpense(editingId, form);
        addToast('Expense updated');
      } else {
        await expensesApi.createExpense(form);
        addToast('New expense added');
      }
      setModalOpen(false);
      loadAll();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await expensesApi.deleteExpense(id);
      addToast('Expense deleted');
      loadAll();
    } catch (err) {
      addToast(err?.message || 'Failed to delete expense', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const cat = await expensesApi.createCategory({ name: newCatName });
      setNewCatName('');
      setCatModalOpen(false);
      addToast(`Category "${cat.name}" added`);
      const cats = await expensesApi.getCategories();
      setCategories(cats);
      setForm((prev) => ({ ...prev, categoryId: cat.id }));
    } catch (err) {
      addToast(err?.message || 'Failed to create category', 'error');
    }
  };

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Expenses</h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Total Expenses ({month ? formatMonthLabel(month) : 'All'}):{' '}
            <strong className="text-slate-900">{formatMoney(totalAmount)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/expenses/report"
            className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold inline-flex items-center gap-2"
          >
            <BarChart2 className="w-4 h-4" /> Monthly Report
          </Link>
          <button
            type="button"
            onClick={() => setCatModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" /> Add Category
          </button>
          <button
            type="button"
            onClick={openNewModal}
            className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="erp-panel flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Payee, details, or category..."
            aria-label="Search expenses"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          aria-label="Filter expense month"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
        >
          {MONTHS.map((m) => (
            <option key={m || 'all'} value={m}>
              {m ? formatMonthLabel(m) : 'All Months'}
            </option>
          ))}
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="Filter expense category"
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="erp-card">
        <div className="erp-table-wrap hidden lg:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Payee</th>
                <th>Details / Note</th>
                <th>Amount</th>
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
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((ex) => (
                  <tr key={ex.id}>
                    <td>{formatDisplayDate(ex.date)}</td>
                    <td className="font-medium text-slate-700">{ex.categoryName}</td>
                    <td className="font-semibold text-slate-900">{ex.payee}</td>
                    <td className="text-slate-600">{ex.note || '—'}</td>
                    <td className="tabular-nums font-bold text-slate-900">
                      {formatMoney(ex.amount)}
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(ex)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ex.id)}
                          aria-label={`Delete ${ex.payee}`}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stacked Card View (< lg) */}
        <div className="lg:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No expense records found.</div>
          ) : (
            expenses.map((ex) => (
              <div key={ex.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm text-slate-900">{ex.payee}</div>
                    <div className="text-xs text-slate-500">
                      {ex.categoryName} · {formatDisplayDate(ex.date)}
                    </div>
                  </div>
                  <div className="tabular-nums font-bold text-sm text-slate-900 shrink-0">
                    {formatMoney(ex.amount)}
                  </div>
                </div>
                {ex.note && <div className="text-xs text-slate-600">{ex.note}</div>}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(ex)}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ex.id)}
                    aria-label={`Delete ${ex.payee}`}
                    className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ex-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date *
              </label>
              <input
                id="ex-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label htmlFor="ex-cat" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                id="ex-cat"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ex-payee" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paid To (Payee) *
            </label>
            <input
              id="ex-payee"
              type="text"
              required
              value={form.payee}
              onChange={(e) => setForm({ ...form, payee: e.target.value })}
              placeholder="e.g. LESCO / Urdu Bazar Book Depot"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label htmlFor="ex-amount" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Amount (Rs.) *
            </label>
            <input
              id="ex-amount"
              type="number"
              min="1"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
            />
          </div>

          <div>
            <label htmlFor="ex-note" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Details / Note
            </label>
            <input
              id="ex-note"
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Electricity bill or library books"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-[#0066eb] text-white text-xs font-semibold cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>

      {/* New Category Modal */}
      <Modal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title="Add New Expense Category"
      >
        <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
          <div>
            <label htmlFor="new-cat-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category Name *
            </label>
            <input
              id="new-cat-name"
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Generator Diesel / School Events"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCatModalOpen(false)}
              className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-[#0066eb] text-white text-xs font-semibold cursor-pointer"
            >
              Add Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

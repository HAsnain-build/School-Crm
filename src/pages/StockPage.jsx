import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FolderPlus, Minus, Plus, Receipt } from 'lucide-react';
import * as stockApi from '../api/stock';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { formatDisplayDate } from '../utils/erpLogic';

export default function StockPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [groups, setGroups] = useState(['Library', 'Uniform', 'Other']);
  const [activeGroup, setActiveGroup] = useState('Library');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newItemOpen, setNewItemOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', quantity: 10, group: 'Library' });

  const [newTabOpen, setNewTabOpen] = useState(false);
  const [tabName, setTabName] = useState('');

  const [adjustTarget, setAdjustTarget] = useState(null); // { item, mode: 'add' | 'sub' }
  const [adjustQty, setAdjustQty] = useState(5);
  const [logExpenseShortcut, setLogExpenseShortcut] = useState(true);

  const load = async (grp) => {
    setLoading(true);
    try {
      const res = await stockApi.getStock({ group: grp });
      setGroups(res.groups);
      setItems(res.items);
    } catch (err) {
      addToast(err?.message || 'Failed to load stock', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeGroup);
  }, [activeGroup]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await stockApi.createStockItem({
        group: itemForm.group || activeGroup,
        name: itemForm.name,
        quantity: itemForm.quantity,
      });
      addToast('New stock item added');
      setNewItemOpen(false);
      setItemForm({ name: '', quantity: 10, group: activeGroup });
      load(activeGroup);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAddTab = async (e) => {
    e.preventDefault();
    if (!tabName.trim()) return;
    try {
      const updated = await stockApi.createStockGroup({ name: tabName });
      setGroups(updated);
      setActiveGroup(tabName.trim());
      setTabName('');
      setNewTabOpen(false);
      addToast('New stock tab created');
    } catch (err) {
      addToast(err?.message || 'Failed to create tab', 'error');
    }
  };

  const openAdjust = (item, mode) => {
    setAdjustTarget({ item, mode });
    setAdjustQty(5);
    setLogExpenseShortcut(mode === 'add');
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const qty = Math.max(1, Math.round(Number(adjustQty) || 0));
    const delta = adjustTarget.mode === 'add' ? qty : -qty;
    try {
      await stockApi.adjustStock(adjustTarget.item.id, { delta });
      addToast(
        adjustTarget.mode === 'add'
          ? `Added ${qty} to ${adjustTarget.item.name}`
          : `Removed ${qty} from ${adjustTarget.item.name}`
      );
      const itemName = adjustTarget.item.name;
      const shouldLog = adjustTarget.mode === 'add' && logExpenseShortcut;
      setAdjustTarget(null);
      if (shouldLog) {
        navigate(
          `/expenses?new=1&category=${encodeURIComponent('Stock Purchase')}&note=${encodeURIComponent(
            `${itemName} (+${qty} units)`
          )}`
        );
      } else {
        load(activeGroup);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Stock Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track Library, Uniform, and Other items · Yellow badge shown when quantity is under 5
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setNewTabOpen(true)}
            className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" /> Add Tab
          </button>
          <button
            type="button"
            onClick={() => {
              setItemForm({ name: '', quantity: 10, group: activeGroup });
              setNewItemOpen(true);
            }}
            className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl w-fit">
        {groups.map((grp) => (
          <button
            key={grp}
            type="button"
            onClick={() => setActiveGroup(grp)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeGroup === grp
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="erp-card">
        <div className="erp-table-wrap hidden sm:block">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-xs text-slate-500">
                    No items found in this tab.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.quantity < 5;
                  return (
                    <tr key={item.id}>
                      <td className="font-semibold text-slate-900">{item.name}</td>
                      <td>
                        <div className="inline-flex flex-wrap items-center gap-2">
                          <span
                            className={`font-mono-num font-bold text-sm ${
                              isLow ? 'text-amber-700' : 'text-slate-900'
                            }`}
                          >
                            {item.quantity}
                          </span>
                          {isLow && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{formatDisplayDate(item.updatedAt)}</td>
                      <td>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openAdjust(item, 'add')}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Stock
                          </button>
                          <button
                            type="button"
                            onClick={() => openAdjust(item, 'sub')}
                            className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" /> Reduce Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Stacked Mobile View (< sm) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No items found in this tab.</div>
          ) : (
            items.map((item) => {
              const isLow = item.quantity < 5;
              return (
                <div key={item.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display font-bold text-sm text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">
                        Updated: {formatDisplayDate(item.updatedAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono-num font-bold text-base ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                        {item.quantity}
                      </div>
                      {isLow && <div className="text-[11px] font-semibold text-amber-700">Low Stock</div>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openAdjust(item, 'add')}
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => openAdjust(item, 'sub')}
                      className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" /> Reduce Stock
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal open={newItemOpen} onClose={() => setNewItemOpen(false)} title="Add Stock Item">
        <form onSubmit={handleAddItem} className="flex flex-col gap-4">
          <div>
            <label htmlFor="st-grp" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Group / Tab
            </label>
            <select
              id="st-grp"
              value={itemForm.group}
              onChange={(e) => setItemForm({ ...itemForm, group: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="st-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Item Name *
            </label>
            <input
              id="st-name"
              type="text"
              required
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="e.g. Science Lab Notebooks"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="st-qty" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Initial Quantity *
            </label>
            <input
              id="st-qty"
              type="number"
              min="0"
              required
              value={itemForm.quantity}
              onChange={(e) => setItemForm({ ...itemForm, quantity: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewItemOpen(false)}
              className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-[#0066eb] text-white text-xs font-semibold cursor-pointer"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>

      {/* New Tab Modal */}
      <Modal open={newTabOpen} onClose={() => setNewTabOpen(false)} title="Create Stock Tab">
        <form onSubmit={handleAddTab} className="flex flex-col gap-4">
          <div>
            <label htmlFor="tab-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tab Name *
            </label>
            <input
              id="tab-name"
              type="text"
              required
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              placeholder="e.g. Sports / Science Lab"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewTabOpen(false)}
              className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-[#0066eb] text-white text-xs font-semibold cursor-pointer"
            >
              Create Tab
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        open={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        title={
          adjustTarget
            ? `${adjustTarget.mode === 'add' ? 'Add Stock' : 'Reduce Stock'} — ${adjustTarget.item.name}`
            : 'Adjust Stock'
        }
      >
        {adjustTarget && (
          <form onSubmit={handleAdjustSubmit} className="flex flex-col gap-4">
            <div className="text-xs text-slate-600">
              Current Stock: <strong className="font-mono-num text-slate-900">{adjustTarget.item.quantity}</strong>
            </div>

            <div>
              <label htmlFor="adj-qty" className="block text-xs font-semibold text-slate-700 mb-1.5">
                How many units to {adjustTarget.mode === 'add' ? 'add' : 'remove'}? *
              </label>
              <input
                id="adj-qty"
                type="number"
                min="1"
                max={adjustTarget.mode === 'sub' ? adjustTarget.item.quantity : undefined}
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
              />
            </div>

            {adjustTarget.mode === 'add' && (
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logExpenseShortcut}
                  onChange={(e) => setLogExpenseShortcut(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="flex items-center gap-1.5 font-medium">
                  <Receipt className="w-4 h-4 text-blue-600 shrink-0" />
                  Record as expense (Opens Expenses form — Category: Stock Purchase)
                </span>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustTarget(null)}
                className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-lg bg-[#0066eb] text-white text-xs font-semibold cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

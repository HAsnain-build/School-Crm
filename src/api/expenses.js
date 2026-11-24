import { readDb, writeDb, withAuthDelay, apiError } from '../data/mockDb';

export async function getExpenses({ month = '', categoryId = '', search = '' } = {}) {
  return withAuthDelay(() => {
    const db = readDb();
    const catMap = Object.fromEntries(db.expenseCategories.map((c) => [c.id, c.name]));
    const q = search.trim().toLowerCase();

    return db.expenses
      .map((e) => ({
        ...e,
        categoryName: catMap[e.categoryId] || 'Other',
      }))
      .filter((e) => {
        if (month && !e.date.startsWith(month)) return false;
        if (categoryId && e.categoryId !== categoryId) return false;
        if (q) {
          const hay = `${e.payee} ${e.note} ${e.categoryName}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, 100);
}

export async function createExpense(payload) {
  return withAuthDelay(() => {
    if (!payload.payee?.trim()) throw apiError(400, 'Payee name is required');
    const amount = Math.round(Number(payload.amount) || 0);
    if (amount <= 0) throw apiError(400, 'Amount must be greater than 0');

    const db = readDb();
    const newItem = {
      id: `ex_${Date.now()}`,
      date: payload.date || new Date().toISOString().slice(0, 10),
      categoryId: payload.categoryId,
      payee: payload.payee.trim(),
      amount,
      note: payload.note?.trim() || '',
    };
    db.expenses.unshift(newItem);
    writeDb(db);
    return newItem;
  }, 140);
}

export async function updateExpense(id, payload) {
  return withAuthDelay(() => {
    const db = readDb();
    const idx = db.expenses.findIndex((e) => e.id === id);
    if (idx === -1) throw apiError(404, 'Expense record not found');
    if (!payload.payee?.trim()) throw apiError(400, 'Payee name is required');
    const amount = Math.round(Number(payload.amount) || 0);
    if (amount <= 0) throw apiError(400, 'Amount must be greater than 0');

    db.expenses[idx] = {
      ...db.expenses[idx],
      date: payload.date,
      categoryId: payload.categoryId,
      payee: payload.payee.trim(),
      amount,
      note: payload.note?.trim() || '',
    };
    writeDb(db);
    return db.expenses[idx];
  }, 140);
}

export async function deleteExpense(id) {
  return withAuthDelay(() => {
    const db = readDb();
    db.expenses = db.expenses.filter((e) => e.id !== id);
    writeDb(db);
    return { ok: true };
  }, 100);
}

export async function getCategories() {
  return withAuthDelay(() => {
    const db = readDb();
    return db.expenseCategories;
  }, 60);
}

export async function createCategory({ name }) {
  return withAuthDelay(() => {
    if (!name?.trim()) throw apiError(400, 'Please enter a category name');
    const db = readDb();
    const exists = db.expenseCategories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) return exists;
    const cat = { id: `ec_${Date.now()}`, name: name.trim() };
    db.expenseCategories.push(cat);
    writeDb(db);
    return cat;
  }, 100);
}

export async function getExpenseReport(month = '2026-11') {
  return withAuthDelay(() => {
    const db = readDb();
    const catMap = Object.fromEntries(db.expenseCategories.map((c) => [c.id, c.name]));
    const monthExpenses = db.expenses.filter((e) => e.date.startsWith(month));
    const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);

    const byCategoryMap = {};
    const byPayeeMap = {};

    for (const e of monthExpenses) {
      const catName = catMap[e.categoryId] || 'Other';
      byCategoryMap[catName] = (byCategoryMap[catName] || 0) + e.amount;
      byPayeeMap[e.payee] = (byPayeeMap[e.payee] || 0) + e.amount;
    }

    const byCategory = Object.entries(byCategoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const byPayee = Object.entries(byPayeeMap)
      .map(([payee, amount]) => ({ payee, amount }))
      .sort((a, b) => b.amount - a.amount);

    const feeCollected = db.vouchers
      .filter((v) => v.month === month)
      .reduce((s, v) => s + (v.paid || 0), 0);

    const salaryPaid = db.salaryRecords
      .filter((r) => r.month === month && (r.status === 'Paid' || r.status === 'Di gayi'))
      .reduce((s, r) => s + (r.net || 0), 0);

    const netSavings = feeCollected - (salaryPaid + totalExpense);

    return {
      month,
      totalExpense,
      byCategory,
      byPayee,
      feeCollected,
      salaryPaid,
      netSavings,
    };
  }, 110);
}

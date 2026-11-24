import { readDb, withAuthDelay } from '../data/mockDb';

export async function getDashboardSummary(month = '2026-11') {
  return withAuthDelay(() => {
    const db = readDb();
    const totalStudents = db.students.length;
    const activeStudents = db.students.filter((s) => s.status === 'Active').length;
    const inactiveStudents = db.students.filter((s) => s.status === 'Inactive').length;

    const monthVouchers = db.vouchers.filter((v) => v.month === month);
    const feeCollected = monthVouchers.reduce((sum, v) => sum + (Number(v.paid) || 0), 0);
    const feePending = monthVouchers.reduce((sum, v) => sum + Math.max(0, (v.net || 0) - (v.paid || 0)), 0);

    const monthSalaries = db.salaryRecords.filter((s) => s.month === month);
    const isPaidSal = (s) => s.status === 'Paid' || s.status === 'Di gayi';
    const salariesPaidCount = monthSalaries.filter(isPaidSal).length;
    const salariesPendingCount = monthSalaries.filter((s) => !isPaidSal(s)).length;
    const salariesPaidAmount = monthSalaries
      .filter(isPaidSal)
      .reduce((sum, s) => sum + (Number(s.net) || 0), 0);
    const salariesPendingAmount = monthSalaries
      .filter((s) => !isPaidSal(s))
      .reduce((sum, s) => sum + (Number(s.net) || 0), 0);

    const monthExpenses = db.expenses.filter((e) => e.date.startsWith(month));
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return {
      month,
      totalStudents,
      activeStudents,
      inactiveStudents,
      feeCollected,
      feePending,
      salariesPaidCount,
      salariesPendingCount,
      salariesPaidAmount,
      salariesPendingAmount,
      totalExpenses,
    };
  }, 100);
}

export async function getClassCounts() {
  return withAuthDelay(() => {
    const db = readDb();
    return db.classes.map((cls) => {
      const classStudents = db.students.filter((s) => s.classId === cls.id);
      return {
        id: cls.id,
        name: cls.name,
        total: classStudents.length,
        active: classStudents.filter((s) => s.status === 'Active').length,
        inactive: classStudents.filter((s) => s.status === 'Inactive').length,
      };
    });
  }, 90);
}

export async function getDashboardRecent(month = '2026-11') {
  return withAuthDelay(() => {
    const db = readDb();
    const classMap = Object.fromEntries(db.classes.map((c) => [c.id, c.name]));
    const studentMap = Object.fromEntries(db.students.map((s) => [s.id, s]));
    const catMap = Object.fromEntries(db.expenseCategories.map((c) => [c.id, c.name]));

    const recentReceipts = [...db.receipts]
      .filter((r) => r.date.startsWith(month))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map((r) => {
        const stu = studentMap[r.studentId];
        return {
          ...r,
          studentName: stu?.name || 'Unknown',
          className: classMap[stu?.classId] || '—',
        };
      });

    const recentExpenses = [...db.expenses]
      .filter((e) => e.date.startsWith(month))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map((e) => ({
        ...e,
        categoryName: catMap[e.categoryId] || 'Other',
      }));

    // Top defaulters for quick call / WhatsApp on dashboard
    const pendingByStudent = {};
    for (const v of db.vouchers) {
      if (v.status !== 'Paid') {
        const due = Math.max(0, v.net - v.paid);
        if (due > 0) {
          if (!pendingByStudent[v.studentId]) {
            pendingByStudent[v.studentId] = { due: 0, voucherId: v.id };
          }
          pendingByStudent[v.studentId].due += due;
          pendingByStudent[v.studentId].voucherId = v.id;
        }
      }
    }

    const topDefaulters = Object.entries(pendingByStudent)
      .map(([studentId, info]) => {
        const stu = studentMap[studentId];
        if (!stu) return null;
        return {
          studentId,
          studentName: stu.name,
          className: classMap[stu.classId] || '—',
          phone: stu.phone,
          pending: info.due,
          voucherId: info.voucherId,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.pending - a.pending)
      .slice(0, 5);

    const lowStock = db.stockItems.filter((i) => i.quantity < 5);

    return {
      recentReceipts,
      recentExpenses,
      topDefaulters,
      lowStockCount: lowStock.length,
    };
  }, 100);
}

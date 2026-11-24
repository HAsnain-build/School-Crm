import { readDb, writeDb, withAuthDelay, apiError } from '../data/mockDb';
import {
  calculateLateFee,
  calculateVoucherNet,
  calculateWaiverAmount,
  computeFeeStatus,
} from '../utils/erpLogic';

export async function getFeeSummary(month = '2026-11') {
  return withAuthDelay(() => {
    const db = readDb();
    const list = db.vouchers.filter((v) => v.month === month);
    const totalFee = list.reduce((s, v) => s + (v.net || 0), 0);
    const collected = list.reduce((s, v) => s + (v.paid || 0), 0);
    const pending = list.reduce((s, v) => s + Math.max(0, (v.net || 0) - (v.paid || 0)), 0);
    const defaulterStudents = new Set(
      list.filter((v) => v.status !== 'Paid' && v.net - v.paid > 0).map((v) => v.studentId)
    );
    return {
      month,
      voucherCount: list.length,
      totalFee,
      collected,
      pending,
      defaultersCount: defaulterStudents.size,
    };
  }, 100);
}

export async function generateVouchers(month = '2026-11') {
  return withAuthDelay(() => {
    const db = readDb();
    const ymCompact = month.replace('-', '');
    const dueDay = String(db.settings.dueDay || 10).padStart(2, '0');
    const dueDate = `${month}-${dueDay}`;
    const activeStudents = db.students.filter((s) => s.status === 'Active');

    let seq = db.vouchers.length + 1;
    let createdCount = 0;

    for (const stu of activeStudents) {
      const exists = db.vouchers.some((v) => v.studentId === stu.id && v.month === month);
      if (exists) continue;

      // Sum prior unpaid balances as arrears
      const arrears = db.vouchers
        .filter((v) => v.studentId === stu.id && v.month < month && v.status !== 'Paid')
        .reduce((sum, v) => sum + Math.max(0, v.net - v.paid), 0);

      const tuition = Number(stu.monthlyFee) || 0;
      const net = calculateVoucherNet({ tuition, arrears, lateFee: 0, waiver: 0 });
      const voucherNo = `V-${ymCompact}-${String(seq).padStart(4, '0')}`;
      seq += 1;

      db.vouchers.unshift({
        id: `v_${ymCompact}_${stu.id}_${Date.now()}`,
        voucherNo,
        studentId: stu.id,
        month,
        dueDate,
        tuition,
        arrears,
        lateFee: 0,
        waiver: 0,
        waiverReason: '',
        net,
        paid: 0,
        status: computeFeeStatus(net, 0),
      });
      createdCount += 1;
    }

    writeDb(db);
    return { createdCount, month };
  }, 180);
}

export async function getVouchers({ month = '', classId = '', status = '', search = '' } = {}) {
  return withAuthDelay(() => {
    const db = readDb();
    const stuMap = Object.fromEntries(db.students.map((s) => [s.id, s]));
    const clsMap = Object.fromEntries(db.classes.map((c) => [c.id, c.name]));
    const q = search.trim().toLowerCase();

    return db.vouchers
      .map((v) => {
        const stu = stuMap[v.studentId];
        return {
          ...v,
          studentName: stu?.name || 'Unknown',
          fatherName: stu?.fatherName || '—',
          familyNo: stu?.familyNo || '—',
          phone: stu?.phone || '',
          classId: stu?.classId || '',
          className: clsMap[stu?.classId] || '—',
          balance: Math.max(0, v.net - v.paid),
        };
      })
      .filter((v) => {
        if (month && v.month !== month) return false;
        if (classId && v.classId !== classId) return false;
        if (status && v.status.toLowerCase() !== status.toLowerCase()) return false;
        if (q) {
          const hay = `${v.voucherNo} ${v.studentName} ${v.fatherName} ${v.familyNo}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.month.localeCompare(a.month) || a.voucherNo.localeCompare(b.voucherNo));
  }, 110);
}

export async function getVoucherById(id) {
  return withAuthDelay(() => {
    const db = readDb();
    const v = db.vouchers.find((item) => item.id === id);
    if (!v) throw apiError(404, 'Voucher not found');
    const stu = db.students.find((s) => s.id === v.studentId);
    const cls = db.classes.find((c) => c.id === stu?.classId);
    const voucherReceipts = db.receipts.filter((r) => r.voucherId === v.id);

    return {
      ...v,
      student: stu || null,
      studentName: stu?.name || 'Unknown',
      fatherName: stu?.fatherName || '—',
      familyNo: stu?.familyNo || '—',
      phone: stu?.phone || '',
      className: cls?.name || '—',
      balance: Math.max(0, v.net - v.paid),
      receipts: voucherReceipts,
    };
  }, 90);
}

export async function applyWaiver(voucherId, { mode = 'amount', value, reason }) {
  return withAuthDelay(() => {
    if (!reason || !reason.trim()) {
      throw apiError(400, 'Please enter a reason for the waiver');
    }
    const db = readDb();
    const v = db.vouchers.find((item) => item.id === voucherId);
    if (!v) throw apiError(404, 'Voucher not found');

    const base = v.tuition + v.arrears + v.lateFee;
    const waiver = calculateWaiverAmount({ baseAmount: base, mode, value });
    v.waiver = waiver;
    v.waiverReason = reason.trim();
    v.net = calculateVoucherNet({
      tuition: v.tuition,
      arrears: v.arrears,
      lateFee: v.lateFee,
      waiver: v.waiver,
    });
    v.status = computeFeeStatus(v.net, v.paid);
    writeDb(db);
    return v;
  }, 130);
}

export async function applyLateFee(month = '2026-11', asOfDateStr = '2026-11-23') {
  return withAuthDelay(() => {
    const db = readDb();
    let updatedCount = 0;
    for (const v of db.vouchers) {
      if (month && v.month !== month) continue;
      if (v.status === 'Paid') continue;
      const computed = calculateLateFee({
        dueDateStr: v.dueDate,
        asOfDateStr,
        status: v.status,
        ruleType: db.settings.lateFeeType,
        amount: db.settings.lateFeeAmount,
        maxCap: db.settings.lateFeeMax,
      });
      if (computed > v.lateFee) {
        v.lateFee = computed;
        v.net = calculateVoucherNet({
          tuition: v.tuition,
          arrears: v.arrears,
          lateFee: v.lateFee,
          waiver: v.waiver,
        });
        v.status = computeFeeStatus(v.net, v.paid);
        updatedCount += 1;
      }
    }
    writeDb(db);
    return { updatedCount };
  }, 150);
}

export async function collectFee(voucherId, { amount, method = 'Cash', date }) {
  return withAuthDelay(() => {
    const db = readDb();
    const v = db.vouchers.find((item) => item.id === voucherId);
    if (!v) throw apiError(404, 'Voucher not found');

    const remaining = Math.max(0, v.net - v.paid);
    const payAmt = Math.round(Number(amount) || 0);
    if (payAmt <= 0) {
      throw apiError(400, 'Amount must be greater than 0');
    }
    if (payAmt > remaining) {
      throw apiError(400, 'Amount cannot be more than the remaining balance');
    }

    v.paid += payAmt;
    v.status = computeFeeStatus(v.net, v.paid);

    const ymCompact = v.month.replace('-', '');
    const receiptNo = `R-${ymCompact}-${String(db.receipts.length + 1).padStart(4, '0')}`;
    const receipt = {
      id: `r_${Date.now()}`,
      receiptNo,
      voucherId: v.id,
      studentId: v.studentId,
      amount: payAmt,
      method,
      date: date || new Date().toISOString().slice(0, 10),
    };

    db.receipts.unshift(receipt);
    writeDb(db);

    const stu = db.students.find((s) => s.id === v.studentId);
    const cls = db.classes.find((c) => c.id === stu?.classId);
    return {
      receipt: {
        ...receipt,
        studentName: stu?.name || 'Unknown',
        fatherName: stu?.fatherName || '—',
        className: cls?.name || '—',
        month: v.month,
        voucherNo: v.voucherNo,
        voucherNet: v.net,
        voucherPaid: v.paid,
        remainingAfter: Math.max(0, v.net - v.paid),
      },
      voucher: v,
    };
  }, 150);
}

export async function getReceipts({ search = '', date = '' } = {}) {
  return withAuthDelay(() => {
    const db = readDb();
    const stuMap = Object.fromEntries(db.students.map((s) => [s.id, s]));
    const clsMap = Object.fromEntries(db.classes.map((c) => [c.id, c.name]));
    const vMap = Object.fromEntries(db.vouchers.map((v) => [v.id, v]));
    const q = search.trim().toLowerCase();

    return db.receipts
      .map((r) => {
        const stu = stuMap[r.studentId];
        const v = vMap[r.voucherId];
        return {
          ...r,
          studentName: stu?.name || 'Unknown',
          fatherName: stu?.fatherName || '—',
          className: clsMap[stu?.classId] || '—',
          month: v?.month || '',
          voucherNo: v?.voucherNo || '—',
          voucherNet: v?.net || r.amount,
          voucherPaid: v?.paid || r.amount,
          remainingAfter: v ? Math.max(0, v.net - v.paid) : 0,
        };
      })
      .filter((r) => {
        if (date && r.date !== date) return false;
        if (q) {
          const hay = `${r.receiptNo} ${r.studentName} ${r.fatherName} ${r.voucherNo}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, 100);
}

export async function getReceiptById(id) {
  return withAuthDelay(() => {
    const db = readDb();
    const r = db.receipts.find((item) => item.id === id);
    if (!r) throw apiError(404, 'Receipt not found');
    const stu = db.students.find((s) => s.id === r.studentId);
    const cls = db.classes.find((c) => c.id === stu?.classId);
    const v = db.vouchers.find((item) => item.id === r.voucherId);

    return {
      ...r,
      studentName: stu?.name || 'Unknown',
      fatherName: stu?.fatherName || '—',
      className: cls?.name || '—',
      month: v?.month || '',
      voucherNo: v?.voucherNo || '—',
      voucherNet: v?.net || r.amount,
      voucherPaid: v?.paid || r.amount,
      remainingAfter: v ? Math.max(0, v.net - v.paid) : 0,
    };
  }, 80);
}

export async function getDefaulters() {
  return withAuthDelay(() => {
    const db = readDb();
    const stuMap = Object.fromEntries(db.students.map((s) => [s.id, s]));
    const clsMap = Object.fromEntries(db.classes.map((c) => [c.id, c.name]));

    const grouped = {};
    for (const v of db.vouchers) {
      if (v.status !== 'Paid') {
        const due = Math.max(0, v.net - v.paid);
        if (due <= 0) continue;
        if (!grouped[v.studentId]) {
          grouped[v.studentId] = {
            studentId: v.studentId,
            monthsPending: [],
            totalDue: 0,
            latestVoucherId: v.id,
            latestDueDate: v.dueDate,
          };
        }
        grouped[v.studentId].monthsPending.push(v.month);
        grouped[v.studentId].totalDue += due;
        if (v.month >= (grouped[v.studentId].latestMonth || '')) {
          grouped[v.studentId].latestMonth = v.month;
          grouped[v.studentId].latestVoucherId = v.id;
          grouped[v.studentId].latestDueDate = v.dueDate;
        }
      }
    }

    return Object.values(grouped)
      .map((item) => {
        const stu = stuMap[item.studentId];
        if (!stu) return null;
        return {
          ...item,
          monthsCount: item.monthsPending.length,
          studentName: stu.name,
          fatherName: stu.fatherName,
          className: clsMap[stu.classId] || '—',
          phone: stu.phone,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.totalDue - a.totalDue);
  }, 110);
}

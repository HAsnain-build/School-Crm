import { readDb, writeDb, withAuthDelay, apiError } from '../data/mockDb';

function normalizeSalaryStatus(status) {
  if (status === 'Di gayi' || status === 'Paid') return 'Paid';
  return 'Pending';
}

export async function getSalaries(month = '2026-11') {
  return withAuthDelay(() => {
    const db = readDb();
    const tMap = Object.fromEntries(db.teachers.map((t) => [t.id, t]));
    const records = db.salaryRecords
      .filter((r) => r.month === month)
      .map((r) => {
        const teacher = tMap[r.teacherId];
        return {
          ...r,
          status: normalizeSalaryStatus(r.status),
          teacherName: teacher?.name || 'Unknown',
          phone: teacher?.phone || '',
          subjectClass: teacher?.subjectClass || '—',
        };
      });

    const totalSalary = records.reduce((s, r) => s + r.net, 0);
    const paidAmount = records.filter((r) => r.status === 'Paid').reduce((s, r) => s + r.net, 0);
    const pendingAmount = records.filter((r) => r.status === 'Pending').reduce((s, r) => s + r.net, 0);

    return {
      month,
      records,
      summary: {
        totalSalary,
        paidAmount,
        pendingAmount,
        paidCount: records.filter((r) => r.status === 'Paid').length,
        pendingCount: records.filter((r) => r.status === 'Pending').length,
      },
    };
  }, 110);
}

export async function generateSalaries(month = '2026-11') {
  return withAuthDelay(() => {
    const db = readDb();
    const activeTeachers = db.teachers.filter((t) => t.status === 'Active');
    let createdCount = 0;

    for (const t of activeTeachers) {
      const exists = db.salaryRecords.some((r) => r.teacherId === t.id && r.month === month);
      if (exists) continue;
      db.salaryRecords.push({
        id: `sal_${month.replace('-', '')}_${t.id}_${Date.now()}`,
        teacherId: t.id,
        month,
        basic: t.salary,
        deduction: 0,
        net: t.salary,
        status: 'Pending',
        paidDate: '',
        method: '',
      });
      createdCount += 1;
    }
    writeDb(db);
    return { createdCount, month };
  }, 150);
}

export async function paySalary(id, { paidDate, method = 'Cash', deduction = 0 }) {
  return withAuthDelay(() => {
    const db = readDb();
    const rec = db.salaryRecords.find((r) => r.id === id);
    if (!rec) throw apiError(404, 'Salary record not found');

    const ded = Math.max(0, Math.min(rec.basic, Math.round(Number(deduction) || 0)));
    rec.deduction = ded;
    rec.net = Math.max(0, rec.basic - ded);
    rec.status = 'Paid';
    rec.paidDate = paidDate || new Date().toISOString().slice(0, 10);
    rec.method = method;
    writeDb(db);
    return rec;
  }, 130);
}

export async function getSalarySlip(id) {
  return withAuthDelay(() => {
    const db = readDb();
    const rec = db.salaryRecords.find((r) => r.id === id);
    if (!rec) throw apiError(404, 'Salary slip not found');
    const teacher = db.teachers.find((t) => t.id === rec.teacherId);
    return {
      ...rec,
      status: normalizeSalaryStatus(rec.status),
      teacher: teacher || null,
    };
  }, 80);
}

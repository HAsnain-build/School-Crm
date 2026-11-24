import { readDb, writeDb, withAuthDelay } from '../data/mockDb';

export async function getPendingReminders() {
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
            totalDue: 0,
            latestMonth: v.month,
            dueDate: v.dueDate,
          };
        }
        grouped[v.studentId].totalDue += due;
        if (v.month >= grouped[v.studentId].latestMonth) {
          grouped[v.studentId].latestMonth = v.month;
          grouped[v.studentId].dueDate = v.dueDate;
        }
      }
    }

    const logMap = {};
    for (const l of db.reminderLogs || []) {
      logMap[l.studentId] = l.sentAt;
    }

    return Object.values(grouped)
      .map((item) => {
        const stu = stuMap[item.studentId];
        if (!stu) return null;
        return {
          ...item,
          studentName: stu.name,
          fatherName: stu.fatherName,
          className: clsMap[stu.classId] || '—',
          phone: stu.phone,
          lastSentAt: logMap[item.studentId] || null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.totalDue - a.totalDue);
  }, 100);
}

export async function logReminder({ studentId, month }) {
  return withAuthDelay(() => {
    const db = readDb();
    if (!db.reminderLogs) db.reminderLogs = [];
    const entry = {
      id: `rl_${Date.now()}`,
      studentId,
      month,
      sentAt: new Date().toISOString(),
    };
    db.reminderLogs.unshift(entry);
    writeDb(db);
    return entry;
  }, 80);
}

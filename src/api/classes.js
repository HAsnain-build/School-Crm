import { readDb, writeDb, withAuthDelay, apiError } from '../data/mockDb';

export async function getClasses() {
  return withAuthDelay(() => {
    const db = readDb();
    return db.classes.map((cls) => {
      const list = db.students.filter((s) => s.classId === cls.id);
      return {
        ...cls,
        totalStudents: list.length,
        activeStudents: list.filter((s) => s.status === 'Active').length,
        inactiveStudents: list.filter((s) => s.status === 'Inactive').length,
      };
    });
  }, 100);
}

export async function getClassById(id) {
  return withAuthDelay(() => {
    const db = readDb();
    const cls = db.classes.find((c) => c.id === id);
    if (!cls) throw apiError(404, 'Class not found');
    const students = db.students.filter((s) => s.classId === cls.id);
    return {
      ...cls,
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === 'Active').length,
      inactiveStudents: students.filter((s) => s.status === 'Inactive').length,
    };
  }, 80);
}

export async function updateClass(id, { monthlyFee }) {
  return withAuthDelay(() => {
    const db = readDb();
    const cls = db.classes.find((c) => c.id === id);
    if (!cls) throw apiError(404, 'Class not found');
    cls.monthlyFee = Math.max(0, Math.round(Number(monthlyFee) || 0));
    writeDb(db);
    return cls;
  }, 120);
}

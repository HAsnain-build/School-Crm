import { readDb, writeDb, withAuthDelay, apiError } from '../data/mockDb';
import { isValidPhone } from '../utils/erpLogic';

export async function getTeachers({ search = '', status = '' } = {}) {
  return withAuthDelay(() => {
    const db = readDb();
    const q = search.trim().toLowerCase();
    return db.teachers.filter((t) => {
      if (status && t.status.toLowerCase() !== status.toLowerCase()) return false;
      if (q) {
        const hay = `${t.name} ${t.fatherName} ${t.phone} ${t.subjectClass} ${t.qualification}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, 100);
}

export async function getTeacherById(id) {
  return withAuthDelay(() => {
    const db = readDb();
    const t = db.teachers.find((item) => item.id === id);
    if (!t) throw apiError(404, 'Teacher record not found');
    return t;
  }, 80);
}

export async function createTeacher(payload) {
  return withAuthDelay(() => {
    if (!payload.name?.trim() || !payload.fatherName?.trim()) {
      throw apiError(400, 'Teacher and father name are required');
    }
    if (!isValidPhone(payload.phone)) {
      throw apiError(400, 'Please enter a valid phone number');
    }
    const db = readDb();
    const newTeacher = {
      id: `t${Date.now()}`,
      name: payload.name.trim(),
      fatherName: payload.fatherName.trim(),
      cnic: payload.cnic?.trim() || '',
      phone: payload.phone.trim(),
      qualification: payload.qualification?.trim() || 'Graduate',
      subjectClass: payload.subjectClass?.trim() || 'General',
      joiningDate: payload.joiningDate || new Date().toISOString().slice(0, 10),
      salary: Math.max(0, Math.round(Number(payload.salary) || 0)),
      status: payload.status || 'Active',
    };
    db.teachers.unshift(newTeacher);
    writeDb(db);
    return newTeacher;
  }, 140);
}

export async function updateTeacher(id, payload) {
  return withAuthDelay(() => {
    const db = readDb();
    const idx = db.teachers.findIndex((t) => t.id === id);
    if (idx === -1) throw apiError(404, 'Teacher record not found');
    if (!payload.name?.trim() || !payload.fatherName?.trim()) {
      throw apiError(400, 'Teacher and father name are required');
    }
    if (!isValidPhone(payload.phone)) {
      throw apiError(400, 'Please enter a valid phone number');
    }
    db.teachers[idx] = {
      ...db.teachers[idx],
      name: payload.name.trim(),
      fatherName: payload.fatherName.trim(),
      cnic: payload.cnic?.trim() || '',
      phone: payload.phone.trim(),
      qualification: payload.qualification?.trim() || '',
      subjectClass: payload.subjectClass?.trim() || '',
      joiningDate: payload.joiningDate,
      salary: Math.max(0, Math.round(Number(payload.salary) || 0)),
      status: payload.status,
    };
    writeDb(db);
    return db.teachers[idx];
  }, 140);
}

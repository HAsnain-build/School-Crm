import { readDb, writeDb, withAuthDelay, apiError } from '../data/mockDb';
import { isValidBForm, isValidPhone } from '../utils/erpLogic';

export async function getStudents({ search = '', classId = '', status = '', feeStatus = '' } = {}) {
  return withAuthDelay(() => {
    const db = readDb();
    const classMap = Object.fromEntries(db.classes.map((c) => [c.id, c.name]));

    // Determine each student's latest fee status
    const pendingSet = new Set();
    for (const v of db.vouchers) {
      if (v.status !== 'Paid' && v.net - v.paid > 0) {
        pendingSet.add(v.studentId);
      }
    }

    const q = search.trim().toLowerCase();

    return db.students
      .map((s) => ({
        ...s,
        className: classMap[s.classId] || '—',
        feeStatus: pendingSet.has(s.id) ? 'Pending' : 'Paid',
      }))
      .filter((s) => {
        if (classId && s.classId !== classId) return false;
        if (status && s.status.toLowerCase() !== status.toLowerCase()) return false;
        if (feeStatus && s.feeStatus.toLowerCase() !== feeStatus.toLowerCase()) return false;
        if (q) {
          const hay = `${s.name} ${s.fatherName} ${s.phone} ${s.familyNo} ${s.bForm}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
  }, 110);
}

export async function getStudentById(id) {
  return withAuthDelay(() => {
    const db = readDb();
    const s = db.students.find((item) => item.id === id);
    if (!s) throw apiError(404, 'Student record not found');
    const cls = db.classes.find((c) => c.id === s.classId);
    const vouchers = db.vouchers
      .filter((v) => v.studentId === s.id)
      .sort((a, b) => b.month.localeCompare(a.month));
    const siblings = db.students
      .filter((other) => other.familyNo === s.familyNo && other.id !== s.id)
      .map((sib) => ({
        ...sib,
        className: db.classes.find((c) => c.id === sib.classId)?.name || '—',
      }));

    return {
      ...s,
      className: cls?.name || '—',
      vouchers,
      siblings,
    };
  }, 100);
}

export async function createStudent(payload) {
  return withAuthDelay(() => {
    const db = readDb();
    if (!payload.name?.trim() || !payload.fatherName?.trim()) {
      throw apiError(400, 'Student name and father name are required');
    }
    if (!payload.familyNo?.trim()) {
      throw apiError(400, 'Family number is required');
    }
    if (!isValidPhone(payload.phone)) {
      throw apiError(400, 'Please enter a valid phone number (03xx-xxxxxxx)');
    }
    if (!isValidBForm(payload.bForm)) {
      throw apiError(400, 'B-Form must be 13 digits (12345-1234567-1)');
    }

    const newStudent = {
      id: `s${Date.now()}`,
      name: payload.name.trim(),
      fatherName: payload.fatherName.trim(),
      classId: payload.classId,
      phone: payload.phone.trim(),
      familyNo: payload.familyNo.trim().toUpperCase(),
      admissionDate: payload.admissionDate || new Date().toISOString().slice(0, 10),
      bForm: payload.bForm.trim(),
      status: payload.status || 'Active',
      monthlyFee: Math.max(0, Math.round(Number(payload.monthlyFee) || 0)),
    };

    db.students.unshift(newStudent);
    writeDb(db);
    return newStudent;
  }, 150);
}

export async function updateStudent(id, payload) {
  return withAuthDelay(() => {
    const db = readDb();
    const idx = db.students.findIndex((s) => s.id === id);
    if (idx === -1) throw apiError(404, 'Student record not found');

    if (!payload.name?.trim() || !payload.fatherName?.trim()) {
      throw apiError(400, 'Student name and father name are required');
    }
    if (!payload.familyNo?.trim()) {
      throw apiError(400, 'Family number is required');
    }
    if (!isValidPhone(payload.phone)) {
      throw apiError(400, 'Please enter a valid phone number (03xx-xxxxxxx)');
    }
    if (!isValidBForm(payload.bForm)) {
      throw apiError(400, 'B-Form must be 13 digits (12345-1234567-1)');
    }

    db.students[idx] = {
      ...db.students[idx],
      name: payload.name.trim(),
      fatherName: payload.fatherName.trim(),
      classId: payload.classId,
      phone: payload.phone.trim(),
      familyNo: payload.familyNo.trim().toUpperCase(),
      admissionDate: payload.admissionDate,
      bForm: payload.bForm.trim(),
      status: payload.status,
      monthlyFee: Math.max(0, Math.round(Number(payload.monthlyFee) || 0)),
    };

    writeDb(db);
    return db.students[idx];
  }, 150);
}

export async function getFamilyMembers(familyNo) {
  return withAuthDelay(() => {
    const db = readDb();
    const classMap = Object.fromEntries(db.classes.map((c) => [c.id, c.name]));
    return db.students
      .filter((s) => s.familyNo === familyNo)
      .map((s) => ({ ...s, className: classMap[s.classId] || '—' }));
  }, 80);
}

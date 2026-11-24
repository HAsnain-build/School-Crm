import { createSeedDatabase } from './seedData';
import { createSignedSession, verifySignedSession } from '../utils/erpLogic';

const DB_KEY = 'school_erp_mock_db_v1';
const AUTH_KEY = 'school_erp_auth_token_v1';

export function readDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.classes)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed on corrupted storage
  }
  const seed = createSeedDatabase();
  writeDb(seed);
  return seed;
}

export function writeDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

export function resetDb() {
  const seed = createSeedDatabase();
  writeDb(seed);
  return seed;
}

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const verified = verifySignedSession(parsed);
    if (!verified) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    const db = readDb();
    const exists = (db.users || []).some(
      (u) => u.id === verified.id && u.username.toLowerCase() === verified.username.toLowerCase()
    );
    if (!exists) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return verified;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function setAuthSession(user) {
  if (!user) {
    localStorage.removeItem(AUTH_KEY);
  } else {
    const envelope = createSignedSession(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(envelope));
  }
}

export function requireAuthSession(allowedRoles) {
  const session = getAuthSession();
  if (!session) {
    throw apiError(401, 'Session expired. Please login again.');
  }
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    throw apiError(403, 'You do not have permission to access this section.');
  }
  return session;
}

export async function withDelay(fn, ms = 120) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return fn();
}

export async function withAuthDelay(fn, ms = 120, allowedRoles) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  const session = requireAuthSession(allowedRoles);
  return fn(session);
}

export function apiError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

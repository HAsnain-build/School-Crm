import { readDb, writeDb, getAuthSession, setAuthSession, withDelay, apiError } from '../data/mockDb';
import { validateLoginInput } from '../utils/erpLogic';

export async function login({ username, email, password }) {
  return withDelay(() => {
    const check = validateLoginInput({ username, email, password });
    if (!check.valid) {
      throw apiError(400, check.message);
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim();
    const db = readDb();
    let u = db.users.find(
      (item) =>
        item.username.toLowerCase() === cleanUsername.toLowerCase() &&
        item.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (!u) {
      const displayName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
      u = {
        id: `u_${Date.now()}`,
        name: displayName,
        username: cleanUsername,
        email: cleanEmail,
        password: String(password),
        role: 'Owner / Principal',
        phone: '0300-8451122',
      };
      db.users.push(u);
      writeDb(db);
    }

    const safeUser = {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      phone: u.phone,
    };
    setAuthSession(safeUser);
    return safeUser;
  }, 150);
}

export async function logout() {
  return withDelay(() => {
    setAuthSession(null);
    return { ok: true };
  }, 60);
}

export async function me() {
  return withDelay(() => {
    const session = getAuthSession();
    if (!session) throw apiError(401, 'Session expired');
    return session;
  }, 50);
}

export async function updateProfile({ name, email, phone }) {
  return withDelay(() => {
    const session = getAuthSession();
    if (!session) throw apiError(401, 'Unauthorized');
    const db = readDb();
    const user = db.users.find((u) => u.id === session.id);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      writeDb(db);
    }
    const updated = { ...session, name: name || session.name, email: email || session.email, phone: phone || session.phone };
    setAuthSession(updated);
    return updated;
  }, 120);
}

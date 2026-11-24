import { readDb, writeDb, resetDb, withAuthDelay } from '../data/mockDb';

export async function getSettings() {
  return withAuthDelay(() => {
    const db = readDb();
    return {
      settings: db.settings,
      classes: db.classes,
    };
  }, 80);
}

export async function updateSettings({ settings, classes }) {
  return withAuthDelay(() => {
    const db = readDb();
    if (settings) {
      db.settings = {
        ...db.settings,
        ...settings,
        dueDay: Math.max(1, Math.min(28, Number(settings.dueDay) || 10)),
        lateFeeAmount: Math.max(0, Math.round(Number(settings.lateFeeAmount) || 0)),
        lateFeeMax: Math.max(0, Math.round(Number(settings.lateFeeMax) || 0)),
      };
    }
    if (Array.isArray(classes)) {
      db.classes = classes.map((c) => ({
        ...c,
        monthlyFee: Math.max(0, Math.round(Number(c.monthlyFee) || 0)),
      }));
    }
    writeDb(db);
    return { settings: db.settings, classes: db.classes };
  }, 140);
}

export async function resetDemoData() {
  return withAuthDelay(() => {
    const fresh = resetDb();
    return { settings: fresh.settings, classes: fresh.classes };
  }, 180);
}

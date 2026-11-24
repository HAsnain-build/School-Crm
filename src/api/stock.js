import { readDb, writeDb, withAuthDelay, apiError } from '../data/mockDb';

export async function getStock({ group = '', search = '' } = {}) {
  return withAuthDelay(() => {
    const db = readDb();
    const q = search.trim().toLowerCase();
    const items = db.stockItems.filter((item) => {
      if (group && item.group !== group) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
    return {
      groups: db.stockGroups || ['Library', 'Uniform', 'Other'],
      items,
    };
  }, 100);
}

export async function createStockGroup({ name }) {
  return withAuthDelay(() => {
    if (!name?.trim()) throw apiError(400, 'Please enter a tab name');
    const db = readDb();
    const clean = name.trim();
    if (!db.stockGroups) db.stockGroups = ['Library', 'Uniform', 'Other'];
    if (!db.stockGroups.includes(clean)) {
      db.stockGroups.push(clean);
      writeDb(db);
    }
    return db.stockGroups;
  }, 90);
}

export async function createStockItem({ group, name, quantity }) {
  return withAuthDelay(() => {
    if (!name?.trim()) throw apiError(400, 'Item name is required');
    const db = readDb();
    const item = {
      id: `st_${Date.now()}`,
      group: group || 'Other',
      name: name.trim(),
      quantity: Math.max(0, Math.round(Number(quantity) || 0)),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    db.stockItems.unshift(item);
    writeDb(db);
    return item;
  }, 130);
}

export async function adjustStock(id, { delta }) {
  return withAuthDelay(() => {
    const db = readDb();
    const item = db.stockItems.find((i) => i.id === id);
    if (!item) throw apiError(404, 'Stock item not found');
    const nextQty = item.quantity + Math.round(Number(delta) || 0);
    if (nextQty < 0) throw apiError(400, 'Stock quantity cannot be less than 0');
    item.quantity = nextQty;
    item.updatedAt = new Date().toISOString().slice(0, 10);
    writeDb(db);
    return item;
  }, 100);
}

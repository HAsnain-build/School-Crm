export function formatMoney(amount) {
  const safe = Math.round(Number(amount) || 0);
  const sign = safe < 0 ? '-' : '';
  return `${sign}Rs. ${Math.abs(safe).toLocaleString('en-PK')}`;
}

export function formatPhoneForWhatsapp(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92') && digits.length >= 11) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return `92${digits.slice(1)}`;
  }
  return `92${digits}`;
}

export function isValidPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export function formatBFormInput(raw) {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function isValidBForm(bform) {
  return /^\d{5}-\d{7}-\d{1}$/.test(String(bform || '').trim());
}

export function calculateVoucherNet(params) {
  const tuition = Math.round(Number(params.tuition) || 0);
  const arrears = Math.round(Number(params.arrears) || 0);
  const lateFee = Math.round(Number(params.lateFee) || 0);
  const waiver = Math.round(Number(params.waiver) || 0);
  return Math.max(0, tuition + arrears + lateFee - waiver);
}

export function calculateWaiverAmount(params) {
  const base = Math.max(0, Math.round(Number(params.baseAmount) || 0));
  const val = Math.max(0, Number(params.value) || 0);
  const raw = params.mode === 'percent' ? Math.round((base * Math.min(100, val)) / 100) : Math.round(val);
  return Math.min(base, raw);
}

export function calculateLateFee(params) {
  if (params.status === 'Paid') return 0;
  const due = new Date(`${params.dueDateStr}T00:00:00`);
  const asOf = new Date(`${params.asOfDateStr}T00:00:00`);
  if (Number.isNaN(due.getTime()) || Number.isNaN(asOf.getTime())) return 0;
  const diffDays = Math.floor((asOf.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 0;
  const ruleAmount = Math.max(0, Math.round(Number(params.amount) || 0));
  const cap = Math.max(0, Math.round(Number(params.maxCap) || 0));
  const raw = params.ruleType === 'fixed' ? ruleAmount : diffDays * ruleAmount;
  return cap > 0 ? Math.min(cap, raw) : raw;
}

export function computeFeeStatus(net, paid) {
  const safeNet = Math.max(0, Math.round(Number(net) || 0));
  const safePaid = Math.max(0, Math.round(Number(paid) || 0));
  if (safeNet === 0 || safePaid >= safeNet) return 'Paid';
  if (safePaid > 0) return 'Partial';
  return 'Unpaid';
}

export function formatMonthLabel(ym) {
  const [y, m] = String(ym || '').split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const idx = Number(m) - 1;
  if (!y || idx < 0 || idx > 11) return ym;
  return `${monthNames[idx]} ${y}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function buildWhatsappReminderText(params) {
  return String(params.template || '')
    .replaceAll('{father_name}', params.fatherName)
    .replaceAll('{student_name}', params.studentName)
    .replaceAll('{class}', params.className)
    .replaceAll('{month}', params.monthLabel)
    .replaceAll('{amount}', Math.round(params.amount).toLocaleString('en-PK'))
    .replaceAll('{due_date}', formatDisplayDate(params.dueDate));
}

export function validateLoginInput(params) {
  const username = String(params.username || '').trim();
  const email = String(params.email || '').trim();
  const password = String(params.password || '');

  if (username.length < 2) {
    return { valid: false, message: 'Username must be at least 2 characters' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: 'Please enter a valid email address (e.g. name@gmail.com)' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  return { valid: true, message: '' };
}

export const ALLOWED_ERP_ROLES = ['Owner / Principal', 'Admin'];

export function isSafeInternalRedirect(target) {
  if (typeof target !== 'string') return '/';
  const trimmed = target.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return '/';
  }
  if (/^\/login(?:\?|$)/i.test(trimmed)) {
    return '/';
  }
  return trimmed;
}

function computeSessionDigest(payload) {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  const salted = `school_erp_v1::${payload}::guard`;
  for (let i = 0; i < salted.length; i += 1) {
    const code = salted.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

export function createSignedSession(user, nowMs = Date.now(), ttlMs = 12 * 60 * 60 * 1000) {
  const issuedAt = Math.floor(nowMs);
  const expiresAt = issuedAt + Math.max(60_000, Math.floor(ttlMs));
  const token = `tok_${issuedAt.toString(36)}_${computeSessionDigest(`${user.id}:${user.username}:${issuedAt}`)}`;
  const raw = `${user.id}|${user.username}|${user.email}|${user.role}|${token}|${issuedAt}|${expiresAt}`;
  const signature = computeSessionDigest(raw);
  return {
    user: {
      id: String(user.id),
      name: String(user.name),
      username: String(user.username),
      email: String(user.email),
      role: String(user.role),
      phone: user.phone ? String(user.phone) : '',
    },
    token,
    issuedAt,
    expiresAt,
    signature,
  };
}

export function verifySignedSession(envelope, nowMs = Date.now()) {
  if (!envelope || typeof envelope !== 'object') return null;
  const u = envelope.user;
  if (!u || typeof u !== 'object') return null;
  if (!u.id || !u.username || !u.email || !u.role) return null;
  if (!ALLOWED_ERP_ROLES.includes(String(u.role))) return null;
  if (typeof envelope.token !== 'string' || !envelope.token.startsWith('tok_')) return null;
  if (typeof envelope.issuedAt !== 'number' || typeof envelope.expiresAt !== 'number') return null;
  if (envelope.expiresAt <= nowMs) return null;

  const raw = `${u.id}|${u.username}|${u.email}|${u.role}|${envelope.token}|${envelope.issuedAt}|${envelope.expiresAt}`;
  const expectedSig = computeSessionDigest(raw);
  if (envelope.signature !== expectedSig) return null;

  return {
    id: String(u.id),
    name: String(u.name || u.username),
    username: String(u.username),
    email: String(u.email),
    role: String(u.role),
    phone: u.phone ? String(u.phone) : '',
  };
}

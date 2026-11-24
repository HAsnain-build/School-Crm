import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  formatMoney,
  formatPhoneForWhatsapp,
  isValidPhone,
  isValidBForm,
  calculateVoucherNet,
  calculateWaiverAmount,
  calculateLateFee,
  computeFeeStatus,
  buildWhatsappReminderText,
  formatMonthLabel,
  validateLoginInput,
  isSafeInternalRedirect,
  createSignedSession,
  verifySignedSession,
} from './erpLogic.js';

test('formatMoney formats integer rupees cleanly', () => {
  assert.equal(formatMoney(1500), 'Rs. 1,500');
  assert.equal(formatMoney(245000), 'Rs. 245,000');
  assert.equal(formatMoney(0), 'Rs. 0');
});

test('formatPhoneForWhatsapp converts local 03xx numbers to 923xx', () => {
  assert.equal(formatPhoneForWhatsapp('0300-1234567'), '923001234567');
  assert.equal(formatPhoneForWhatsapp('923211234567'), '923211234567');
  assert.equal(isValidPhone('0300-1234567'), true);
  assert.equal(isValidPhone('12345'), false);
});

test('isValidBForm validates 13-digit formatted B-Form numbers', () => {
  assert.equal(isValidBForm('35202-1234567-1'), true);
  assert.equal(isValidBForm('3520212345671'), false);
  assert.equal(isValidBForm('35202-123456-1'), false);
});

test('calculateVoucherNet and calculateWaiverAmount respect bounds', () => {
  assert.equal(
    calculateVoucherNet({ tuition: 3000, arrears: 1000, lateFee: 200, waiver: 500 }),
    3700
  );
  assert.equal(
    calculateVoucherNet({ tuition: 2000, arrears: 0, lateFee: 0, waiver: 5000 }),
    0
  );
  assert.equal(calculateWaiverAmount({ baseAmount: 3000, mode: 'percent', value: 50 }), 1500);
  assert.equal(calculateWaiverAmount({ baseAmount: 3000, mode: 'amount', value: 4500 }), 3000);
});

test('calculateLateFee handles fixed, daily, cap, and paid status', () => {
  assert.equal(
    calculateLateFee({
      dueDateStr: '2026-11-10',
      asOfDateStr: '2026-11-15',
      status: 'Unpaid',
      ruleType: 'fixed',
      amount: 200,
      maxCap: 500,
    }),
    200
  );
  assert.equal(
    calculateLateFee({
      dueDateStr: '2026-11-10',
      asOfDateStr: '2026-11-25',
      status: 'Partial',
      ruleType: 'daily',
      amount: 50,
      maxCap: 500,
    }),
    500
  );
  assert.equal(
    calculateLateFee({
      dueDateStr: '2026-11-10',
      asOfDateStr: '2026-11-25',
      status: 'Paid',
      ruleType: 'fixed',
      amount: 200,
      maxCap: 500,
    }),
    0
  );
});

test('computeFeeStatus and WhatsApp template interpolation', () => {
  assert.equal(computeFeeStatus(3000, 3000), 'Paid');
  assert.equal(computeFeeStatus(3000, 1500), 'Partial');
  assert.equal(computeFeeStatus(3000, 0), 'Unpaid');
  assert.equal(formatMonthLabel('2026-11'), 'November 2026');

  const msg = buildWhatsappReminderText({
    template: 'Hello {father_name}, fee of {student_name} ({class}) for {month} is Rs. {amount} due on {due_date}.',
    studentName: 'Usman Raza',
    fatherName: 'Raza Ahmed',
    className: 'Class 7',
    monthLabel: 'November 2026',
    amount: 3500,
    dueDate: '2026-11-10',
  });
  assert.match(msg, /Raza Ahmed/);
  assert.match(msg, /3,500/);
});

test('validateLoginInput accepts any valid username, email, and 8+ char password', () => {
  assert.equal(
    validateLoginInput({ username: 'Hasnain', email: 'hafizhasnain31811@gmail.com', password: 'hasnain123' }).valid,
    true
  );
  assert.equal(
    validateLoginInput({ username: 'Hasnain', email: 'hafizhasnain31811@gmail.com', password: 'short' }).valid,
    false
  );
  assert.equal(
    validateLoginInput({ username: 'Hasnain', email: 'invalid-email', password: 'hasnain123' }).valid,
    false
  );
});

test('signed session rejects tampering, expiry, and unauthorized roles; redirect blocks external URLs', () => {
  const now = 1_700_000_000_000;
  const session = createSignedSession(
    {
      id: 'u1',
      name: 'Hasnain',
      username: 'Hasnain',
      email: 'hafizhasnain31811@gmail.com',
      role: 'Owner / Principal',
    },
    now,
    60_000
  );

  assert.equal(verifySignedSession(session, now + 1000)?.username, 'Hasnain');
  assert.equal(verifySignedSession(session, now + 120_000), null);
  assert.equal(
    verifySignedSession({ ...session, user: { ...session.user, role: 'Admin' } }, now + 1000),
    null
  );
  assert.equal(verifySignedSession({ id: 'fake' }, now + 1000), null);

  assert.equal(isSafeInternalRedirect('/students?status=active'), '/students?status=active');
  assert.equal(isSafeInternalRedirect('https://evil.com'), '/');
  assert.equal(isSafeInternalRedirect('//evil.com'), '/');
  assert.equal(isSafeInternalRedirect('/login'), '/');
});

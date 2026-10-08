import assert from 'node:assert/strict';
import test from 'node:test';
import { isAdminIdentity, isBootstrapAdmin } from '../src/lib/auth/admin-policy.ts';
import { isUserAdmin } from '../src/lib/roles.ts';

const bootstrapEmail = 'bootstrap@example.com';
const configuredEmails = 'other@example.com, BOOTSTRAP@example.com ';

const policyCases = [
  ['app_metadata role grants admin', { app_metadata: { role: 'admin' } }, false, '', true],
  ['profile flag grants server admin', {}, true, '', true],
  ['confirmed configured email grants bootstrap admin', {
    email: bootstrapEmail,
    email_confirmed_at: '2026-01-01T00:00:00.000Z',
  }, false, configuredEmails, true],
  ['unconfirmed configured email is denied', {
    email: bootstrapEmail,
    email_confirmed_at: null,
  }, false, configuredEmails, false],
  ['email outside configured list is denied', {
    email: 'unlisted@example.com',
    email_confirmed_at: '2026-01-01T00:00:00.000Z',
  }, false, configuredEmails, false],
  ['user metadata role is denied', { user_metadata: { role: 'admin' } }, false, '', false],
  ['body-style role and isAdmin flags are denied', { role: 'admin', isAdmin: true }, false, '', false],
  ['email alone is denied', { email: bootstrapEmail }, false, configuredEmails, false],
];

for (const [name, identity, profileIsAdmin, emails, expected] of policyCases) {
  test(name, () => {
    assert.equal(isAdminIdentity(identity, profileIsAdmin, emails), expected);
  });
}

test('client role hint accepts only app_metadata.role', () => {
  assert.equal(isUserAdmin({ app_metadata: { role: 'admin' } }), true);
  assert.equal(isUserAdmin({ user_metadata: { role: 'admin' } }), false);
  assert.equal(isUserAdmin({ role: 'admin', isAdmin: true }), false);
  assert.equal(isUserAdmin({ email: bootstrapEmail }), false);
});

test('bootstrap email list is parsed case-insensitively and requires confirmation', () => {
  assert.equal(isBootstrapAdmin({
    email: bootstrapEmail,
    email_confirmed_at: '2026-01-01T00:00:00.000Z',
  }, configuredEmails), true);
  assert.equal(isBootstrapAdmin({ email: bootstrapEmail, email_confirmed_at: null }, configuredEmails), false);
});
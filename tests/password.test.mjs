import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import { verifyPassword } from '../lib/password.ts';

async function withCredentials(values, callback) {
  const keys = ['ADMIN_PASSWORD', 'ADMIN_PASSWORD_HASH'];
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  for (const key of keys) {
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
  try { await callback(); }
  finally {
    for (const key of keys) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
}

test('non-string JSON passwords fail closed without throwing', async () => {
  await withCredentials({ ADMIN_PASSWORD: 'synthetic-test-only' }, async () => {
    for (const input of [null, undefined, 123, true, {}, [], ['synthetic-test-only']]) {
      assert.equal(await verifyPassword(input), false);
    }
  });
});

test('plaintext credentials still require an exact nonempty match', async () => {
  await withCredentials({ ADMIN_PASSWORD: 'synthetic-test-only' }, async () => {
    assert.equal(await verifyPassword('synthetic-test-only'), true);
    assert.equal(await verifyPassword('wrong'), false);
    assert.equal(await verifyPassword(''), false);
    assert.equal(await verifyPassword('synthetic-test-only '), false);
  });
});

test('bcrypt credentials take precedence over plaintext fallback', async () => {
  const hash = await bcrypt.hash('synthetic-hash-only', 4);
  await withCredentials({ ADMIN_PASSWORD: 'synthetic-fallback', ADMIN_PASSWORD_HASH: hash }, async () => {
    assert.equal(await verifyPassword('synthetic-hash-only'), true);
    assert.equal(await verifyPassword('synthetic-fallback'), false);
    assert.equal(await verifyPassword({}), false);
  });
});

test('unconfigured admin rejects login', async () => {
  await withCredentials({}, async () => assert.equal(await verifyPassword('anything'), false));
});

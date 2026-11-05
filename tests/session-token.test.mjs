import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { createSessionToken, verifySessionToken, SESSION_MAX_AGE_SECONDS } from '../lib/session-token.ts';

const secret = 'synthetic-session-test-secret-not-a-real-credential';
const now = 1800000000;
const signedJson = json => {
  const body = Buffer.from(json).toString('base64url');
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
};

test('valid token retains the existing signed JSON format and seven-day lifetime', () => {
  const token = createSessionToken(secret, now);
  const body = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
  assert.deepEqual(body, { iat: now, exp: now + 604800 });
  assert.equal(SESSION_MAX_AGE_SECONDS, 604800);
  assert.equal(verifySessionToken(token, secret, now), true);
  assert.equal(verifySessionToken(token, secret, now + 604799), true);
  assert.equal(verifySessionToken(token, secret, now + 604800), false);
});

test('legacy token generated independently remains accepted', () => {
  assert.equal(verifySessionToken(signedJson(JSON.stringify({ iat: now, exp: now + 60 })), secret, now), true);
});

test('missing secret cannot issue or accept a session', () => {
  assert.throws(() => createSessionToken('', now), /not configured/);
  assert.equal(verifySessionToken(createSessionToken(secret, now), '', now), false);
});

test('tampered content, signatures and wrong keys are rejected', () => {
  const token = createSessionToken(secret, now);
  const [body, signature] = token.split('.');
  const tamperedBody = Buffer.from(JSON.stringify({ exp: now + 999999 })).toString('base64url');
  assert.equal(verifySessionToken(`${tamperedBody}.${signature}`, secret, now), false);
  assert.equal(verifySessionToken(`${body}.${signature.slice(0, -1)}!`, secret, now), false);
  assert.equal(verifySessionToken(token, 'another-synthetic-secret', now), false);
});

test('unknown input, extra segments and excessive tokens are rejected', () => {
  const token = createSessionToken(secret, now);
  for (const value of [undefined, null, 123, true, {}, [], '', '.', 'abc', 'a.b', `${token}.extra`, `${token}.`, 'x'.repeat(4097)]) {
    assert.equal(verifySessionToken(value, secret, now), false);
  }
});

test('signed invalid payloads and nonfinite or noninteger expiry are rejected', () => {
  for (const json of ['null', '[]', '{}', 'broken', '{"exp":"9999999999"}', '{"exp":1e309}', '{"exp":1800000000.5}', '{"exp":9007199254740992}', '{"exp":0}']) {
    assert.equal(verifySessionToken(signedJson(json), secret, now), false);
  }
});

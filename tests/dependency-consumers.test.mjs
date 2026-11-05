import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);

test('TypeScript project service retains default-project glob matching after minimatch patch', () => {
  const parser = require('@typescript-eslint/parser');
  const root = mkdtempSync(path.join(tmpdir(), 'homepage-parser-'));
  try {
    mkdirSync(path.join(root, 'src'));
    writeFileSync(path.join(root, 'src', 'included.ts'), 'export const included = true;');
    writeFileSync(path.join(root, 'tsconfig.json'), JSON.stringify({ include: ['src/**/*.ts'] }));
    const source = 'export const answer: number = 42;';
    const options = {
      filePath: path.join(root, '.fixture.ts'),
      tsconfigRootDir: root,
      projectService: { allowDefaultProject: ['*.ts'] },
    };
    const parsed = parser.parseForESLint(source, options);
    assert.equal(parsed.ast.body[0].type, 'ExportNamedDeclaration');
    assert.ok(parsed.services.program.getTypeChecker());
    parser.clearCaches();
    assert.throws(() => parser.parseForESLint(source, {
      ...options,
      filePath: path.join(root, 'rejected.ts'),
      projectService: { allowDefaultProject: ['*.tsx'] },
    }), /not found by the project service|not allowlisted/);
  } finally {
    parser.clearCaches();
    rmSync(root, { recursive: true, force: true });
  }
});

test('Blob OIDC config schemas retain validation and passthrough with patched Zod', () => {
  // Resolve through the actual Blob -> OIDC -> CLI config dependency chain.
  const fromBlob = createRequire(require.resolve('@vercel/blob'));
  const fromOidc = createRequire(fromBlob.resolve('@vercel/oidc'));
  const { globalConfigSchema, authConfigSchema } = fromOidc('@vercel/cli-config');
  const config = { currentTeam: 'synthetic-team', telemetry: { enabled: false }, futureFlag: 'retained' };
  assert.deepEqual(globalConfigSchema.parse(config), config);
  assert.equal(globalConfigSchema.safeParse({ telemetry: { enabled: 'invalid' } }).success, false);
  const auth = { token: 'synthetic-test-only', expiresAt: 123, tokenSource: 'env' };
  assert.deepEqual(authConfigSchema.parse(auth), auth);
  assert.equal(authConfigSchema.safeParse({ token: 123 }).success, false);
  assert.equal(authConfigSchema.safeParse({ tokenSource: 'unknown' }).success, false);
});

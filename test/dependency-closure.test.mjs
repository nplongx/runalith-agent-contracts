import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('public package has no runtime dependency or host/AGG import edge', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.deepEqual(manifest.dependencies || {}, {});
  assert.deepEqual(manifest.exports, { '.': './index.js' });
  const entry = fs.readFileSync(path.join(root, 'index.js'), 'utf8');
  const source = fs.readFileSync(path.join(root, 'src/index.js'), 'utf8');
  assert.equal(entry.trim(), "export * from './src/index.js';");
  assert.doesNotMatch(source, /^\s*import\s/m);
  assert.doesNotMatch(source, /(?:adaptive-goal-action-intent-policy|WorkflowStore|DatabaseSync|node:sqlite)/);
});

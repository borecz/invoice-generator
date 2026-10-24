import assert from 'node:assert/strict';
import test from 'node:test';
import { runtimeProblems } from './check-runtime.mjs';

test('accepts each supported patched Node line', () => {
  for (const node of ['24.22.1', '24.23.0']) {
    assert.deepEqual(runtimeProblems({ node }), []);
  }
});

test('rejects vulnerable, unsupported and malformed Node releases', () => {
  for (const node of ['22.23.4', '26.12.1', '22.23.3', '24.22.0', '26.12.0', '20.20.2', '23.11.0', '24.22.1-rc.1', 'unknown']) {
    assert.equal(runtimeProblems({ node }).length, 1);
  }
});

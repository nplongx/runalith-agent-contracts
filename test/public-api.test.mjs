import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AGENT_ROLES, AGENT_CONTRACTS, ROLE_ARTIFACT_TYPES,
  ACTION_INTENT_OPERATIONS_BY_ROLE, ACTION_INTENT_TARGET_KINDS,
  ACTION_INTENT_TARGET_REFERENCE, getAgentContract, listAgentContracts,
  getAgentArtifactType, normalizeAgentActionIntent, getAgentInputArtifactTypes,
  validateAgentContract
} from '../index.js';

const expectedRoles = ['product-owner', 'researcher', 'architect', 'engineer', 'security', 'qa', 'platform', 'writer', 'reviewer', 'cto'];
const expectedOutputs = ['requirements', 'research', 'architecture', 'implementation', 'security-review', 'qa-report', 'platform-review', 'documentation', 'review', 'cto-decision'];

test('exports ten immutable version-1 role contracts and exact artifact mappings', () => {
  assert.deepEqual(AGENT_ROLES, expectedRoles);
  assert.equal(listAgentContracts().length, 10);
  assert.equal(Object.isFrozen(AGENT_ROLES), true);
  assert.equal(Object.isFrozen(AGENT_CONTRACTS), true);
  for (let i = 0; i < expectedRoles.length; i++) {
    const role = expectedRoles[i];
    const contract = getAgentContract(role);
    assert.equal(contract.id, `agent.${role}`);
    assert.equal(contract.role, role);
    assert.equal(contract.version, 1);
    assert.equal(contract.executor, 'ChatOnSteroids');
    assert.equal(contract.outputs[0], expectedOutputs[i]);
    assert.equal(getAgentArtifactType(role), expectedOutputs[i]);
    assert.equal(ROLE_ARTIFACT_TYPES[role], expectedOutputs[i]);
    assert.equal(validateAgentContract(contract), true);
    for (const key of ['inputs', 'outputs', 'permissions', 'allowedTools', 'completionCriteria']) assert.ok(Object.isFrozen(contract[key]));
    assert.ok(Object.isFrozen(contract.actionIntentContract));
    assert.ok(Object.isFrozen(contract.actionIntentContract.operations));
    assert.deepEqual(contract.actionIntentContract.operations, ACTION_INTENT_OPERATIONS_BY_ROLE[role]);
  }
  assert.equal(getAgentContract('ENGINEER'), getAgentContract('engineer'));
  assert.equal(getAgentArtifactType('productowner'), 'requirements');
  assert.deepEqual(getAgentInputArtifactTypes('engineer'), ['requirements', 'architecture']);
  assert.throws(() => getAgentContract('unknown'), /unknown agent contract/);
  assert.throws(() => getAgentArtifactType('unknown'), /unknown agent role/);
});

test('role action-intent allowlists and target vocabulary are frozen declarations', () => {
  assert.deepEqual(ACTION_INTENT_OPERATIONS_BY_ROLE.engineer, ['analyze', 'implement', 'prepare', 'verify']);
  assert.ok(!ACTION_INTENT_OPERATIONS_BY_ROLE.engineer.includes('investigate'));
  assert.deepEqual(ACTION_INTENT_TARGET_KINDS, ['artifact', 'codebase', 'component', 'requirement', 'work_item', 'other']);
  assert.equal(Object.isFrozen(ACTION_INTENT_OPERATIONS_BY_ROLE), true);
  assert.equal(Object.isFrozen(ACTION_INTENT_OPERATIONS_BY_ROLE.engineer), true);
  assert.equal(Object.isFrozen(ACTION_INTENT_TARGET_KINDS), true);
  assert.equal(ACTION_INTENT_TARGET_REFERENCE.test('artifact.ref_1-2'), true);
  assert.equal(ACTION_INTENT_TARGET_REFERENCE.test('../secret'), false);
});

test('normalizer accepts exact valid intent and returns detached data', () => {
  const input = { operation: 'implement', target: { kind: 'work_item', reference: 'task-1' },
    description: 'Implement bounded task', successCriteria: ['tests pass'] };
  const normalized = normalizeAgentActionIntent('engineer', input);
  assert.deepEqual(normalized, input);
  assert.notEqual(normalized, input);
  assert.notEqual(normalized.target, input.target);
  assert.notEqual(normalized.successCriteria, input.successCriteria);
  normalized.target.reference = 'changed';
  normalized.successCriteria.push('changed');
  assert.equal(input.target.reference, 'task-1');
  assert.deepEqual(input.successCriteria, ['tests pass']);
});

test('normalizer rejects extra/missing fields, unsupported role operations and malformed targets', () => {
  const valid = { operation: 'implement', target: { kind: 'work_item', reference: 'task-1' }, description: 'Do work', successCriteria: ['done'] };
  assert.throws(() => normalizeAgentActionIntent('engineer', { ...valid, extra: true }), /exactly operation, target, description and successCriteria/);
  const missing = { ...valid }; delete missing.successCriteria;
  assert.throws(() => normalizeAgentActionIntent('engineer', missing), /exactly operation, target, description and successCriteria/);
  assert.throws(() => normalizeAgentActionIntent('engineer', { ...valid, operation: 'investigate' }), /operation is not supported/);
  for (const target of [null, [], {}, { kind: 'unknown', reference: 'x' }, { kind: 'work_item', reference: '../x' },
    { kind: 'work_item', reference: ' x' }, { kind: 'work_item', reference: 'x', extra: true }]) {
    assert.throws(() => normalizeAgentActionIntent('engineer', { ...valid, target }), /target is invalid/);
  }
});

test('normalizer enforces description and success-criteria bounds and uniqueness', () => {
  const valid = { operation: 'implement', target: { kind: 'work_item', reference: 'task-1' }, description: 'Do work', successCriteria: ['done'] };
  for (const description of ['', ' padded ', 'x'.repeat(1201), 'bad\ntext']) {
    assert.throws(() => normalizeAgentActionIntent('engineer', { ...valid, description }), /description is invalid/);
  }
  for (const successCriteria of [[], Array.from({ length: 13 }, (_, i) => `c${i}`), [''], [' padded '], ['x'.repeat(301)], ['bad\ntext'], ['same', 'same']]) {
    assert.throws(() => normalizeAgentActionIntent('engineer', { ...valid, successCriteria }), /successCriteria are invalid/);
  }
  assert.equal(normalizeAgentActionIntent('engineer', { ...valid, description: 'x'.repeat(1200), successCriteria: Array.from({ length: 12 }, (_, i) => `c${i}`) }).successCriteria.length, 12);
});

test('generic contract validator rejects missing identity, invalid version and malformed lists', () => {
  const base = { id: 'agent.example', role: 'example', version: 1, capability: 'example.run', executor: 'Example',
    inputs: [], outputs: [], permissions: [], allowedTools: [], completionCriteria: [] };
  assert.equal(validateAgentContract(base), true);
  for (const field of ['id', 'role', 'capability', 'executor']) assert.throws(() => validateAgentContract({ ...base, [field]: '' }), new RegExp(`agent contract ${field} is required`));
  assert.throws(() => validateAgentContract({ ...base, version: 0 }), /invalid agent contract version/);
  assert.throws(() => validateAgentContract({ ...base, id: 'bad' }), /invalid agent contract id/);
  for (const field of ['inputs', 'outputs', 'permissions', 'allowedTools', 'completionCriteria']) {
    assert.throws(() => validateAgentContract({ ...base, [field]: null }), new RegExp(`agent contract ${field} must be an array`));
    assert.throws(() => validateAgentContract({ ...base, [field]: [' '] }), new RegExp(`agent contract ${field} contains an invalid entry`));
  }
});

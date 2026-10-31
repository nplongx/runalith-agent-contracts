# Runalith Agent Contracts

Pure, immutable role capability declarations and action-intent vocabulary for Runalith-compatible workflow systems.

<p>
  <a href="https://github.com/nplongx/runalith-agent-contracts/actions"><img alt="CI" src="https://github.com/nplongx/runalith-agent-contracts/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="Node.js 22.13+" src="https://img.shields.io/badge/node-%3E%3D22.13-green">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

## Install

```bash
npm install git+https://github.com/nplongx/runalith-agent-contracts.git
```

Node.js 22.13+, ESM, zero external runtime dependencies.

## Public API

```js
import {
  AGENT_ROLES,
  AGENT_CONTRACTS,
  getAgentContract,
  listAgentContracts,
  getAgentArtifactType,
  normalizeAgentActionIntent,
  getAgentInputArtifactTypes,
  validateAgentContract
} from '@runalith/agent-contracts';
```

The package defines declarative role capabilities, input/output artifact types, permission/tool vocabulary, completion criteria and per-role action-intent operation/target syntax. Returned built-in contracts and nested arrays are frozen. `normalizeAgentActionIntent` validates exact fields and returns a detached normalized value.

## Security and authority boundary

These declarations are **not** permission grants, approvals, executable commands, dispatch authority, proof of task execution, or proof that evidence is authentic. A `permissions` entry describes a role capability vocabulary only. Consumers must enforce their own approval, resource, lineage, trust, policy and execution gates.

This package deliberately excludes compiled AGG action-intent validation and AGG semantic proofs. Those depend on host-owned graph, task, evidence and semantic-policy state and remain in the Runalith host adapter. It also excludes workflow compilation, persistence, custom-role stores, MCP, providers, filesystem and databases.

## Development

```bash
npm test
npm run pack:check
```

## Relationship to Runalith

Extracted from [Runalith](https://github.com/nplongx/runalith). See the host [subsystem architecture map](https://github.com/nplongx/runalith/blob/main/docs/subsystems/README.md) and [Agent Contracts boundary note](https://github.com/nplongx/runalith/blob/main/docs/subsystems/agent-contracts.md).

## License

MIT. See [LICENSE](LICENSE).

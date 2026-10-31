# Public API

**Package:** `@runalith/agent-contracts`  
**Package version:** `0.1.0` (experimental)  
**Contract version:** `1`  
**Module:** ESM  
**Runtime:** Node.js `>=22.13`

Package SemVer and role-contract versions are independent. Consumers should pin compatible package versions and treat changes to role IDs, capabilities, artifact vocabularies, operation allowlists, target kinds and validation rules as contract changes.

## Exports

| Export | Contract |
|---|---|
| `AGENT_ROLES` | Frozen ordered role identifiers for the ten built-in roles. |
| `AGENT_CONTRACTS` | Frozen map of role IDs to immutable version-1 contracts. |
| `getAgentContract(role)` | Returns immutable contract; role lookup is case-insensitive. Throws for unknown role. |
| `listAgentContracts()` | Returns frozen array of all built-in immutable contracts. |
| `getAgentArtifactType(role)` | Returns role's output artifact type. Accepts legacy `productowner` alias. |
| `getAgentInputArtifactTypes(role)` | Returns frozen artifact input types, excluding `job.request`. |
| `normalizeAgentActionIntent(role, intent)` | Validates exact `{ operation, target, description, successCriteria }` shape and returns a detached normalized object. |
| `validateAgentContract(contract)` | Validates generic role contract identity, version and required list fields. |
| `ROLE_ARTIFACT_TYPES` | Frozen role-to-output artifact mapping. |
| `ACTION_INTENT_OPERATIONS_BY_ROLE` | Frozen per-role operation allowlists. |
| `ACTION_INTENT_TARGET_KINDS` | Frozen target-kind vocabulary. |
| `ACTION_INTENT_TARGET_REFERENCE` | Reference syntax: `/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/`. |

## Built-in roles

`product-owner`, `researcher`, `architect`, `engineer`, `security`, `qa`, `platform`, `writer`, `reviewer`, `cto`.

Each contract includes `id`, `version`, `role`, `capability`, `executor`, `inputs`, `outputs`, `permissions`, `allowedTools`, `completionCriteria`, and `actionIntentContract`.

## Action-intent v1

The normalized object contains exactly four fields:

- `operation`: one of the role's declared operation strings.
- `target`: exactly `{ kind, reference }`; `kind` is one of `artifact`, `codebase`, `component`, `requirement`, `work_item`, `other`; reference matches the exported regular expression and has no surrounding whitespace.
- `description`: non-empty, trimmed, control-character-free string, at most 1,200 UTF-16 code units.
- `successCriteria`: 1–12 unique, non-empty, trimmed, control-character-free strings, each at most 300 UTF-16 code units.

The role contract declares allowed operations; generic normalization does not decide whether a target is bound to current workflow evidence or whether an operation is semantically valid for AGG. The compiled AGG adapter applies narrower canonical semantics and verifies task/evidence/graph lineage.

## Compatibility and authority

The `0.x` package root is the supported public surface; incompatibilities may occur before `1.0.0`. Unknown action-intent fields reject. Contract permission/tool strings are descriptive declarations, not authorization grants. The package has no persistence, trust, approval, execution or dispatch implementation.

# Contributing

Requires Node.js 22.13 or newer.

```bash
npm test
npm run pack:check
```

Keep this package pure: no SQLite, filesystem access, network, MCP, providers, workflow stores or approval implementations. Contract additions/removals must update API docs, changelog and negative tests. Never promote content hashes or caller-provided artifact sets into producer trust or workflow authority.

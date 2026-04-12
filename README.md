# Agent Identity Registry

Decentralized identity registry for AI agents — DID generation, discovery, and trust chain verification.

## Install

```bash
npm install @phoenix-assistant/agent-identity-registry
```

## Usage

### Create Agent Identities

```typescript
import { AgentDID } from '@phoenix-assistant/agent-identity-registry';

const agent = new AgentDID({ name: 'coder-bot', metadata: { lang: 'typescript' } });
console.log(agent.id);   // did:agent:a1b2c3...
console.log(agent.name); // coder-bot
```

### Registry — Register, Lookup, Discover

```typescript
import { Registry, AgentDID } from '@phoenix-assistant/agent-identity-registry';

const registry = new Registry({ filePath: './agents.json' }); // optional file persistence

const bot = new AgentDID({ name: 'writer-bot', metadata: { role: 'content' } });
registry.register(bot);

registry.lookup(bot.id);                    // → DIDDocument
registry.discover({ name: 'writer' });      // → [DIDDocument]
registry.discover({ metadata: { role: 'content' } }); // → [DIDDocument]
```

### Trust Chains

```typescript
import { TrustChain, AgentDID } from '@phoenix-assistant/agent-identity-registry';

const chain = new TrustChain();
const orchestrator = new AgentDID({ name: 'orchestrator' });
const worker = new AgentDID({ name: 'worker' });

chain.addLink(orchestrator.toDocument(), worker.toDocument(), 'full', 'spawned by orchestrator');

const result = chain.verify(orchestrator.id, worker.id);
// { trusted: true, chain: [TrustLink], reason: 'Trust path found (1 hop)' }
```

## API

### `AgentDID`
- `new AgentDID({ name, metadata? })` — create a new agent DID
- `AgentDID.isValid(id)` — validate DID format
- `AgentDID.fromDocument(doc)` — reconstruct from stored document
- `.toDocument()` — serialize to `DIDDocument`

### `Registry`
- `new Registry({ filePath? })` — create registry (optionally file-backed)
- `.register(did)` — register an agent
- `.lookup(id)` — find by DID
- `.discover({ name?, metadata? })` — search agents
- `.remove(id)` — unregister
- `.size` — count

### `TrustChain`
- `.addLink(from, to, level, reason?)` — add trust (`full` | `limited` | `none`)
- `.verify(sourceId, targetId, maxDepth?)` — check transitive trust
- `.linksFrom(id)` — direct outbound links
- `.revoke(fromId, toId)` — remove trust

## License

MIT

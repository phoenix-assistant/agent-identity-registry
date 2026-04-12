import { describe, it, expect } from 'vitest';
import { AgentDID } from '../src/did.js';

describe('AgentDID', () => {
  it('generates a valid DID', () => {
    const did = new AgentDID({ name: 'test-agent' });
    expect(AgentDID.isValid(did.id)).toBe(true);
    expect(did.name).toBe('test-agent');
    expect(did.publicKey).toHaveLength(64);
  });

  it('generates unique DIDs', () => {
    const a = new AgentDID({ name: 'a' });
    const b = new AgentDID({ name: 'b' });
    expect(a.id).not.toBe(b.id);
  });

  it('validates DID format', () => {
    expect(AgentDID.isValid('did:agent:' + 'a'.repeat(40))).toBe(true);
    expect(AgentDID.isValid('did:agent:short')).toBe(false);
    expect(AgentDID.isValid('not-a-did')).toBe(false);
  });

  it('round-trips through document', () => {
    const did = new AgentDID({ name: 'roundtrip', metadata: { role: 'coder' } });
    const doc = did.toDocument();
    const restored = AgentDID.fromDocument(doc);
    expect(restored.id).toBe(did.id);
    expect(restored.name).toBe('roundtrip');
    expect(restored.metadata).toEqual({ role: 'coder' });
  });
});

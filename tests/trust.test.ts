import { describe, it, expect } from 'vitest';
import { AgentDID } from '../src/did.js';
import { TrustChain } from '../src/trust.js';

describe('TrustChain', () => {
  it('verifies direct trust', () => {
    const chain = new TrustChain();
    const a = new AgentDID({ name: 'a' });
    const b = new AgentDID({ name: 'b' });
    chain.addLink(a.toDocument(), b.toDocument(), 'full');
    const result = chain.verify(a.id, b.id);
    expect(result.trusted).toBe(true);
    expect(result.chain).toHaveLength(1);
  });

  it('verifies transitive trust', () => {
    const chain = new TrustChain();
    const a = new AgentDID({ name: 'a' });
    const b = new AgentDID({ name: 'b' });
    const c = new AgentDID({ name: 'c' });
    chain.addLink(a.toDocument(), b.toDocument(), 'full');
    chain.addLink(b.toDocument(), c.toDocument(), 'limited');
    const result = chain.verify(a.id, c.id);
    expect(result.trusted).toBe(true);
    expect(result.chain).toHaveLength(2);
  });

  it('returns false when no path exists', () => {
    const chain = new TrustChain();
    const a = new AgentDID({ name: 'a' });
    const b = new AgentDID({ name: 'b' });
    expect(chain.verify(a.id, b.id).trusted).toBe(false);
  });

  it('ignores none-level links', () => {
    const chain = new TrustChain();
    const a = new AgentDID({ name: 'a' });
    const b = new AgentDID({ name: 'b' });
    chain.addLink(a.toDocument(), b.toDocument(), 'none');
    expect(chain.verify(a.id, b.id).trusted).toBe(false);
  });

  it('revokes trust', () => {
    const chain = new TrustChain();
    const a = new AgentDID({ name: 'a' });
    const b = new AgentDID({ name: 'b' });
    chain.addLink(a.toDocument(), b.toDocument(), 'full');
    expect(chain.revoke(a.id, b.id)).toBe(true);
    expect(chain.verify(a.id, b.id).trusted).toBe(false);
  });

  it('lists links from an agent', () => {
    const chain = new TrustChain();
    const a = new AgentDID({ name: 'a' });
    const b = new AgentDID({ name: 'b' });
    const c = new AgentDID({ name: 'c' });
    chain.addLink(a.toDocument(), b.toDocument(), 'full');
    chain.addLink(a.toDocument(), c.toDocument(), 'limited');
    expect(chain.linksFrom(a.id)).toHaveLength(2);
  });

  it('rejects invalid DIDs', () => {
    const chain = new TrustChain();
    const valid = new AgentDID({ name: 'v' }).toDocument();
    const invalid = { ...valid, id: 'bad-id' };
    expect(() => chain.addLink(invalid, valid, 'full')).toThrow(/Invalid DID/);
  });
});

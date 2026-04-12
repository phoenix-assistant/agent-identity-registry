import { describe, it, expect, afterEach } from 'vitest';
import { unlinkSync, existsSync } from 'node:fs';
import { AgentDID } from '../src/did.js';
import { Registry } from '../src/registry.js';

const TMP_FILE = '/tmp/test-registry.json';

afterEach(() => { if (existsSync(TMP_FILE)) unlinkSync(TMP_FILE); });

describe('Registry', () => {
  it('registers and looks up agents', () => {
    const reg = new Registry();
    const did = new AgentDID({ name: 'alpha' });
    reg.register(did);
    expect(reg.lookup(did.id)?.name).toBe('alpha');
    expect(reg.size).toBe(1);
  });

  it('prevents duplicate registration', () => {
    const reg = new Registry();
    const did = new AgentDID({ name: 'dup' });
    reg.register(did);
    expect(() => reg.register(did)).toThrow(/already registered/);
  });

  it('discovers by name', () => {
    const reg = new Registry();
    reg.register(new AgentDID({ name: 'coder-bot' }));
    reg.register(new AgentDID({ name: 'writer-bot' }));
    expect(reg.discover({ name: 'coder' })).toHaveLength(1);
    expect(reg.discover({ name: 'bot' })).toHaveLength(2);
  });

  it('discovers by metadata', () => {
    const reg = new Registry();
    reg.register(new AgentDID({ name: 'a', metadata: { lang: 'ts' } }));
    reg.register(new AgentDID({ name: 'b', metadata: { lang: 'py' } }));
    expect(reg.discover({ metadata: { lang: 'ts' } })).toHaveLength(1);
  });

  it('removes agents', () => {
    const reg = new Registry();
    const did = new AgentDID({ name: 'temp' });
    reg.register(did);
    expect(reg.remove(did.id)).toBe(true);
    expect(reg.lookup(did.id)).toBeUndefined();
    expect(reg.remove('did:agent:nonexistent')).toBe(false);
  });

  it('persists to file and reloads', () => {
    const reg1 = new Registry({ filePath: TMP_FILE });
    const did = new AgentDID({ name: 'persist' });
    reg1.register(did);

    const reg2 = new Registry({ filePath: TMP_FILE });
    expect(reg2.lookup(did.id)?.name).toBe('persist');
  });
});

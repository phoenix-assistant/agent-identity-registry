import { randomBytes, createHash } from 'node:crypto';

export interface DIDDocument {
  id: string;
  name: string;
  created: string;
  publicKey: string;
  metadata: Record<string, unknown>;
}

/**
 * Agent Decentralized Identifier (DID) — unique identity for an AI agent.
 * Format: did:agent:<hex-fingerprint>
 */
export class AgentDID {
  readonly id: string;
  readonly name: string;
  readonly created: string;
  readonly publicKey: string;
  readonly metadata: Record<string, unknown>;

  constructor(opts: { name: string; metadata?: Record<string, unknown> }) {
    const key = randomBytes(32);
    this.publicKey = key.toString('hex');
    this.id = `did:agent:${createHash('sha256').update(key).digest('hex').slice(0, 40)}`;
    this.name = opts.name;
    this.created = new Date().toISOString();
    this.metadata = opts.metadata ?? {};
  }

  /** Reconstruct from a stored document */
  static fromDocument(doc: DIDDocument): AgentDID {
    const did = Object.create(AgentDID.prototype) as AgentDID;
    Object.assign(did, doc);
    return did;
  }

  /** Validate a DID string format */
  static isValid(id: string): boolean {
    return /^did:agent:[a-f0-9]{40}$/.test(id);
  }

  toDocument(): DIDDocument {
    return { id: this.id, name: this.name, created: this.created, publicKey: this.publicKey, metadata: this.metadata };
  }
}

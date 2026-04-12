import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { AgentDID, type DIDDocument } from './did.js';

/**
 * In-memory + file-backed agent registry.
 * Supports register, lookup, discover (search), and remove.
 */
export class Registry {
  private agents: Map<string, DIDDocument> = new Map();
  private filePath: string | null;

  constructor(opts?: { filePath?: string }) {
    this.filePath = opts?.filePath ?? null;
    if (this.filePath && existsSync(this.filePath)) {
      const data = JSON.parse(readFileSync(this.filePath, 'utf-8')) as DIDDocument[];
      for (const doc of data) this.agents.set(doc.id, doc);
    }
  }

  /** Register an agent DID */
  register(did: AgentDID): void {
    if (this.agents.has(did.id)) throw new Error(`Agent already registered: ${did.id}`);
    this.agents.set(did.id, did.toDocument());
    this.persist();
  }

  /** Lookup by DID id */
  lookup(id: string): DIDDocument | undefined {
    return this.agents.get(id);
  }

  /** Discover agents by name substring or metadata key match */
  discover(query: { name?: string; metadata?: Record<string, unknown> }): DIDDocument[] {
    return [...this.agents.values()].filter((doc) => {
      if (query.name && !doc.name.toLowerCase().includes(query.name.toLowerCase())) return false;
      if (query.metadata) {
        for (const [k, v] of Object.entries(query.metadata)) {
          if (doc.metadata[k] !== v) return false;
        }
      }
      return true;
    });
  }

  /** Remove an agent from the registry */
  remove(id: string): boolean {
    const deleted = this.agents.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  /** Number of registered agents */
  get size(): number {
    return this.agents.size;
  }

  private persist(): void {
    if (!this.filePath) return;
    writeFileSync(this.filePath, JSON.stringify([...this.agents.values()], null, 2));
  }
}

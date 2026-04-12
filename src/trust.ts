import type { DIDDocument } from './did.js';
import { AgentDID } from './did.js';

export interface TrustLink {
  from: string;   // DID of the issuer
  to: string;     // DID of the subject
  level: 'full' | 'limited' | 'none';
  issued: string;
  reason?: string;
}

export interface VerifyResult {
  trusted: boolean;
  chain: TrustLink[];
  reason: string;
}

/**
 * Trust chain verifier — maintains directional trust links between agents
 * and can verify transitive trust paths.
 */
export class TrustChain {
  private links: TrustLink[] = [];

  /** Add a trust link from one agent to another */
  addLink(from: DIDDocument, to: DIDDocument, level: TrustLink['level'], reason?: string): void {
    if (!AgentDID.isValid(from.id) || !AgentDID.isValid(to.id)) {
      throw new Error('Invalid DID in trust link');
    }
    this.links.push({ from: from.id, to: to.id, level, issued: new Date().toISOString(), reason });
  }

  /** Verify if there is a trust path from source to target (max depth to prevent cycles) */
  verify(sourceId: string, targetId: string, maxDepth = 5): VerifyResult {
    const visited = new Set<string>();
    const path: TrustLink[] = [];

    const dfs = (current: string, depth: number): boolean => {
      if (depth > maxDepth) return false;
      if (current === targetId) return true;
      if (visited.has(current)) return false;
      visited.add(current);

      for (const link of this.links) {
        if (link.from === current && link.level !== 'none') {
          path.push(link);
          if (dfs(link.to, depth + 1)) return true;
          path.pop();
        }
      }
      return false;
    };

    const trusted = dfs(sourceId, 0);
    return {
      trusted,
      chain: [...path],
      reason: trusted ? `Trust path found (${path.length} hop${path.length === 1 ? '' : 's'})` : 'No trust path found',
    };
  }

  /** Get all direct trust links from a given agent */
  linksFrom(id: string): TrustLink[] {
    return this.links.filter((l) => l.from === id);
  }

  /** Revoke trust between two agents */
  revoke(fromId: string, toId: string): boolean {
    const before = this.links.length;
    this.links = this.links.filter((l) => !(l.from === fromId && l.to === toId));
    return this.links.length < before;
  }
}

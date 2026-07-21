// cluster.ts — pure clustering + canonical-selection logic for the supersede pass (Sub-ticket 2).
// No I/O, so it is unit-testable; the edge function does the RPC calls.
//
// Given the near-duplicate edge list (from kb_insight_neighbors) and per-card fields (from
// kb_insight_cluster_fields), group cards into clusters via union-find, pick ONE canonical card
// per multi-member cluster, and return only the assignments that DIFFER from the current state
// (so a run writes the minimum, and re-runs on unchanged data write nothing).

/** A near-duplicate edge between two insight cards (undirected; sim is cosine similarity). */
export interface Edge {
  id_a: string;
  id_b: string;
  sim: number;
}

/** Canonical-selection inputs + current cluster state for one card. */
export interface CardField {
  id: string;
  publicationDate: string | null;
  claimLen: number;
  clusterId: string | null;
  isCanonical: boolean;
}

/** A cluster_id/is_canonical assignment to write back onto a card's metadata. */
export interface ClusterAssignment {
  id: string;
  cluster_id: string | null;
  is_canonical: boolean;
}

/** Parse a publication_date into a sortable epoch; unparseable/missing sort oldest (nulls last). */
function pubEpoch(d: string | null): number {
  if (!d) return Number.NEGATIVE_INFINITY;
  const t = Date.parse(d);
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

/** The more-canonical of two cards: freshest publication_date, then longest claim, then
 *  smallest id (a deterministic, stable tiebreak so re-runs pick the same winner). */
function moreCanonical(a: CardField, b: CardField): CardField {
  const ea = pubEpoch(a.publicationDate), eb = pubEpoch(b.publicationDate);
  if (ea !== eb) return ea > eb ? a : b;
  if (a.claimLen !== b.claimLen) return a.claimLen > b.claimLen ? a : b;
  return a.id < b.id ? a : b;
}

/** Union-find over the card ids, unioning the endpoints of every edge. Returns a map from
 *  each card id to its component root. Cards absent from `ids` are ignored (edge may reference
 *  a card filtered out upstream). */
function components(ids: string[], edges: Edge[]): Map<string, string> {
  const parent = new Map<string, string>();
  for (const id of ids) parent.set(id, id);

  const find = (x: string): string => {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path-compress.
    let cur = x;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };

  for (const e of edges) {
    if (!parent.has(e.id_a) || !parent.has(e.id_b)) continue; // skip edges to filtered-out cards
    const ra = find(e.id_a), rb = find(e.id_b);
    if (ra !== rb) parent.set(ra, rb);
  }
  const root = new Map<string, string>();
  for (const id of ids) root.set(id, find(id));
  return root;
}

/** Compute the desired cluster assignment for every card, then return only those whose desired
 *  (cluster_id, is_canonical) differs from the card's current state.
 *
 *  Desired state:
 *   - multi-member cluster -> cluster_id = the canonical card's id (stable group key);
 *     is_canonical = true only for that canonical card, false for the rest.
 *   - singleton -> cluster_id = null, is_canonical = true (the distiller default; also resets a
 *     card that has dropped out of a cluster on a re-run). */
export function computeClusterDiff(cards: CardField[], edges: Edge[]): ClusterAssignment[] {
  const ids = cards.map((c) => c.id);
  const byId = new Map(cards.map((c) => [c.id, c]));
  const root = components(ids, edges);

  // Group card ids by component root.
  const groups = new Map<string, string[]>();
  for (const id of ids) {
    const r = root.get(id)!;
    (groups.get(r) ?? groups.set(r, []).get(r)!).push(id);
  }

  const desired = new Map<string, { cluster_id: string | null; is_canonical: boolean }>();
  for (const members of groups.values()) {
    if (members.length < 2) {
      desired.set(members[0], { cluster_id: null, is_canonical: true });
      continue;
    }
    const canonical = members.map((id) => byId.get(id)!).reduce(moreCanonical);
    for (const id of members) {
      desired.set(id, { cluster_id: canonical.id, is_canonical: id === canonical.id });
    }
  }

  // Emit only the cards whose desired state differs from current.
  const out: ClusterAssignment[] = [];
  for (const c of cards) {
    const d = desired.get(c.id)!;
    if ((c.clusterId ?? null) !== d.cluster_id || c.isCanonical !== d.is_canonical) {
      out.push({ id: c.id, cluster_id: d.cluster_id, is_canonical: d.is_canonical });
    }
  }
  return out;
}

/** Cluster summary for the dry-run preview: how many multi-member clusters, how many cards they
 *  cover, and the largest few (canonical id + member count) — so the run can be eyeballed before
 *  any write. Pure; derived from the same inputs as computeClusterDiff. */
export function summariseClusters(cards: CardField[], edges: Edge[]): {
  totalCards: number;
  clusters: number;
  cardsClustered: number;
  largest: Array<{ cluster_id: string; size: number }>;
} {
  const ids = cards.map((c) => c.id);
  const byId = new Map(cards.map((c) => [c.id, c]));
  const root = components(ids, edges);
  const groups = new Map<string, string[]>();
  for (const id of ids) {
    const r = root.get(id)!;
    (groups.get(r) ?? groups.set(r, []).get(r)!).push(id);
  }
  const multi = [...groups.values()].filter((m) => m.length >= 2);
  const largest = multi
    .map((members) => ({
      cluster_id: members.map((id) => byId.get(id)!).reduce(moreCanonical).id,
      size: members.length,
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  return {
    totalCards: cards.length,
    clusters: multi.length,
    cardsClustered: multi.reduce((n, m) => n + m.length, 0),
    largest,
  };
}

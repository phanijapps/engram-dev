/**
 * The white-label heart (standards R-brand): every user-facing token of this
 * product lives HERE and nowhere else. Rebranding = edit this file (or run
 * `pnpm brand:set`) — no other source file contains the name.
 */
export const brand = {
  name: 'Wukong',
  binName: 'wukong',
  /** Stable storage identity preserves existing enrollment across public renames. */
  stateDirectory: 'treadle',
  tagline: 'The human drives; the machine moves.',
  /** Lineage note kept for one release cycle after any rename. */
  formerly: 'treadle',
  /** Format tags are CONTRACTS, never brands (naming doc, rule 3). */
  formatTags: { pack: 'specpack/0.3', events: 'specweb-events/0.1' },
} as const;

export type Brand = typeof brand;

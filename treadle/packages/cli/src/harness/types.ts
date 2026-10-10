/** The harness manifest (format harness/0.1) — the data contract that
 *  drives the installer. Additive changes only, like every frozen
 *  vocabulary here. */
export type Surface = 'pi' | 'claude' | 'codex' | 'copilot';
export type Scope = 'project' | 'global';
export type ComponentKind = 'skill' | 'agent';

export interface HookWiring {
  kind: 'extension' | 'settings-hooks' | 'config-notify';
  dest?: string;
  matcher?: string;
  command?: string;
}

export interface HookRow {
  id: string;
  file: string;
  wiring: Partial<Record<Surface, HookWiring | null>>;
}

export interface ComponentRow {
  id: string;
  kind: ComponentKind;
  /** skills: a directory relative to the manifest root. agents: a per-surface file map. */
  source: string | Partial<Record<Surface, string>>;
  /** project-shaped destination per surface (global roots are derived). */
  dest: Partial<Record<Surface, string>>;
}

export interface HarnessManifest {
  format: 'harness/0.1';
  components: ComponentRow[];
  hooks: HookRow[];
}

export type PlanMode = 'create' | 'same' | 'update' | 'refuse' | 'skip';

export interface PlanRow {
  component: string;
  kind: ComponentKind | 'hook';
  surface: Surface;
  source: string;
  destination: string;
  mode: PlanMode;
  note?: string;
  /** unmanaged leftovers at the destination — removed only under --force, exactly these */
  extras?: string[];
}

export interface Plan {
  rows: PlanRow[];
  /** wiring actions the apply step performs after file rows (hook settings/config merges). */
  wirings: { surface: Surface; kind: HookWiring['kind']; target: string; detail: string }[];
}

export interface InstallChoices {
  agent: Surface;
  scope: Scope;
  skills: string[] | 'all';
  agents: boolean;
  hooks: boolean;
  root: string;
  manifestPath?: string | undefined;
  force: boolean;
  dryRun: boolean;
  json: boolean;
  yes: boolean;
  remove: boolean;
}

/** Usage failures the CLI turns into exit 2 with the remediation command. */
export class UsageError extends Error {
  readonly remediation: string;
  constructor(message: string, remediation: string) {
    super(message);
    this.remediation = remediation;
  }
}

export const SURFACES: Surface[] = ['pi', 'claude', 'codex', 'copilot'];

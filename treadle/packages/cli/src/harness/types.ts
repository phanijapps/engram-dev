/** The harness manifest (format harness/0.1) — the data contract that
 *  drives the installer. Additive changes only, like every frozen
 *  vocabulary here. */
export type Surface = 'pi' | 'claude' | 'codex' | 'copilot';
export type Scope = 'project' | 'global';
export type ComponentKind = 'skill' | 'agent';
/** How a host learns of an owner action: wake on a background command's exit, context only, or not at all. */
export type WakeMode = 'background-command' | 'context-only' | 'none';

export interface HookWiring {
  kind:
    | 'extension'
    | 'settings-hooks'
    | 'config-notify'
    | 'config-hooks'
    | 'copilot-hooks'
    | 'prompt-file';
  dest?: string;
  /** prompt-file wiring: the prompt template to install (the JS payload is not the prompt) */
  prompt?: string;
  matcher?: string;
  command?: string;
}

export interface HookRow {
  id: string;
  file: string;
  companions?: string[];
  wiring: Partial<Record<Surface, HookWiring | HookWiring[] | null>>;
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
  version?: string;
  components: ComponentRow[];
  hooks: HookRow[];
  /** per-host wake declaration; an absent host means context-only */
  wake?: Partial<Record<Surface, WakeMode>>;
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
  guide?: ProjectGuidePlan;
  /** wiring actions the apply step performs after file rows (hook settings/config merges). */
  wirings: { surface: Surface; kind: HookWiring['kind']; target: string; detail: string }[];
}

export interface GuideInput {
  path: string;
  kind: 'missing' | 'file' | 'large-file' | 'directory' | 'symlink' | 'other' | 'directories';
  sha256?: string;
}

export interface ProjectGuidePlan {
  destination: string;
  backup: string;
  mode: 'create' | 'same' | 'replace' | 'refuse';
  content: string;
  inputs: GuideInput[];
  backupRequired: boolean;
  note?: string;
}

export interface InstallChoices {
  agent: Surface;
  scope: Scope;
  skills: string[] | 'all';
  agents: boolean;
  projectGuide?: boolean;
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

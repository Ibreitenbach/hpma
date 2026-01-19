import { AssessmentResult, Structure, DuetMode, TrioMode, PolyphonicMode, DyadName } from '@/types/assessment';

// ─────────────────────────────────────────────────────────────────
// Content Schema Types
// ─────────────────────────────────────────────────────────────────

export interface VocabContent {
  version: string;
  enums: {
    structure: string[];
    duet_mode: string[];
    trio_mode: string[];
    polyphonic_mode: string[];
  };
  roles: Record<string, string>;
  structure_labels: Record<string, string>;
  mode_labels: Record<string, string>;
  print_rules: {
    minimal_label: string;
    full_label: string;
    show_math: boolean;
  };
}

export interface PrimaryIdentity {
  name: string;
  tagline: string;
  core_drive: string;
  icon: string;
}

export interface DyadIdentity {
  pair: [string, string];
  name: string;
  tagline: string;
}

export interface IdentitiesContent {
  version: string;
  primaries: Record<string, PrimaryIdentity>;
  dyads: Record<string, DyadIdentity>;
  fallback_template: string;
}

export interface ModeModifiers {
  name: string;
  ratio?: string;
  description?: string;
  adds: {
    strengths?: string[];
    watchouts?: string[];
    prescriptions?: string[];
  };
}

export interface ModesContent {
  version: string;
  duet_modes: Record<string, ModeModifiers>;
  trio_modes: Record<string, ModeModifiers>;
  polyphonic_modes: Record<string, ModeModifiers>;
}

// ─────────────────────────────────────────────────────────────────
// Evaluation Content Types
// ─────────────────────────────────────────────────────────────────

export interface EvidenceHint {
  when: string;
  because: string;
}

// All domain fields are optional to support partial content
export interface StrengthsDomain {
  bullets?: string[];
  evidence_hints?: EvidenceHint[];
}

export interface WatchoutsDomain {
  bullets?: string[];
  telltales?: string[];
}

export interface CareerDomain {
  best_environments?: string[];
  role_patterns?: string[];
  anti_patterns?: string[];
  collaboration?: string[];
}

export interface MoneyDomain {
  style?: string[];
  risks?: string[];
  guardrails?: string[];
}

export interface RelationshipsDomain {
  offers?: string[];
  needs?: string[];
  triggers?: string[];
  repair?: string[];
}

export interface ParentingDomain {
  strengths?: string[];
  traps?: string[];
  do_more?: string[];
  do_less?: string[];
}

export interface HobbiesDomain {
  recharge?: string[];
  play?: string[];
  warning_signs?: string[];
}

export interface SelfImprovementDomain {
  leverage?: string[];
  keystone_constraints?: string[];
  if_then_rules?: string[];
  growth_edges?: string[];
}

export interface CompatibilityMatch {
  match: string;
  why: string;
}

export interface CompatibilityDomain {
  complimentary?: CompatibilityMatch[];
  friction?: CompatibilityMatch[];
  conflict?: CompatibilityMatch[];
  general_notes?: string[];
}

export interface DomainBlocks {
  strengths?: StrengthsDomain;
  watchouts?: WatchoutsDomain;
  career?: CareerDomain;
  money?: MoneyDomain;
  relationships?: RelationshipsDomain;
  parenting?: ParentingDomain;
  hobbies?: HobbiesDomain;
  self_improvement?: SelfImprovementDomain;
  compatibility?: CompatibilityDomain;
}

export interface DyadEvaluation {
  tagline: string;
  domains: DomainBlocks;
}

export interface DyadsContent {
  version: string;
  [key: string]: DyadEvaluation | string;
}

export interface PrimaryEvaluation {
  tagline: string;
  domains: DomainBlocks;
}

export interface PrimariesContent {
  version: string;
  [key: string]: PrimaryEvaluation | string;
}

export interface TriadEvaluation {
  tagline: string;
  domains: DomainBlocks;
}

export interface TriadsContent {
  version: string;
  [key: string]: TriadEvaluation | string;
}

// ─────────────────────────────────────────────────────────────────
// Rules Engine Types
// ─────────────────────────────────────────────────────────────────

export interface RuleSnippet {
  [domain: string]: string[];
}

export interface Rule {
  id: string;
  when: string;
  add_flags: string[];
  add_snippets?: RuleSnippet;
}

export interface RulesContent {
  version: string;
  thresholds: Record<string, number>;
  rules: Rule[];
}

// ─────────────────────────────────────────────────────────────────
// Runtime Types (for report generation)
// ─────────────────────────────────────────────────────────────────

export interface EvaluationContext {
  scores: {
    hexaco: Record<string, number>;
    motives: Record<string, number>;
    affects: Record<string, number>;
  };
  archetypes: Record<string, number>;
  validity: {
    idealized: boolean;
    random: boolean;
    inattentive: boolean;
  };
  roster: {
    structure: Structure;
    duet?: {
      mode: DuetMode;
      identity: DyadName | string;
      anchor: string;
      lens: string;
    };
    trio?: {
      mode: TrioMode;
      primary: string;
      secondary: string;
      tertiary: string;
    };
    choral?: {
      mode: PolyphonicMode;
      anchor?: string;
      contributing: string[];
    };
    metrics: {
      S2: number;
      S3: number;
      r2: number;
      g12: number;
      entropy_n: number;
    };
  };
}

export interface RuleMatch {
  rule_id: string;
  flags: string[];
  snippets: RuleSnippet;
}

export interface FieldGuideReport {
  // Metadata
  version: string;
  generated_at: string;

  // Identity summary
  structure: Structure;
  structure_label: string;
  identity_name: string;
  identity_tagline: string;
  mode_name: string;
  mode_ratio?: string;
  summary_label: string;

  // Roles
  roles: {
    anchor?: { name: string; archetype: string };
    lens?: { name: string; archetype: string };
    accent?: { name: string; archetype: string };
    shadow?: { name: string; archetype: string };
    keystone?: { name: string; archetype: string };
    voices?: Array<{ name: string; archetype: string }>;
  };

  // Content blocks (merged from identity + mode + rules)
  domains: {
    strengths: {
      bullets: string[];
      notes: string[];
      evidence: string[];
    };
    watchouts: {
      bullets: string[];
      telltales: string[];
      notes: string[];
    };
    career: {
      best_environments: string[];
      role_patterns: string[];
      anti_patterns: string[];
      collaboration: string[];
      notes: string[];
    };
    money: {
      style: string[];
      risks: string[];
      guardrails: string[];
      notes: string[];
    };
    relationships: {
      offers: string[];
      needs: string[];
      triggers: string[];
      repair: string[];
      notes: string[];
    };
    parenting: {
      strengths: string[];
      traps: string[];
      do_more: string[];
      do_less: string[];
      notes: string[];
    };
    hobbies: {
      recharge: string[];
      play: string[];
      warning_signs: string[];
      notes: string[];
    };
    self_improvement: {
      leverage: string[];
      keystone_constraints: string[];
      if_then_rules: string[];
      growth_edges: string[];
      notes: string[];
    };
    compatibility: {
      complimentary: CompatibilityMatch[];
      friction: CompatibilityMatch[];
      conflict: CompatibilityMatch[];
      general_notes: string[];
    };
    validity?: {
      notes: string[];
    };
  };

  // Glass-box trace
  trace: {
    flags: string[];
    matched_rules: string[];
    selected_blocks: string[];
  };
}

// ─────────────────────────────────────────────────────────────────
// Loaded Content Bundle
// ─────────────────────────────────────────────────────────────────

export interface ContentBundle {
  vocab: VocabContent;
  identities: IdentitiesContent;
  modes: ModesContent;
  dyads: DyadsContent;
  primaries: PrimariesContent;
  triads: TriadsContent;
  rules: RulesContent;
}

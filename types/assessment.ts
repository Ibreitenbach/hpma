// HPMA - Hybrid Personality Matrix Assessment Types

export type TraitDomain = 'H' | 'E' | 'X' | 'A' | 'C' | 'O';
export type MotiveDomain = 'security' | 'belonging' | 'status' | 'mastery' | 'autonomy' | 'purpose';
export type AffectDomain = 'seeking' | 'fear' | 'anger' | 'care' | 'grief' | 'play' | 'desire';

export interface Question {
  id: number;
  text: string;
  domain: TraitDomain | 'motive' | 'affect' | 'validity';
  subdomain: string;
  reversed: boolean;
}

export interface HEXACOProfile {
  H: number; // Honesty-Humility
  E: number; // Emotionality
  X: number; // Extraversion
  A: number; // Agreeableness
  C: number; // Conscientiousness
  O: number; // Openness
}

export interface MotiveProfile {
  security: number;
  belonging: number;
  status: number;
  mastery: number;
  autonomy: number;
  purpose: number;
}

export interface AffectProfile {
  seeking: number;
  fear: number;
  anger: number;
  care: number;
  grief: number;
  play: number;
  desire: number;
}

export interface ArchetypeProbabilities {
  explorer: number;
  organizer: number;
  connector: number;
  protector: number;
  performer: number;
  philosopher: number;
}

// Blend Mode System (Anchor-Lens Model) - Legacy
export type BlendMode = 'fusion' | 'anchor-lens' | 'inverse-anchor-lens' | 'diffuse';

export type SwitcherBehavior = 'flip' | 'integrate' | 'unknown';

export interface BlendProfile {
  mode: BlendMode;
  isTrueDyad: boolean;           // S >= 0.70
  pairStrength: number;          // S = P1 + P2
  blendRatio: number;            // r = P1 / (P1 + P2)
  anchor: keyof ArchetypeProbabilities;
  lens: keyof ArchetypeProbabilities;
  anchorProbability: number;
  lensProbability: number;
  label: string;                 // e.g., "Explorer–Philosopher Fusion"
  description: string;
  switcherBehavior: SwitcherBehavior;  // For Fusion profiles
}

// ═══════════════════════════════════════════════════════════════
// HPMA ROSTER CLASSIFICATION SPEC v1.0
// ═══════════════════════════════════════════════════════════════

export type ShapeClass = 'monophonic' | 'dyadic' | 'triadic' | 'polyphonic' | 'diffuse';

export type DyadBlendClass =
  | 'fusion'           // r2 ∈ [0.45, 0.55] - 50/50
  | 'tilted_fusion'    // r2 ∈ (0.55, 0.65] - 60/40
  | 'anchor_lens'      // r2 ∈ (0.65, 0.80] - 75/25
  | 'dominant_trace'   // r2 ∈ (0.80, 0.92] - 85/15
  | 'near_pure';       // r2 ∈ (0.92, 1.00] - 95/5

export type TriadClass =
  | 'triad_fusion'           // All 3 within ±8% → "A–B–C Triad"
  | 'anchor_dual_lenses'     // One anchor > lens1 ≈ lens2 → "A Anchor, B+C Dual Lenses"
  | 'anchor_lens_shadow';    // Clear rank → "A Anchor, B Lens, C Shadow"

export type ArchetypeName = keyof ArchetypeProbabilities;

export interface SortedArchetype {
  name: ArchetypeName;
  probability: number;
}

export interface DerivedMetrics {
  S2: number;          // p1 + p2
  S3: number;          // p1 + p2 + p3
  r2: number;          // p1 / (p1 + p2)
  g12: number;         // p1 - p2 (gap)
  entropy_n: number;   // normalized Shannon entropy
}

export interface DyadRoster {
  blend_class: DyadBlendClass;
  anchor: ArchetypeName;
  lens: ArchetypeName;
  label: string;       // e.g., "Explorer–Connector Anchor-Lens"
  description: string;
}

export interface TriadRoster {
  triad_class: TriadClass;
  primary: ArchetypeName;
  secondary: ArchetypeName;
  tertiary: ArchetypeName;
  label: string;       // e.g., "Explorer–Philosopher–Connector Triad"
  description: string;
}

export interface PolyphonicRoster {
  contributing: ArchetypeName[];  // All with p >= 0.12
  label: string;
  description: string;
}

export interface ConfidenceMetrics {
  shape_conf: 'HIGH' | 'MEDIUM' | 'LOW';
  blend_gap: number;   // Distance from nearest threshold
  notes: string[];     // Any flags or edge cases
}

export interface RosterOutput {
  version: 'HPMA-RosterSpec-1.0';
  sorted_probs: SortedArchetype[];
  metrics: DerivedMetrics;
  shape_class: ShapeClass;
  dyad?: DyadRoster;
  triad?: TriadRoster;
  polyphonic?: PolyphonicRoster;
  confidence: ConfidenceMetrics;
  summary_label: string;  // One-line human-readable summary
}

export interface ValidityFlags {
  idealized: boolean;
  random: boolean;
  inattentive: boolean;
}

export interface AssessmentResult {
  responses: Record<number, number>;
  hexaco: HEXACOProfile;
  motives: MotiveProfile;
  affects: AffectProfile;
  archetypes: ArchetypeProbabilities;
  archetypeUncertainty: number; // gap between top 2 probabilities
  blendProfile: BlendProfile;   // Anchor-Lens blend mode analysis (legacy)
  roster: RosterOutput;         // HPMA Roster Spec v1.0
  validity: ValidityFlags;
  completedAt: string;
  durationMs: number;
}

// For D3 visualizations
export interface GraphNode {
  id: string;
  label: string;
  type: 'trait' | 'motive' | 'affect';
  value: number; // score 1-7
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number; // correlation strength 0-1
}

export interface HypergraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Assessment state for context
export interface AssessmentState {
  currentIndex: number;
  responses: Record<number, number>;
  startTime: number;
  isComplete: boolean;
}

export type AssessmentAction =
  | { type: 'SET_RESPONSE'; questionId: number; value: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'GO_TO_QUESTION'; index: number }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }
  | { type: 'RESTORE'; state: Partial<AssessmentState> };

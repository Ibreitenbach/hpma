// HPMA - Hybrid Personality Matrix Assessment Types

export type TraitDomain = 'H' | 'E' | 'X' | 'A' | 'C' | 'O';

// ═══════════════════════════════════════════════════════════════
// HPMA v1.0 - Facet-Level Types
// ═══════════════════════════════════════════════════════════════

export type HEXACOFacet =
  | 'sincerity' | 'fairness' | 'greed_avoidance' | 'modesty'           // H
  | 'fearfulness' | 'anxiety' | 'dependence' | 'sentimentality'        // E
  | 'social_boldness' | 'sociability' | 'liveliness' | 'self_esteem'   // X
  | 'forgivingness' | 'gentleness' | 'flexibility' | 'patience'        // A
  | 'organization' | 'diligence' | 'perfectionism' | 'prudence'        // C
  | 'aesthetic_appreciation' | 'inquisitiveness' | 'creativity' | 'unconventionality'; // O

export type ContextType = 'BASELINE' | 'WORK' | 'STRESS' | 'INTIMACY' | 'PUBLIC';

export interface QuestionV2 {
  id: number;                // UI ordering only
  facetId: string;           // scoring key e.g. "H_SIN_01", "AT_ANX_01"
  text: string;
  module: 'hexaco' | 'motive' | 'affect' | 'validity' | 'attachment' | 'antagonism' | 'context';
  domain: TraitDomain | 'motive' | 'affect' | 'validity' | 'attachment' | 'antagonism';
  subdomain: string;
  reversed: boolean;
  contextSentinel?: boolean; // true for 24 specific HEXACO items
  context?: ContextType;     // BASELINE | WORK | STRESS | INTIMACY | PUBLIC
}
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
// HPMA ROSTER VOCABULARY v1.0
// ═══════════════════════════════════════════════════════════════

export type ArchetypeName = keyof ArchetypeProbabilities;

// Structure = "how many voices matter?"
export type Structure =
  | 'SOLO'     // Monophonic - single dominant voice
  | 'DUET'     // Dyadic - two voices form a pair
  | 'TRIO'     // Triadic - three voices form a triad
  | 'CHORD'    // Polyphonic top-heavy (structured multi-voice)
  | 'CHORUS'   // Polyphonic distributed (many active voices)
  | 'MIST'     // Diffuse - no clear voice dominance
  | 'FAULTED'; // Invalid/low-quality response

// Legacy shape class (for compatibility)
export type ShapeClass = 'monophonic' | 'dyadic' | 'triadic' | 'polyphonic' | 'diffuse';

// Duet Mode = ratio pattern for two-voice structures
export type DuetMode =
  | 'TWIN_HELIX'        // ~50/50 (Fusion)
  | 'LEANING_HELIX'     // ~60/40 (Tilted Fusion)
  | 'KEYSTONE_LENS'     // ~75/25 (Anchor-Lens)
  | 'SIGNATURE_ACCENT'  // ~90/10 (Dominant-Trace)
  | 'PURELINE';         // ~95/5+ (Near-Pure)

// Legacy blend class (for compatibility)
export type DyadBlendClass =
  | 'fusion'           // r2 ∈ [0.45, 0.55] - 50/50
  | 'tilted_fusion'    // r2 ∈ (0.55, 0.65] - 60/40
  | 'anchor_lens'      // r2 ∈ (0.65, 0.80] - 75/25
  | 'dominant_trace'   // r2 ∈ (0.80, 0.92] - 85/15
  | 'near_pure';       // r2 ∈ (0.92, 1.00] - 95/5

// Trio Mode = ratio pattern for three-voice structures
export type TrioMode =
  | 'TRI_HELIX'        // ~33/33/33 (Balanced Triad)
  | 'KEYSTONE_PRISM'   // ~50/25/25 (Anchor + Dual Lenses)
  | 'KEYSTONE_ORBIT'   // ~60/25/15 (Anchor-Lens-Shadow)
  | 'TRIAD_STACK';     // Other triads that don't fit cleanly

// Legacy triad class (for compatibility)
export type TriadClass =
  | 'triad_fusion'           // All 3 within ±8% → "A–B–C Triad"
  | 'anchor_dual_lenses'     // One anchor > lens1 ≈ lens2
  | 'anchor_lens_shadow';    // Clear rank

// Polyphonic Mode = pattern for multi-voice structures
export type PolyphonicMode =
  | 'CHORD_TOP4'       // Top 4 voices meaningful, still structured
  | 'CHORD_TOP_HEAVY'  // Top 3 strong but p4 too big for Trio
  | 'CHORUS_DISTRIBUTED'   // 4-6 voices with similar weights
  | 'CHORUS_CONTEXT_SPLIT'; // Anchor changes by context (future)

// Canonical Dyad Names (15 pairs)
export type DyadName =
  | 'Seeker-Sage'           // Explorer + Philosopher
  | 'Visionary Builder'     // Explorer + Organizer
  | 'Wayfinder Diplomat'    // Explorer + Connector
  | 'Sentinel Scout'        // Explorer + Protector
  | 'Spotlight Pioneer'     // Explorer + Performer
  | 'Systems Theorist'      // Philosopher + Organizer
  | 'Bridge Scholar'        // Philosopher + Connector
  | 'Vigilant Stoic'        // Philosopher + Protector
  | 'Public Intellectual'   // Philosopher + Performer
  | 'Community Operator'    // Organizer + Connector
  | 'Risk Steward'          // Organizer + Protector
  | 'Showrunner Executive'  // Organizer + Performer
  | 'Guardian Caretaker'    // Connector + Protector
  | 'Charismatic Host'      // Connector + Performer
  | 'Watchful Champion';    // Protector + Performer

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

// Vocabulary-based roster for Duets
export interface DuetRoster {
  mode: DuetMode;
  identity: DyadName | string;  // Canonical name or fallback "A–B Hybrid"
  anchor: ArchetypeName;        // The leading voice
  lens: ArchetypeName;          // The shaping voice (or accent for Signature mode)
  label: string;                // e.g., "Duet: Seeker-Sage — Twin-Helix"
  description: string;
}

// Legacy DyadRoster (for compatibility)
export interface DyadRoster {
  blend_class: DyadBlendClass;
  anchor: ArchetypeName;
  lens: ArchetypeName;
  label: string;
  description: string;
}

// Vocabulary-based roster for Trios
export interface TrioRoster {
  mode: TrioMode;
  primary: ArchetypeName;       // Keystone/Anchor
  secondary: ArchetypeName;     // Lens
  tertiary: ArchetypeName;      // Shadow or third lens
  label: string;                // e.g., "Trio: Explorer Keystone Orbit (Lens: Philosopher; Shadow: Connector)"
  description: string;
}

// Legacy TriadRoster (for compatibility)
export interface TriadRoster {
  triad_class: TriadClass;
  primary: ArchetypeName;
  secondary: ArchetypeName;
  tertiary: ArchetypeName;
  label: string;
  description: string;
}

// Vocabulary-based roster for Polyphonic
export interface ChoralRoster {
  mode: PolyphonicMode;
  anchor?: ArchetypeName;       // May exist for Chord
  contributing: ArchetypeName[]; // All active voices
  label: string;
  description: string;
}

// Legacy PolyphonicRoster (for compatibility)
export interface PolyphonicRoster {
  contributing: ArchetypeName[];
  label: string;
  description: string;
}

export interface ConfidenceMetrics {
  shape_conf: 'HIGH' | 'MEDIUM' | 'LOW';
  blend_gap: number;   // Distance from nearest threshold
  notes: string[];     // Any flags or edge cases
}

export interface RosterOutput {
  version: 'HPMA-Vocabulary-1.0';
  sorted_probs: SortedArchetype[];
  metrics: DerivedMetrics;

  // New vocabulary-based classification
  structure: Structure;
  duet?: DuetRoster;
  trio?: TrioRoster;
  choral?: ChoralRoster;

  // Legacy classification (for compatibility)
  shape_class: ShapeClass;
  dyad?: DyadRoster;
  triad?: TriadRoster;
  polyphonic?: PolyphonicRoster;

  confidence: ConfidenceMetrics;
  summary_label: string;  // e.g., "Duet: Seeker-Sage — Twin-Helix"
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

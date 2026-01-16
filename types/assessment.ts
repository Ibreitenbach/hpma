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

// Blend Mode System (Anchor-Lens Model)
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
  blendProfile: BlendProfile;   // Anchor-Lens blend mode analysis
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

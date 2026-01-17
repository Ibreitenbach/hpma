/**
 * HPMA v1.0 Scoring Pipeline
 *
 * Handles facet-level HEXACO scoring, attachment, antagonism,
 * and context dependence calculations.
 */

import type {
  QuestionV2,
  HEXACOFacet,
  ContextType,
  TraitDomain,
  AttachmentProfile,
  AttachmentStyle,
  AntagonismProfile,
  ContextDelta,
  ContextProfile,
  ContextDependenceResult,
  FacetProfile,
  MotiveProfile,
  AffectProfile,
  HEXACOProfile,
} from '@/types/assessment';

import {
  ALL_QUESTIONS_V2,
  BASELINE_QUESTIONS_V2,
  HEXACO_BASELINE_V2,
  HEXACO_SENTINELS_BASELINE,
  MOTIVES_V2,
  AFFECTS_V2,
  ATTACHMENT_V2,
  ANTAGONISM_V2,
  CONTEXT_START,
  HEXACO_FACETS_ORDERED,
} from './questions-v2';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SCALE_MIDPOINT = 4.0;
const ANTAGONISM_THRESHOLD = 5.0;
const DEFAULT_MEAN = 4.0;
const DEFAULT_SD = 1.5;

// Facet → Domain mapping
const FACET_TO_DOMAIN: Record<HEXACOFacet, TraitDomain> = {
  sincerity: 'H', fairness: 'H', greed_avoidance: 'H', modesty: 'H',
  fearfulness: 'E', anxiety: 'E', dependence: 'E', sentimentality: 'E',
  social_boldness: 'X', sociability: 'X', liveliness: 'X', self_esteem: 'X',
  forgivingness: 'A', gentleness: 'A', flexibility: 'A', patience: 'A',
  organization: 'C', diligence: 'C', perfectionism: 'C', prudence: 'C',
  aesthetic_appreciation: 'O', inquisitiveness: 'O', creativity: 'O', unconventionality: 'O',
};

// ═══════════════════════════════════════════════════════════════
// BASIC SCORING UTILITIES
// ═══════════════════════════════════════════════════════════════

export function reverseScore(value: number): number {
  return 8 - value;
}

export function zScore(raw: number, mean: number = DEFAULT_MEAN, sd: number = DEFAULT_SD): number {
  return (raw - mean) / sd;
}

/**
 * Get the effective score for a question, applying reversal if needed.
 */
export function getScoreV2(
  responses: Record<number, number>,
  question: QuestionV2
): number {
  const rawValue = responses[question.id];
  if (rawValue === undefined) return 0;
  return question.reversed ? reverseScore(rawValue) : rawValue;
}

/**
 * Get the effective score by facetId from baseline responses.
 */
export function getScoreByFacetId(
  responses: Record<number, number>,
  facetId: string,
  questions: QuestionV2[] = BASELINE_QUESTIONS_V2
): number {
  const question = questions.find(q => q.facetId === facetId);
  if (!question) return 0;
  return getScoreV2(responses, question);
}

// ═══════════════════════════════════════════════════════════════
// FACET-LEVEL HEXACO SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Compute scores for all 24 HEXACO facets.
 * Groups items by subdomain (facet) and averages them.
 */
export function computeFacetScores(
  responses: Record<number, number>
): Record<HEXACOFacet, number> {
  const facetGroups: Partial<Record<HEXACOFacet, number[]>> = {};

  // Group HEXACO items by subdomain (facet)
  for (const q of HEXACO_BASELINE_V2) {
    const facet = q.subdomain as HEXACOFacet;
    if (!facetGroups[facet]) facetGroups[facet] = [];
    const score = getScoreV2(responses, q);
    if (score > 0) facetGroups[facet]!.push(score);
  }

  // Average each facet
  const result: Partial<Record<HEXACOFacet, number>> = {};
  for (const facet of HEXACO_FACETS_ORDERED) {
    const scores = facetGroups[facet] || [];
    result[facet] = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : DEFAULT_MEAN;  // fallback to neutral if no responses
  }

  return result as Record<HEXACOFacet, number>;
}

/**
 * Compute z-scores for all facets.
 */
export function computeFacetZScores(
  facetScores: Record<HEXACOFacet, number>
): Record<HEXACOFacet, number> {
  const result: Partial<Record<HEXACOFacet, number>> = {};
  for (const facet of HEXACO_FACETS_ORDERED) {
    result[facet] = zScore(facetScores[facet]);
  }
  return result as Record<HEXACOFacet, number>;
}

/**
 * Compute full facet profile (scores + z-scores).
 */
export function computeFacetProfile(
  responses: Record<number, number>
): FacetProfile {
  const scores = computeFacetScores(responses);
  const zScores = computeFacetZScores(scores);
  return { scores, zScores };
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN-LEVEL HEXACO SCORING (from facets)
// ═══════════════════════════════════════════════════════════════

/**
 * Compute domain scores by averaging their facets.
 */
export function computeHEXACOFromFacets(
  facetScores: Record<HEXACOFacet, number>
): HEXACOProfile {
  const domainScores: Record<TraitDomain, number[]> = {
    H: [], E: [], X: [], A: [], C: [], O: []
  };

  for (const facet of HEXACO_FACETS_ORDERED) {
    const domain = FACET_TO_DOMAIN[facet];
    domainScores[domain].push(facetScores[facet]);
  }

  return {
    H: avg(domainScores.H),
    E: avg(domainScores.E),
    X: avg(domainScores.X),
    A: avg(domainScores.A),
    C: avg(domainScores.C),
    O: avg(domainScores.O),
  };
}

// ═══════════════════════════════════════════════════════════════
// MOTIVE SCORING
// ═══════════════════════════════════════════════════════════════

export function computeMotivesV2(responses: Record<number, number>): MotiveProfile {
  const grouped = groupBySubdomain(MOTIVES_V2, responses);
  return {
    security: grouped.security || DEFAULT_MEAN,
    belonging: grouped.belonging || DEFAULT_MEAN,
    status: grouped.status || DEFAULT_MEAN,
    mastery: grouped.mastery || DEFAULT_MEAN,
    autonomy: grouped.autonomy || DEFAULT_MEAN,
    purpose: grouped.purpose || DEFAULT_MEAN,
  };
}

// ═══════════════════════════════════════════════════════════════
// AFFECT SCORING
// ═══════════════════════════════════════════════════════════════

export function computeAffectsV2(responses: Record<number, number>): AffectProfile {
  const grouped = groupBySubdomain(AFFECTS_V2, responses);
  return {
    seeking: grouped.seeking || DEFAULT_MEAN,
    fear: grouped.fear || DEFAULT_MEAN,
    anger: grouped.anger || DEFAULT_MEAN,
    care: grouped.care || DEFAULT_MEAN,
    grief: grouped.grief || DEFAULT_MEAN,
    play: grouped.play || DEFAULT_MEAN,
    desire: grouped.desire || DEFAULT_MEAN,
  };
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Compute attachment profile based on anxiety and avoidance dimensions.
 * Uses Bartholomew's four-category model:
 * - SECURE: low anxiety, low avoidance
 * - PREOCCUPIED: high anxiety, low avoidance
 * - DISMISSIVE: low anxiety, high avoidance
 * - FEARFUL: high anxiety, high avoidance
 */
export function computeAttachment(responses: Record<number, number>): AttachmentProfile {
  const grouped = groupBySubdomain(ATTACHMENT_V2, responses);

  const anxiety = grouped.anxiety || DEFAULT_MEAN;
  const avoidance = grouped.avoidance || DEFAULT_MEAN;

  // Quadrant classification
  let style: AttachmentStyle;
  let confidence: number;

  const anxiousHigh = anxiety >= SCALE_MIDPOINT;
  const avoidantHigh = avoidance >= SCALE_MIDPOINT;

  if (!anxiousHigh && !avoidantHigh) {
    style = 'SECURE';
    // Confidence = how far into the quadrant (both dimensions)
    confidence = Math.min(SCALE_MIDPOINT - anxiety, SCALE_MIDPOINT - avoidance) / SCALE_MIDPOINT;
  } else if (anxiousHigh && !avoidantHigh) {
    style = 'PREOCCUPIED';
    confidence = Math.min(anxiety - SCALE_MIDPOINT, SCALE_MIDPOINT - avoidance) / 3;
  } else if (!anxiousHigh && avoidantHigh) {
    style = 'DISMISSIVE';
    confidence = Math.min(SCALE_MIDPOINT - anxiety, avoidance - SCALE_MIDPOINT) / 3;
  } else {
    style = 'FEARFUL';
    confidence = Math.min(anxiety - SCALE_MIDPOINT, avoidance - SCALE_MIDPOINT) / 3;
  }

  return {
    anxiety,
    avoidance,
    style,
    confidence: Math.min(Math.max(confidence, 0), 1), // clamp 0-1
  };
}

// ═══════════════════════════════════════════════════════════════
// ANTAGONISM SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Compute antagonism profile across 4 facets.
 * Flag as "elevated" if composite >= 5.0.
 */
export function computeAntagonism(responses: Record<number, number>): AntagonismProfile {
  const grouped = groupBySubdomain(ANTAGONISM_V2, responses);

  const exploitative = grouped.exploitative || DEFAULT_MEAN;
  const callous = grouped.callous || DEFAULT_MEAN;
  const combative = grouped.combative || DEFAULT_MEAN;
  const image_driven = grouped.image_driven || DEFAULT_MEAN;

  const composite = (exploitative + callous + combative + image_driven) / 4;
  const elevated = composite >= ANTAGONISM_THRESHOLD;

  return {
    exploitative,
    callous,
    combative,
    image_driven,
    composite,
    elevated,
  };
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT DEPENDENCE SCORING
// ═══════════════════════════════════════════════════════════════

type NonBaselineContext = Exclude<ContextType, 'BASELINE'>;
const CONTEXT_TYPES: NonBaselineContext[] = ['WORK', 'STRESS', 'INTIMACY', 'PUBLIC'];

/**
 * Compute context dependence by comparing context responses to baseline.
 * Uses sentinel items (24 forward-keyed HEXACO items) that are re-asked
 * in each context.
 */
export function computeContextDependence(
  baselineResponses: Record<number, number>,
  contextResponses: Record<NonBaselineContext, Record<number, number>>
): ContextDependenceResult {
  const contexts: Partial<Record<NonBaselineContext, ContextProfile>> = {};
  const allDeltas: number[] = [];
  const facetVolatility: Partial<Record<HEXACOFacet, number[]>> = {};

  for (const ctx of CONTEXT_TYPES) {
    const ctxResponses = contextResponses[ctx] || {};
    const deltas: ContextDelta[] = [];
    const ctxStartId = CONTEXT_START[ctx];

    // For each sentinel, compute the delta between baseline and context
    HEXACO_SENTINELS_BASELINE.forEach((sentinel, idx) => {
      const facet = sentinel.subdomain as HEXACOFacet;
      const baselineScore = getScoreV2(baselineResponses, sentinel);

      // Context item ID = CONTEXT_START[ctx] + sentinel index
      const contextId = ctxStartId + idx;
      const contextScore = ctxResponses[contextId] !== undefined
        ? ctxResponses[contextId]  // Context items are all forward-keyed
        : baselineScore;           // Fallback to baseline if not answered

      const delta = contextScore - baselineScore;

      deltas.push({
        facet,
        facetId: sentinel.facetId,
        baseline: baselineScore,
        contextScore,
        delta,
      });

      allDeltas.push(Math.abs(delta));

      if (!facetVolatility[facet]) facetVolatility[facet] = [];
      facetVolatility[facet]!.push(Math.abs(delta));
    });

    // Sort by |delta| to find top shifts
    const sortedDeltas = [...deltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    const topShifts = sortedDeltas.slice(0, 3);

    // Classify shift pattern
    const avgDelta = avg(deltas.map(d => Math.abs(d.delta)));
    let shiftPattern: 'STABLE' | 'MODERATE' | 'VOLATILE';
    if (avgDelta < 0.5) shiftPattern = 'STABLE';
    else if (avgDelta < 1.5) shiftPattern = 'MODERATE';
    else shiftPattern = 'VOLATILE';

    contexts[ctx] = {
      context: ctx,
      deltas,
      topShifts,
      shiftPattern,
    };
  }

  // Overall volatility
  const overallVolatility = allDeltas.length > 0 ? avg(allDeltas) : 0;

  // Find most/least volatile facets
  const facetAvgVolatility: [HEXACOFacet, number][] = [];
  for (const facet of HEXACO_FACETS_ORDERED) {
    const volatilityScores = facetVolatility[facet] || [];
    if (volatilityScores.length > 0) {
      facetAvgVolatility.push([facet, avg(volatilityScores)]);
    }
  }
  facetAvgVolatility.sort((a, b) => b[1] - a[1]);

  const mostContextDependentFacets = facetAvgVolatility.slice(0, 3).map(([f]) => f);
  const mostStableFacets = facetAvgVolatility.slice(-3).reverse().map(([f]) => f);

  return {
    contexts: contexts as Record<NonBaselineContext, ContextProfile>,
    overallVolatility,
    mostContextDependentFacets,
    mostStableFacets,
  };
}

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATOR: Full Profile Computation
// ═══════════════════════════════════════════════════════════════

export interface FullProfileV2 {
  facetProfile: FacetProfile;
  hexaco: HEXACOProfile;
  motives: MotiveProfile;
  affects: AffectProfile;
  attachment: AttachmentProfile;
  antagonism: AntagonismProfile;
  contextDependence: ContextDependenceResult;
}

/**
 * Compute the full v2 profile from responses.
 */
export function computeFullProfileV2(
  baselineResponses: Record<number, number>,
  contextResponses: Record<NonBaselineContext, Record<number, number>> = {
    WORK: {}, STRESS: {}, INTIMACY: {}, PUBLIC: {}
  }
): FullProfileV2 {
  const facetProfile = computeFacetProfile(baselineResponses);
  const hexaco = computeHEXACOFromFacets(facetProfile.scores);
  const motives = computeMotivesV2(baselineResponses);
  const affects = computeAffectsV2(baselineResponses);
  const attachment = computeAttachment(baselineResponses);
  const antagonism = computeAntagonism(baselineResponses);
  const contextDependence = computeContextDependence(baselineResponses, contextResponses);

  return {
    facetProfile,
    hexaco,
    motives,
    affects,
    attachment,
    antagonism,
    contextDependence,
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Group questions by subdomain and compute average score for each.
 */
function groupBySubdomain(
  questions: QuestionV2[],
  responses: Record<number, number>
): Record<string, number> {
  const groups: Record<string, number[]> = {};

  for (const q of questions) {
    if (!groups[q.subdomain]) groups[q.subdomain] = [];
    const score = getScoreV2(responses, q);
    if (score > 0) groups[q.subdomain].push(score);
  }

  const result: Record<string, number> = {};
  for (const [subdomain, scores] of Object.entries(groups)) {
    result[subdomain] = scores.length > 0 ? avg(scores) : DEFAULT_MEAN;
  }

  return result;
}

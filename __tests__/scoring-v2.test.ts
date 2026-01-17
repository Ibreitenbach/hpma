/**
 * HPMA v1.0 Scoring Pipeline Tests
 */

import {
  computeFacetScores,
  computeFacetZScores,
  computeAttachment,
  computeAntagonism,
  computeContextDependence,
  computeFullProfileV2,
  getScoreV2,
  reverseScore,
} from '../lib/scoring-v2';

import {
  HEXACO_BASELINE_V2,
  ATTACHMENT_V2,
  ANTAGONISM_V2,
  HEXACO_SENTINELS_BASELINE,
  CONTEXT_START,
} from '../lib/questions-v2';

import type { HEXACOFacet } from '../types/assessment';

// Helper to create mock responses
function mockResponses(ids: number[], value: number): Record<number, number> {
  const responses: Record<number, number> = {};
  for (const id of ids) {
    responses[id] = value;
  }
  return responses;
}

describe('Basic Scoring Utilities', () => {
  test('reverseScore correctly reverses 1-7 scale', () => {
    expect(reverseScore(1)).toBe(7);
    expect(reverseScore(4)).toBe(4);
    expect(reverseScore(7)).toBe(1);
  });

  test('getScoreV2 applies reversal for reversed items', () => {
    // Item 2 is reversed (H_SIN_02)
    const reversedItem = HEXACO_BASELINE_V2.find(q => q.id === 2)!;
    expect(reversedItem.reversed).toBe(true);

    const responses = { 2: 6 };
    const score = getScoreV2(responses, reversedItem);
    expect(score).toBe(2); // 8 - 6 = 2
  });

  test('getScoreV2 returns raw value for non-reversed items', () => {
    const forwardItem = HEXACO_BASELINE_V2.find(q => q.id === 1)!;
    expect(forwardItem.reversed).toBe(false);

    const responses = { 1: 5 };
    const score = getScoreV2(responses, forwardItem);
    expect(score).toBe(5);
  });
});

describe('Facet Scoring', () => {
  test('computeFacetScores returns all 24 facets', () => {
    const allHexacoIds = HEXACO_BASELINE_V2.map(q => q.id);
    const responses = mockResponses(allHexacoIds, 4);
    const facetScores = computeFacetScores(responses);

    expect(Object.keys(facetScores)).toHaveLength(24);
  });

  test('computeFacetScores averages items within each facet', () => {
    // Sincerity has 2 items: id 1 (forward) and id 2 (reversed)
    const responses = {
      1: 6,  // forward, score = 6
      2: 2,  // reversed, score = 8-2 = 6
    };
    const facetScores = computeFacetScores(responses);

    expect(facetScores.sincerity).toBe(6);
  });

  test('computeFacetZScores normalizes to z-scores', () => {
    const facetScores: Record<HEXACOFacet, number> = {
      sincerity: 5.5, fairness: 4, greed_avoidance: 4, modesty: 4,
      fearfulness: 4, anxiety: 4, dependence: 4, sentimentality: 4,
      social_boldness: 4, sociability: 4, liveliness: 4, self_esteem: 4,
      forgivingness: 4, gentleness: 4, flexibility: 4, patience: 4,
      organization: 4, diligence: 4, perfectionism: 4, prudence: 4,
      aesthetic_appreciation: 4, inquisitiveness: 4, creativity: 4, unconventionality: 4,
    };

    const zScores = computeFacetZScores(facetScores);

    // 5.5 raw → z = (5.5 - 4) / 1.5 = 1.0
    expect(zScores.sincerity).toBe(1);

    // 4.0 raw → z = 0
    expect(zScores.fairness).toBe(0);
  });
});

describe('Attachment Scoring', () => {
  test('low anxiety + low avoidance = SECURE', () => {
    // Anxiety items: 201-206, Avoidance items: 207-212
    const responses = mockResponses([...Array(12).keys()].map(i => 201 + i), 2);
    const profile = computeAttachment(responses);

    expect(profile.style).toBe('SECURE');
    expect(profile.anxiety).toBeLessThan(4);
    expect(profile.avoidance).toBeLessThan(4);
  });

  test('high anxiety + low avoidance = PREOCCUPIED', () => {
    const responses: Record<number, number> = {};
    // High anxiety (201-206)
    for (let i = 201; i <= 206; i++) responses[i] = 6;
    // Low avoidance (207-212)
    for (let i = 207; i <= 212; i++) responses[i] = 2;

    const profile = computeAttachment(responses);
    expect(profile.style).toBe('PREOCCUPIED');
  });

  test('low anxiety + high avoidance = DISMISSIVE', () => {
    const responses: Record<number, number> = {};
    // Low anxiety
    for (let i = 201; i <= 206; i++) responses[i] = 2;
    // High avoidance
    for (let i = 207; i <= 212; i++) responses[i] = 6;

    const profile = computeAttachment(responses);
    expect(profile.style).toBe('DISMISSIVE');
  });

  test('high anxiety + high avoidance = FEARFUL', () => {
    const responses = mockResponses([...Array(12).keys()].map(i => 201 + i), 6);
    const profile = computeAttachment(responses);

    expect(profile.style).toBe('FEARFUL');
  });
});

describe('Antagonism Scoring', () => {
  test('low scores = not elevated', () => {
    const responses = mockResponses([...Array(16).keys()].map(i => 301 + i), 2);
    const profile = computeAntagonism(responses);

    expect(profile.elevated).toBe(false);
    expect(profile.composite).toBeLessThan(5);
  });

  test('high scores = elevated', () => {
    const responses = mockResponses([...Array(16).keys()].map(i => 301 + i), 6);
    const profile = computeAntagonism(responses);

    expect(profile.elevated).toBe(true);
    expect(profile.composite).toBeGreaterThanOrEqual(5);
  });

  test('correctly computes all 4 subscales', () => {
    const responses: Record<number, number> = {};
    // Exploitative (301-304): high
    for (let i = 301; i <= 304; i++) responses[i] = 7;
    // Callous (305-308): medium
    for (let i = 305; i <= 308; i++) responses[i] = 4;
    // Combative (309-312): low
    for (let i = 309; i <= 312; i++) responses[i] = 2;
    // Image-driven (313-316): medium-high
    for (let i = 313; i <= 316; i++) responses[i] = 5;

    const profile = computeAntagonism(responses);

    expect(profile.exploitative).toBe(7);
    expect(profile.callous).toBe(4);
    expect(profile.combative).toBe(2);
    expect(profile.image_driven).toBe(5);
    expect(profile.composite).toBe((7 + 4 + 2 + 5) / 4);
  });
});

describe('Context Dependence Scoring', () => {
  test('computes deltas for each context', () => {
    // Baseline responses: all sentinels = 4
    const baselineResponses: Record<number, number> = {};
    for (const sentinel of HEXACO_SENTINELS_BASELINE) {
      baselineResponses[sentinel.id] = 4;
    }

    // Context responses: WORK all = 6 (shift of +2)
    const contextResponses = {
      WORK: {} as Record<number, number>,
      STRESS: {} as Record<number, number>,
      INTIMACY: {} as Record<number, number>,
      PUBLIC: {} as Record<number, number>,
    };

    // Fill WORK context with 6s
    for (let i = 0; i < 24; i++) {
      contextResponses.WORK[CONTEXT_START.WORK + i] = 6;
    }

    const result = computeContextDependence(baselineResponses, contextResponses);

    // WORK should show positive deltas
    expect(result.contexts.WORK).toBeDefined();
    expect(result.contexts.WORK.deltas.every(d => d.delta === 2)).toBe(true);
    expect(result.contexts.WORK.shiftPattern).toBe('VOLATILE');
  });

  test('identifies stable pattern when deltas are small', () => {
    const baselineResponses: Record<number, number> = {};
    for (const sentinel of HEXACO_SENTINELS_BASELINE) {
      baselineResponses[sentinel.id] = 4;
    }

    // All context responses = 4 (same as baseline)
    const contextResponses = {
      WORK: {} as Record<number, number>,
      STRESS: {} as Record<number, number>,
      INTIMACY: {} as Record<number, number>,
      PUBLIC: {} as Record<number, number>,
    };

    for (const ctx of ['WORK', 'STRESS', 'INTIMACY', 'PUBLIC'] as const) {
      for (let i = 0; i < 24; i++) {
        contextResponses[ctx][CONTEXT_START[ctx] + i] = 4;
      }
    }

    const result = computeContextDependence(baselineResponses, contextResponses);

    expect(result.overallVolatility).toBe(0);
    expect(result.contexts.WORK.shiftPattern).toBe('STABLE');
  });
});

describe('Full Profile V2 Integration', () => {
  test('computeFullProfileV2 returns all profile components', () => {
    // Create mock responses for all baseline items
    const baselineResponses: Record<number, number> = {};

    // HEXACO (1-48)
    for (let i = 1; i <= 48; i++) baselineResponses[i] = 4;
    // Motives (49-78)
    for (let i = 49; i <= 78; i++) baselineResponses[i] = 4;
    // Affects (79-106)
    for (let i = 79; i <= 106; i++) baselineResponses[i] = 4;
    // Validity (107-112)
    for (let i = 107; i <= 112; i++) baselineResponses[i] = 4;
    // Attachment (201-212)
    for (let i = 201; i <= 212; i++) baselineResponses[i] = 2;
    // Antagonism (301-316)
    for (let i = 301; i <= 316; i++) baselineResponses[i] = 2;

    const profile = computeFullProfileV2(baselineResponses);

    // Check all components exist
    expect(profile.facetProfile).toBeDefined();
    expect(profile.facetProfile.scores).toBeDefined();
    expect(profile.facetProfile.zScores).toBeDefined();
    expect(Object.keys(profile.facetProfile.scores)).toHaveLength(24);

    expect(profile.hexaco).toBeDefined();
    expect(profile.hexaco.H).toBeDefined();

    expect(profile.motives).toBeDefined();
    expect(profile.motives.security).toBeDefined();

    expect(profile.affects).toBeDefined();
    expect(profile.affects.seeking).toBeDefined();

    expect(profile.attachment).toBeDefined();
    expect(profile.attachment.style).toBe('SECURE');

    expect(profile.antagonism).toBeDefined();
    expect(profile.antagonism.elevated).toBe(false);

    expect(profile.contextDependence).toBeDefined();
    expect(profile.contextDependence.contexts.WORK).toBeDefined();
  });
});

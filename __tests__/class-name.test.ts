/**
 * HPMA v1.0 Class Name Generator Tests
 */

import { computeEpithets, generateClassName } from '../lib/class-name';
import type {
  FacetProfile,
  MotiveProfile,
  AffectProfile,
  AttachmentProfile,
  AntagonismProfile,
  HEXACOFacet,
  RosterOutput,
} from '../types/assessment';

// Helper to create a neutral facet profile
function neutralFacetProfile(): FacetProfile {
  const facets: HEXACOFacet[] = [
    'sincerity', 'fairness', 'greed_avoidance', 'modesty',
    'fearfulness', 'anxiety', 'dependence', 'sentimentality',
    'social_boldness', 'sociability', 'liveliness', 'self_esteem',
    'forgivingness', 'gentleness', 'flexibility', 'patience',
    'organization', 'diligence', 'perfectionism', 'prudence',
    'aesthetic_appreciation', 'inquisitiveness', 'creativity', 'unconventionality',
  ];

  const scores: Record<HEXACOFacet, number> = {} as any;
  const zScores: Record<HEXACOFacet, number> = {} as any;

  for (const f of facets) {
    scores[f] = 4;  // neutral
    zScores[f] = 0;
  }

  return { scores, zScores };
}

function neutralMotives(): MotiveProfile {
  return {
    security: 4, belonging: 4, status: 4,
    mastery: 4, autonomy: 4, purpose: 4,
  };
}

function neutralAffects(): AffectProfile {
  return {
    seeking: 4, fear: 4, anger: 4, care: 4,
    grief: 4, play: 4, desire: 4,
  };
}

function secureAttachment(): AttachmentProfile {
  return { anxiety: 2, avoidance: 2, style: 'SECURE', confidence: 0.5 };
}

function lowAntagonism(): AntagonismProfile {
  return {
    exploitative: 2, callous: 2, combative: 2, image_driven: 2,
    composite: 2, elevated: false,
  };
}

// Mock roster for testing
function mockRoster(structure: string, label: string): RosterOutput {
  return {
    version: 'HPMA-Vocabulary-1.0',
    sorted_probs: [],
    metrics: { S2: 0.5, S3: 0.7, r2: 0.6, g12: 0.1, entropy_n: 0.8 },
    structure: structure as any,
    shape_class: 'dyadic',
    confidence: { shape_conf: 'HIGH', blend_gap: 0.1, notes: [] },
    summary_label: label,
  };
}

describe('Epithet Computation', () => {
  test('returns empty array for completely neutral profile', () => {
    const epithets = computeEpithets({
      facetProfile: neutralFacetProfile(),
      motives: neutralMotives(),
      affects: neutralAffects(),
      attachment: secureAttachment(),
      antagonism: lowAntagonism(),
    });

    // SECURE attachment with confidence 0.5 should still generate an epithet
    // But facets/motives/affects should generate nothing (z=0)
    const nonAttachmentEpithets = epithets.filter(e => e.category !== 'attachment');
    expect(nonAttachmentEpithets).toHaveLength(0);
  });

  test('generates epithets for high z-scores', () => {
    const facetProfile = neutralFacetProfile();
    facetProfile.zScores.inquisitiveness = 1.5;  // High curiosity

    const epithets = computeEpithets({
      facetProfile,
      motives: neutralMotives(),
      affects: neutralAffects(),
      attachment: secureAttachment(),
      antagonism: lowAntagonism(),
    });

    const inqEpithet = epithets.find(e => e.sourceKey === 'facet.inquisitiveness');
    expect(inqEpithet).toBeDefined();
    expect(inqEpithet!.direction).toBe('high');
    expect(inqEpithet!.positiveWord).toBe('Cipher-Sighted');
  });

  test('generates epithets for low z-scores', () => {
    const facetProfile = neutralFacetProfile();
    facetProfile.zScores.sociability = -1.5;  // Low sociability

    const epithets = computeEpithets({
      facetProfile,
      motives: neutralMotives(),
      affects: neutralAffects(),
      attachment: secureAttachment(),
      antagonism: lowAntagonism(),
    });

    const socEpithet = epithets.find(e => e.sourceKey === 'facet.sociability');
    expect(socEpithet).toBeDefined();
    expect(socEpithet!.direction).toBe('low');
    expect(socEpithet!.negativeWord).toBe('Solitude-Seeking');
  });

  test('includes motive epithets when z >= 1', () => {
    const motives = { ...neutralMotives(), autonomy: 5.5 }; // z ≈ 1.0

    const epithets = computeEpithets({
      facetProfile: neutralFacetProfile(),
      motives,
      affects: neutralAffects(),
      attachment: secureAttachment(),
      antagonism: lowAntagonism(),
    });

    const autEpithet = epithets.find(e => e.sourceKey === 'motive.autonomy');
    expect(autEpithet).toBeDefined();
    expect(autEpithet!.positiveWord).toBe('Unshackled');
  });

  test('includes antagonism epithets when elevated', () => {
    const antagonism: AntagonismProfile = {
      exploitative: 6, callous: 5.5, combative: 3, image_driven: 4,
      composite: 4.625, elevated: true, // manually flagged elevated
    };

    const epithets = computeEpithets({
      facetProfile: neutralFacetProfile(),
      motives: neutralMotives(),
      affects: neutralAffects(),
      attachment: secureAttachment(),
      antagonism,
    });

    const expEpithet = epithets.find(e => e.sourceKey === 'antagonism.exploitative');
    expect(expEpithet).toBeDefined();
    expect(expEpithet!.negativeWord).toBe('Game-Playing');
  });

  test('sorts epithets by salience (highest first)', () => {
    const facetProfile = neutralFacetProfile();
    facetProfile.zScores.inquisitiveness = 2.0;  // weight 1.2, salience = 2.4
    facetProfile.zScores.diligence = 1.5;        // weight 1.1, salience = 1.65
    facetProfile.zScores.modesty = 1.0;          // weight 0.8, salience = 0.8

    const epithets = computeEpithets({
      facetProfile,
      motives: neutralMotives(),
      affects: neutralAffects(),
      attachment: { ...secureAttachment(), confidence: 0.1 }, // low confidence, won't appear
      antagonism: lowAntagonism(),
    });

    // Filter to just facet epithets
    const facetEpithets = epithets.filter(e => e.category === 'trait_facet');

    expect(facetEpithets[0].sourceKey).toBe('facet.inquisitiveness');
    expect(facetEpithets[1].sourceKey).toBe('facet.diligence');
    expect(facetEpithets[2].sourceKey).toBe('facet.modesty');
  });
});

describe('Class Name Generation', () => {
  test('generates short/standard/full variants', () => {
    const facetProfile = neutralFacetProfile();
    facetProfile.zScores.inquisitiveness = 2.0;
    facetProfile.zScores.diligence = 1.5;
    facetProfile.zScores.autonomy = 1.2;

    // Need high autonomy in motives too
    const motives = { ...neutralMotives(), autonomy: 5.8 };

    const epithets = computeEpithets({
      facetProfile,
      motives,
      affects: neutralAffects(),
      attachment: { ...secureAttachment(), confidence: 0.1 },
      antagonism: lowAntagonism(),
    });

    const roster = mockRoster('SOLO', 'Explorer');
    const className = generateClassName(roster, epithets);

    expect(className.short).toBe('Cipher-Sighted');
    expect(className.standard).toContain('Cipher-Sighted');
    expect(className.full).toContain('Cipher-Sighted');
    expect(className.epithets).toHaveLength(3);
  });

  test('falls back to "Balanced" for no notable epithets', () => {
    const epithets = computeEpithets({
      facetProfile: neutralFacetProfile(),
      motives: neutralMotives(),
      affects: neutralAffects(),
      attachment: { ...secureAttachment(), confidence: 0.1 },
      antagonism: lowAntagonism(),
    });

    const roster = mockRoster('MIST', 'Diffuse');
    const className = generateClassName(roster, epithets);

    expect(className.short).toBe('Balanced');
  });

  test('includes roster structure in templateUsed', () => {
    const facetProfile = neutralFacetProfile();
    facetProfile.zScores.creativity = 1.5;

    const epithets = computeEpithets({
      facetProfile,
      motives: neutralMotives(),
      affects: neutralAffects(),
      attachment: { ...secureAttachment(), confidence: 0.1 },
      antagonism: lowAntagonism(),
    });

    const roster = mockRoster('DUET', 'Seeker-Sage');
    roster.duet = {
      mode: 'TWIN_HELIX',
      identity: 'Seeker-Sage',
      anchor: 'explorer',
      lens: 'philosopher',
      label: 'Duet: Seeker-Sage',
      description: 'A fusion of curiosity and wisdom',
    };

    const className = generateClassName(roster, epithets);

    expect(className.templateUsed).toContain('Seeker-Sage');
    expect(className.templateUsed).toContain('Pattern-Breaking');
  });
});

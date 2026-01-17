/**
 * HPMA v1.0 Class Name Generator
 *
 * Generates evocative personality "class names" from epithet lexicon.
 * Epithets are selected by salience (weight × |z-score|) and combined
 * into short/standard/full name forms.
 */

import type {
  Epithet,
  EpithetCategory,
  ClassName,
  HEXACOFacet,
  AttachmentProfile,
  AntagonismProfile,
  RosterOutput,
  MotiveProfile,
  AffectProfile,
  FacetProfile,
} from '@/types/assessment';

import { zScore } from './scoring-v2';

// ═══════════════════════════════════════════════════════════════
// LEXICON TYPES
// ═══════════════════════════════════════════════════════════════

interface LexiconEntry {
  positive: string;   // Word for high z-score
  negative: string;   // Word for low z-score
  weight: number;     // Category salience weight (0.7-1.2)
}

// ═══════════════════════════════════════════════════════════════
// FACET LEXICON (24 HEXACO facets)
// ═══════════════════════════════════════════════════════════════

const FACET_LEXICON: Record<HEXACOFacet, LexiconEntry> = {
  // H - Honesty-Humility facets
  sincerity: { positive: 'Plainspoken', negative: 'Tactical', weight: 1.0 },
  fairness: { positive: 'Equitable', negative: 'Expedient', weight: 1.0 },
  greed_avoidance: { positive: 'Modest', negative: 'Acquisitive', weight: 0.8 },
  modesty: { positive: 'Unassuming', negative: 'Self-Promoting', weight: 0.8 },

  // E - Emotionality facets
  fearfulness: { positive: 'Cautious', negative: 'Unflinching', weight: 0.9 },
  anxiety: { positive: 'Vigilant', negative: 'Untroubled', weight: 0.9 },
  dependence: { positive: 'Bonded', negative: 'Self-Sufficient', weight: 0.8 },
  sentimentality: { positive: 'Tender', negative: 'Composed', weight: 0.8 },

  // X - Extraversion facets
  social_boldness: { positive: 'Stage-Ready', negative: 'Behind-Scenes', weight: 1.1 },
  sociability: { positive: 'Gathering-Drawn', negative: 'Solitude-Seeking', weight: 1.0 },
  liveliness: { positive: 'Spark-Carrier', negative: 'Even-Keeled', weight: 1.0 },
  self_esteem: { positive: 'Self-Assured', negative: 'Self-Doubting', weight: 0.9 },

  // A - Agreeableness facets
  forgivingness: { positive: 'Mercy-Given', negative: 'Score-Keeping', weight: 1.0 },
  gentleness: { positive: 'Soft-Touch', negative: 'Sharp-Edged', weight: 0.9 },
  flexibility: { positive: 'Yielding', negative: 'Stance-Holding', weight: 0.8 },
  patience: { positive: 'Long-Fused', negative: 'Quick-Sparked', weight: 0.9 },

  // C - Conscientiousness facets
  organization: { positive: 'Order-Keeper', negative: 'Flow-State', weight: 1.0 },
  diligence: { positive: 'Grindstone', negative: 'Drift-Prone', weight: 1.1 },
  perfectionism: { positive: 'Detail-Bound', negative: 'Good-Enough', weight: 0.8 },
  prudence: { positive: 'Foresighted', negative: 'Moment-Living', weight: 0.9 },

  // O - Openness facets
  aesthetic_appreciation: { positive: 'Beauty-Seeking', negative: 'Function-First', weight: 0.8 },
  inquisitiveness: { positive: 'Cipher-Sighted', negative: 'Routine-Bound', weight: 1.2 },
  creativity: { positive: 'Pattern-Breaking', negative: 'Convention-Keeping', weight: 1.1 },
  unconventionality: { positive: 'Edge-Walking', negative: 'Path-Following', weight: 1.0 },
};

// ═══════════════════════════════════════════════════════════════
// MOTIVE LEXICON (6 motives)
// ═══════════════════════════════════════════════════════════════

const MOTIVE_LEXICON: Record<string, LexiconEntry> = {
  security: { positive: 'Fortress-Minded', negative: 'Risk-Embracing', weight: 1.0 },
  belonging: { positive: 'Circle-Seeking', negative: 'Lone-Wolf', weight: 1.0 },
  status: { positive: 'Rank-Conscious', negative: 'Status-Blind', weight: 0.9 },
  mastery: { positive: 'Craftbound', negative: 'Enough-Is-Enough', weight: 1.1 },
  autonomy: { positive: 'Unshackled', negative: 'Structure-Seeking', weight: 1.1 },
  purpose: { positive: 'Mission-Driven', negative: 'Present-Focused', weight: 1.0 },
};

// ═══════════════════════════════════════════════════════════════
// AFFECT LEXICON (7 affects)
// ═══════════════════════════════════════════════════════════════

const AFFECT_LEXICON: Record<string, LexiconEntry> = {
  seeking: { positive: 'Horizon-Chasing', negative: 'Here-Rooted', weight: 1.0 },
  fear: { positive: 'Threat-Scanning', negative: 'Danger-Blind', weight: 0.9 },
  anger: { positive: 'Fire-Carrying', negative: 'Cool-Blooded', weight: 0.8 },
  care: { positive: 'Heart-Forward', negative: 'Arms-Length', weight: 1.0 },
  grief: { positive: 'Loss-Touched', negative: 'Moving-On', weight: 0.7 },
  play: { positive: 'Joy-Sparking', negative: 'Serious-Minded', weight: 0.9 },
  desire: { positive: 'Pull-Feeling', negative: 'Steady-State', weight: 0.7 },
};

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT LEXICON (4 styles)
// ═══════════════════════════════════════════════════════════════

const ATTACHMENT_LEXICON: Record<string, LexiconEntry> = {
  SECURE: { positive: 'Safe-Landed', negative: '', weight: 0.8 },
  PREOCCUPIED: { positive: '', negative: 'Bond-Anxious', weight: 0.9 },
  DISMISSIVE: { positive: 'Self-Contained', negative: '', weight: 0.8 },
  FEARFUL: { positive: '', negative: 'Approach-Avoidant', weight: 1.0 },
};

// ═══════════════════════════════════════════════════════════════
// ANTAGONISM LEXICON (4 axes)
// ═══════════════════════════════════════════════════════════════

const ANTAGONISM_LEXICON: Record<string, LexiconEntry> = {
  exploitative: { positive: '', negative: 'Game-Playing', weight: 1.1 },
  callous: { positive: '', negative: 'Stone-Hearted', weight: 1.0 },
  combative: { positive: '', negative: 'Fight-Ready', weight: 0.9 },
  image_driven: { positive: '', negative: 'Mirror-Watching', weight: 0.8 },
};

// ═══════════════════════════════════════════════════════════════
// EPITHET COMPUTATION
// ═══════════════════════════════════════════════════════════════

const Z_THRESHOLD = 1.0;  // Only notable deviations (|z| >= 1)
const ANTAGONISM_SCORE_THRESHOLD = 5.0;
const ATTACHMENT_CONFIDENCE_THRESHOLD = 0.3;

export interface EpithetInputs {
  facetProfile: FacetProfile;
  motives: MotiveProfile;
  affects: AffectProfile;
  attachment: AttachmentProfile;
  antagonism: AntagonismProfile;
}

/**
 * Compute all epithets from profile data.
 * Returns sorted by salience (highest first).
 */
export function computeEpithets(inputs: EpithetInputs): Epithet[] {
  const epithets: Epithet[] = [];

  // 1. Facet epithets (from z-scores)
  for (const [facet, z] of Object.entries(inputs.facetProfile.zScores)) {
    const lex = FACET_LEXICON[facet as HEXACOFacet];
    if (!lex) continue;

    const absZ = Math.abs(z);
    if (absZ < Z_THRESHOLD) continue;

    const direction = z >= 0 ? 'high' : 'low';
    const salience = lex.weight * absZ;

    epithets.push({
      category: 'trait_facet',
      sourceKey: `facet.${facet}`,
      zScore: z,
      salience,
      positiveWord: lex.positive,
      negativeWord: lex.negative,
      direction,
    });
  }

  // 2. Motive epithets
  for (const [motive, rawScore] of Object.entries(inputs.motives)) {
    const lex = MOTIVE_LEXICON[motive];
    if (!lex) continue;

    const z = zScore(rawScore);
    const absZ = Math.abs(z);
    if (absZ < Z_THRESHOLD) continue;

    const direction = z >= 0 ? 'high' : 'low';
    const salience = lex.weight * absZ;

    epithets.push({
      category: 'motive',
      sourceKey: `motive.${motive}`,
      zScore: z,
      salience,
      positiveWord: lex.positive,
      negativeWord: lex.negative,
      direction,
    });
  }

  // 3. Affect epithets
  for (const [affect, rawScore] of Object.entries(inputs.affects)) {
    const lex = AFFECT_LEXICON[affect];
    if (!lex) continue;

    const z = zScore(rawScore);
    const absZ = Math.abs(z);
    if (absZ < Z_THRESHOLD) continue;

    const direction = z >= 0 ? 'high' : 'low';
    const salience = lex.weight * absZ;

    epithets.push({
      category: 'affect',
      sourceKey: `affect.${affect}`,
      zScore: z,
      salience,
      positiveWord: lex.positive,
      negativeWord: lex.negative,
      direction,
    });
  }

  // 4. Attachment epithet (if not SECURE or if SECURE with high confidence)
  const attachLex = ATTACHMENT_LEXICON[inputs.attachment.style];
  if (attachLex && inputs.attachment.confidence > ATTACHMENT_CONFIDENCE_THRESHOLD) {
    // SECURE is "positive", insecure styles are "negative"
    const isSecure = inputs.attachment.style === 'SECURE';
    const word = isSecure ? attachLex.positive : attachLex.negative;

    if (word) {
      const pseudoZ = inputs.attachment.confidence * 2; // Scale confidence to z-like
      epithets.push({
        category: 'attachment',
        sourceKey: `attachment.${inputs.attachment.style}`,
        zScore: pseudoZ,
        salience: attachLex.weight * pseudoZ,
        positiveWord: attachLex.positive,
        negativeWord: attachLex.negative,
        direction: isSecure ? 'high' : 'low',
      });
    }
  }

  // 5. Antagonism epithets (if elevated)
  if (inputs.antagonism.elevated) {
    const axes = ['exploitative', 'callous', 'combative', 'image_driven'] as const;
    for (const axis of axes) {
      const score = inputs.antagonism[axis];
      if (score < ANTAGONISM_SCORE_THRESHOLD) continue;

      const lex = ANTAGONISM_LEXICON[axis];
      if (!lex || !lex.negative) continue;

      // Convert score to z-like (5.0 = threshold, 7.0 = max)
      const pseudoZ = (score - 4) / 1.5;
      epithets.push({
        category: 'antagonism',
        sourceKey: `antagonism.${axis}`,
        zScore: pseudoZ,
        salience: lex.weight * pseudoZ,
        positiveWord: lex.positive,
        negativeWord: lex.negative,
        direction: 'high', // Antagonism is always "high" direction
      });
    }
  }

  // Sort by salience (highest first)
  epithets.sort((a, b) => b.salience - a.salience);

  return epithets;
}

// ═══════════════════════════════════════════════════════════════
// CLASS NAME GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Get the display word for an epithet based on direction.
 */
function getEpithetWord(e: Epithet): string {
  return e.direction === 'high' ? e.positiveWord : e.negativeWord;
}

/**
 * Generate the class name from roster and epithets.
 */
export function generateClassName(
  roster: RosterOutput,
  epithets: Epithet[]
): ClassName {
  // Get top 3 epithets with valid words
  const validEpithets = epithets.filter(e => getEpithetWord(e).length > 0);
  const top3 = validEpithets.slice(0, 3);
  const words = top3.map(getEpithetWord);

  // Build name variants
  const short = words[0] || 'Balanced';
  const standard = words.slice(0, 2).join(' ') || short;
  const full = words.slice(0, 3).join(' ') || standard;

  // Build template based on roster structure
  let templateUsed: string;
  switch (roster.structure) {
    case 'SOLO':
      templateUsed = `${roster.summary_label}: ${full}`;
      break;
    case 'DUET':
      templateUsed = roster.duet
        ? `${roster.duet.identity}: ${full}`
        : `Duet: ${full}`;
      break;
    case 'TRIO':
      templateUsed = roster.trio
        ? `${roster.trio.label.split(':')[0]}: ${full}`
        : `Trio: ${full}`;
      break;
    case 'CHORD':
    case 'CHORUS':
      templateUsed = `${roster.structure}: ${full}`;
      break;
    case 'MIST':
      templateUsed = `Diffuse: ${full}`;
      break;
    default:
      templateUsed = full;
  }

  return {
    short,
    standard,
    full,
    epithets: top3,
    templateUsed,
  };
}

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Full class name generation from profile + roster.
 */
export function computeClassName(
  inputs: EpithetInputs,
  roster: RosterOutput
): ClassName {
  const epithets = computeEpithets(inputs);
  return generateClassName(roster, epithets);
}

import { HEXACOProfile, MotiveProfile, AffectProfile, ArchetypeProbabilities } from '@/types/assessment';
import { zScore } from './scoring';

interface ProfileScores {
  hexaco: HEXACOProfile;
  motives: MotiveProfile;
  affects: AffectProfile;
}

// Archetype prototype definitions with weights
const ARCHETYPE_WEIGHTS = {
  explorer: {
    // high O + high Seeking + high Autonomy
    traits: { O: 1.2 },
    motives: { autonomy: 0.8 },
    affects: { seeking: 1.0 },
  },
  organizer: {
    // high C + high Mastery + moderate/low Seeking (negative weight)
    traits: { C: 1.2 },
    motives: { mastery: 1.0 },
    affects: { seeking: -0.5 },
  },
  connector: {
    // high A + high Belonging + high Care
    traits: { A: 1.2 },
    motives: { belonging: 1.0 },
    affects: { care: 0.8 },
  },
  protector: {
    // high Security + high Fear + high E
    traits: { E: 0.6 },
    motives: { security: 1.0 },
    affects: { fear: 0.8 },
  },
  performer: {
    // high X + high Status + high Play
    traits: { X: 1.2 },
    motives: { status: 1.0 },
    affects: { play: 0.8 },
  },
  philosopher: {
    // high O + high Purpose + high Seeking
    traits: { O: 1.0 },
    motives: { purpose: 1.2 },
    affects: { seeking: 0.6 },
  },
} as const;

function computeArchetypeScore(
  archetype: keyof typeof ARCHETYPE_WEIGHTS,
  zScores: { hexaco: HEXACOProfile; motives: MotiveProfile; affects: AffectProfile }
): number {
  const weights = ARCHETYPE_WEIGHTS[archetype];
  let score = 0;

  // Add trait contributions
  for (const [trait, weight] of Object.entries(weights.traits)) {
    score += zScores.hexaco[trait as keyof HEXACOProfile] * weight;
  }

  // Add motive contributions
  for (const [motive, weight] of Object.entries(weights.motives)) {
    score += zScores.motives[motive as keyof MotiveProfile] * weight;
  }

  // Add affect contributions
  for (const [affect, weight] of Object.entries(weights.affects)) {
    score += zScores.affects[affect as keyof AffectProfile] * weight;
  }

  return score;
}

function softmax(scores: number[], temperature: number = 0.8): number[] {
  const scaledScores = scores.map(s => s / temperature);
  const maxScore = Math.max(...scaledScores);
  const expScores = scaledScores.map(s => Math.exp(s - maxScore)); // Subtract max for numerical stability
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  return expScores.map(e => e / sumExp);
}

export function computeArchetypeProbabilities(
  profiles: ProfileScores
): { archetypes: ArchetypeProbabilities; uncertainty: number } {
  // Convert raw scores to z-scores
  const zScores = {
    hexaco: {
      H: zScore(profiles.hexaco.H),
      E: zScore(profiles.hexaco.E),
      X: zScore(profiles.hexaco.X),
      A: zScore(profiles.hexaco.A),
      C: zScore(profiles.hexaco.C),
      O: zScore(profiles.hexaco.O),
    },
    motives: {
      security: zScore(profiles.motives.security),
      belonging: zScore(profiles.motives.belonging),
      status: zScore(profiles.motives.status),
      mastery: zScore(profiles.motives.mastery),
      autonomy: zScore(profiles.motives.autonomy),
      purpose: zScore(profiles.motives.purpose),
    },
    affects: {
      seeking: zScore(profiles.affects.seeking),
      fear: zScore(profiles.affects.fear),
      anger: zScore(profiles.affects.anger),
      care: zScore(profiles.affects.care),
      grief: zScore(profiles.affects.grief),
      play: zScore(profiles.affects.play),
      desire: zScore(profiles.affects.desire),
    },
  };

  // Compute raw scores for each archetype
  const archetypeNames: (keyof typeof ARCHETYPE_WEIGHTS)[] = [
    'explorer', 'organizer', 'connector', 'protector', 'performer', 'philosopher'
  ];

  const rawScores = archetypeNames.map(name => computeArchetypeScore(name, zScores));

  // Apply softmax to get probabilities
  const probabilities = softmax(rawScores, 0.8);

  // Build result object
  const archetypes: ArchetypeProbabilities = {
    explorer: probabilities[0],
    organizer: probabilities[1],
    connector: probabilities[2],
    protector: probabilities[3],
    performer: probabilities[4],
    philosopher: probabilities[5],
  };

  // Compute uncertainty (gap between top 2 probabilities)
  const sorted = [...probabilities].sort((a, b) => b - a);
  const uncertainty = 1 - (sorted[0] - sorted[1]); // Higher gap = lower uncertainty

  return { archetypes, uncertainty };
}

export function getTopArchetypes(
  archetypes: ArchetypeProbabilities,
  count: number = 2
): { name: string; probability: number }[] {
  return Object.entries(archetypes)
    .map(([name, probability]) => ({ name, probability }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, count);
}

export function getArchetypeDescription(archetype: keyof ArchetypeProbabilities): string {
  const descriptions: Record<keyof ArchetypeProbabilities, string> = {
    explorer: "Driven by curiosity and autonomy. Seeks novel experiences, ideas, and self-directed paths.",
    organizer: "Motivated by mastery and structure. Values competence, planning, and systematic progress.",
    connector: "Centered on belonging and care. Prioritizes relationships, cooperation, and emotional support.",
    protector: "Focused on security and stability. Alert to threats, values safety and predictability.",
    performer: "Energized by recognition and social engagement. Seeks status, attention, and playful interaction.",
    philosopher: "Guided by meaning and purpose. Pursues values-driven goals and deep understanding.",
  };
  return descriptions[archetype];
}

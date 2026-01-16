import { HEXACOProfile, MotiveProfile, AffectProfile, ArchetypeProbabilities, BlendMode, BlendProfile } from '@/types/assessment';
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

// ═══════════════════════════════════════════════════════════════
// BLEND MODE SYSTEM (Anchor-Lens Model)
// ═══════════════════════════════════════════════════════════════

export function computeBlendProfile(
  archetypes: ArchetypeProbabilities,
  profiles: ProfileScores
): BlendProfile {
  // Get top 2 archetypes
  const sorted = Object.entries(archetypes)
    .sort(([, a], [, b]) => b - a)
    .map(([name, prob]) => ({ name: name as keyof ArchetypeProbabilities, prob }));

  const top1 = sorted[0];
  const top2 = sorted[1];

  const P1 = top1.prob;
  const P2 = top2.prob;

  // Compute blend metrics
  const pairStrength = P1 + P2;  // S = P1 + P2
  const blendRatio = P1 / (P1 + P2);  // r = P1 / (P1 + P2)
  const isTrueDyad = pairStrength >= 0.70;

  // Determine blend mode based on ratio
  let mode: BlendMode;
  let anchor: keyof ArchetypeProbabilities;
  let lens: keyof ArchetypeProbabilities;
  let label: string;
  let description: string;

  if (!isTrueDyad) {
    // Diffuse profile - top 3+ matter
    mode = 'diffuse';
    anchor = top1.name;
    lens = top2.name;
    label = `${capitalize(top1.name)} Primary (Diffuse)`;
    description = `Your profile shows distributed weight across multiple archetypes. ${capitalize(top1.name)} leads, but several others contribute meaningfully.`;
  } else if (blendRatio >= 0.45 && blendRatio <= 0.55) {
    // Fusion Mode (≈50/50)
    mode = 'fusion';
    anchor = top1.name;
    lens = top2.name;
    label = `${capitalize(top1.name)}–${capitalize(top2.name)} Fusion`;
    description = `A balanced dyad: both types co-drive your behavior. Context decides which one pilots at a given moment.`;
  } else if (blendRatio >= 0.70 && blendRatio <= 0.85) {
    // Anchor-Lens Mode (≈75/25)
    mode = 'anchor-lens';
    anchor = top1.name;
    lens = top2.name;
    label = `${capitalize(top1.name)} Anchor, ${capitalize(top2.name)} Lens`;
    description = `${capitalize(top1.name)} is your engine; ${capitalize(top2.name)} consistently colors how that engine runs.`;
  } else if (blendRatio >= 0.15 && blendRatio <= 0.30) {
    // Inverse Anchor-Lens Mode (≈25/75) - this shouldn't happen with sorted order, but handle it
    mode = 'inverse-anchor-lens';
    anchor = top2.name;
    lens = top1.name;
    label = `${capitalize(top2.name)} Anchor, ${capitalize(top1.name)} Lens`;
    description = `${capitalize(top2.name)} is your engine; ${capitalize(top1.name)} is the flavoring lens.`;
  } else if (blendRatio > 0.85) {
    // Strong single type dominance
    mode = 'anchor-lens';
    anchor = top1.name;
    lens = top2.name;
    label = `${capitalize(top1.name)} Dominant`;
    description = `Strong ${capitalize(top1.name)} orientation with ${capitalize(top2.name)} as a subtle secondary influence.`;
  } else {
    // Between 0.55-0.70: leaning toward anchor-lens
    mode = 'anchor-lens';
    anchor = top1.name;
    lens = top2.name;
    label = `${capitalize(top1.name)} Anchor, ${capitalize(top2.name)} Lens`;
    description = `${capitalize(top1.name)} leads with ${capitalize(top2.name)} providing consistent coloring to your approach.`;
  }

  // Compute switcher behavior for Fusion profiles
  const switcherBehavior = computeSwitcherBehavior(mode, profiles);

  return {
    mode,
    isTrueDyad,
    pairStrength,
    blendRatio,
    anchor,
    lens,
    anchorProbability: anchor === top1.name ? P1 : P2,
    lensProbability: anchor === top1.name ? P2 : P1,
    label,
    description,
    switcherBehavior,
  };
}

function computeSwitcherBehavior(
  mode: BlendMode,
  profiles: ProfileScores
): BlendProfile['switcherBehavior'] {
  if (mode !== 'fusion') {
    return 'unknown';
  }

  // For Fusion profiles:
  // High E/Fear → tend to "flip" under stress to safety/control type
  // High Seeking + high C → tend to "integrate" (hold both at once)
  const emotionality = profiles.hexaco.E;
  const fear = profiles.affects.fear;
  const seeking = profiles.affects.seeking;
  const conscientiousness = profiles.hexaco.C;

  const flipIndicator = (emotionality + fear) / 2;
  const integrateIndicator = (seeking + conscientiousness) / 2;

  if (integrateIndicator > 5.0 && integrateIndicator > flipIndicator) {
    return 'integrate';
  } else if (flipIndicator > 4.5) {
    return 'flip';
  }

  return 'unknown';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getBlendModeExplanation(mode: BlendMode): string {
  const explanations: Record<BlendMode, string> = {
    'fusion': "Both archetypes are equally active. You may switch between them based on context, or express both simultaneously.",
    'anchor-lens': "Your Anchor is your default mode—what you return to under load. Your Lens is always on, shaping how the anchor expresses.",
    'inverse-anchor-lens': "Your Lens has become the engine, while the other type provides stylistic coloring.",
    'diffuse': "Your profile distributes across multiple archetypes. No single pair dominates—consider the top 3.",
  };
  return explanations[mode];
}

export function getSwitcherExplanation(behavior: BlendProfile['switcherBehavior']): string | null {
  if (behavior === 'flip') {
    return "Under stress, you tend to flip into your more safety/control-adjacent type.";
  } else if (behavior === 'integrate') {
    return "You tend to integrate both types rather than switching—holding both perspectives simultaneously.";
  }
  return null;
}

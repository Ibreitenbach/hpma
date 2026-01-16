import {
  ArchetypeProbabilities,
  ArchetypeName,
  ShapeClass,
  DyadBlendClass,
  TriadClass,
  SortedArchetype,
  DerivedMetrics,
  DyadRoster,
  TriadRoster,
  PolyphonicRoster,
  ConfidenceMetrics,
  RosterOutput,
} from '@/types/assessment';

// ═══════════════════════════════════════════════════════════════
// HPMA ROSTER CLASSIFICATION SPEC v1.0
// ═══════════════════════════════════════════════════════════════

const DYAD_BLEND_THRESHOLDS = {
  fusion: { min: 0.45, max: 0.55 },
  tilted_fusion: { min: 0.55, max: 0.65 },
  anchor_lens: { min: 0.65, max: 0.80 },
  dominant_trace: { min: 0.80, max: 0.92 },
  near_pure: { min: 0.92, max: 1.00 },
} as const;

const SHAPE_THRESHOLDS = {
  diffuse_p1: 0.35,
  mono_p1: 0.70,
  mono_p2_max: 0.20,
  dyad_s2: 0.70,
  dyad_p3_max: 0.20,
  triad_s3: 0.80,
  triad_p4_max: 0.15,
} as const;

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sortArchetypes(archetypes: ArchetypeProbabilities): SortedArchetype[] {
  return Object.entries(archetypes)
    .map(([name, probability]) => ({
      name: name as ArchetypeName,
      probability,
    }))
    .sort((a, b) => b.probability - a.probability);
}

function computeNormalizedEntropy(probabilities: number[]): number {
  const n = probabilities.length;
  if (n <= 1) return 0;

  const entropy = -probabilities
    .filter(p => p > 0)
    .reduce((sum, p) => sum + p * Math.log(p), 0);

  const maxEntropy = Math.log(n);
  return entropy / maxEntropy;
}

function computeDerivedMetrics(sorted: SortedArchetype[]): DerivedMetrics {
  const p1 = sorted[0]?.probability ?? 0;
  const p2 = sorted[1]?.probability ?? 0;
  const p3 = sorted[2]?.probability ?? 0;

  const S2 = p1 + p2;
  const S3 = p1 + p2 + p3;
  const r2 = S2 > 0 ? p1 / S2 : 0;
  const g12 = p1 - p2;

  const allProbs = sorted.map(s => s.probability);
  const entropy_n = computeNormalizedEntropy(allProbs);

  return { S2, S3, r2, g12, entropy_n };
}

function classifyShape(sorted: SortedArchetype[], metrics: DerivedMetrics): ShapeClass {
  const p1 = sorted[0]?.probability ?? 0;
  const p2 = sorted[1]?.probability ?? 0;
  const p3 = sorted[2]?.probability ?? 0;
  const p4 = sorted[3]?.probability ?? 0;

  // Rule 1: Diffuse if dominant is too weak
  if (p1 < SHAPE_THRESHOLDS.diffuse_p1) {
    return 'diffuse';
  }

  // Rule 2: Monophonic if single dominant
  if (p1 >= SHAPE_THRESHOLDS.mono_p1 && p2 <= SHAPE_THRESHOLDS.mono_p2_max) {
    return 'monophonic';
  }

  // Rule 3: Dyadic if top-2 dominate
  if (metrics.S2 >= SHAPE_THRESHOLDS.dyad_s2 && p3 <= SHAPE_THRESHOLDS.dyad_p3_max) {
    return 'dyadic';
  }

  // Rule 4: Triadic if top-3 dominate
  if (metrics.S3 >= SHAPE_THRESHOLDS.triad_s3 && p4 <= SHAPE_THRESHOLDS.triad_p4_max) {
    return 'triadic';
  }

  // Rule 5: Polyphonic (fallback)
  return 'polyphonic';
}

function classifyDyadBlend(r2: number): DyadBlendClass {
  if (r2 >= DYAD_BLEND_THRESHOLDS.fusion.min && r2 <= DYAD_BLEND_THRESHOLDS.fusion.max) {
    return 'fusion';
  }
  if (r2 > DYAD_BLEND_THRESHOLDS.tilted_fusion.min && r2 <= DYAD_BLEND_THRESHOLDS.tilted_fusion.max) {
    return 'tilted_fusion';
  }
  if (r2 > DYAD_BLEND_THRESHOLDS.anchor_lens.min && r2 <= DYAD_BLEND_THRESHOLDS.anchor_lens.max) {
    return 'anchor_lens';
  }
  if (r2 > DYAD_BLEND_THRESHOLDS.dominant_trace.min && r2 <= DYAD_BLEND_THRESHOLDS.dominant_trace.max) {
    return 'dominant_trace';
  }
  return 'near_pure';
}

function getDyadBlendDescription(blend: DyadBlendClass, anchor: string, lens: string): string {
  const descriptions: Record<DyadBlendClass, string> = {
    fusion: `A balanced 50/50 blend where ${capitalize(anchor)} and ${capitalize(lens)} co-drive behavior equally. Context determines which takes the lead in any moment.`,
    tilted_fusion: `${capitalize(anchor)} slightly leads (~60/40), but ${capitalize(lens)} remains a strong co-driver. Both archetypes actively shape your expression.`,
    anchor_lens: `${capitalize(anchor)} is your engine (~75/25). ${capitalize(lens)} colors how that engine runs, acting as a consistent interpretive filter.`,
    dominant_trace: `Strong ${capitalize(anchor)} dominance (~85/15). ${capitalize(lens)} appears as a subtle secondary influence rather than an active co-pilot.`,
    near_pure: `Near-pure ${capitalize(anchor)} orientation (~95/5). ${capitalize(lens)} provides only a trace coloring to your dominant archetype.`,
  };
  return descriptions[blend];
}

function getDyadLabel(blend: DyadBlendClass, anchor: string, lens: string): string {
  const formatBlend = (b: DyadBlendClass): string => {
    switch (b) {
      case 'fusion': return 'Fusion';
      case 'tilted_fusion': return 'Tilted Fusion';
      case 'anchor_lens': return 'Anchor-Lens';
      case 'dominant_trace': return 'Dominant-Trace';
      case 'near_pure': return 'Near-Pure';
    }
  };
  return `${capitalize(anchor)}–${capitalize(lens)} ${formatBlend(blend)}`;
}

function buildDyadRoster(sorted: SortedArchetype[], metrics: DerivedMetrics): DyadRoster {
  const anchor = sorted[0].name;
  const lens = sorted[1].name;
  const blend_class = classifyDyadBlend(metrics.r2);

  return {
    blend_class,
    anchor,
    lens,
    label: getDyadLabel(blend_class, anchor, lens),
    description: getDyadBlendDescription(blend_class, anchor, lens),
  };
}

function classifyTriad(sorted: SortedArchetype[]): TriadClass {
  const p1 = sorted[0].probability;
  const p2 = sorted[1].probability;
  const p3 = sorted[2].probability;

  const TRIAD_FUSION_THRESHOLD = 0.08;
  const DUAL_LENS_THRESHOLD = 0.05;

  const maxDiff = Math.max(Math.abs(p1 - p2), Math.abs(p2 - p3), Math.abs(p1 - p3));

  // All 3 within ±8%: Triad Fusion
  if (maxDiff <= TRIAD_FUSION_THRESHOLD) {
    return 'triad_fusion';
  }

  // Check for Anchor + Dual Lenses: p1 > p2 ≈ p3
  const gap12 = p1 - p2;
  const gap23 = p2 - p3;

  if (gap12 > TRIAD_FUSION_THRESHOLD && gap23 <= DUAL_LENS_THRESHOLD) {
    return 'anchor_dual_lenses';
  }

  // Default: clear rank order
  return 'anchor_lens_shadow';
}

function getTriadDescription(triadClass: TriadClass, primary: string, secondary: string, tertiary: string): string {
  switch (triadClass) {
    case 'triad_fusion':
      return `A balanced triad where ${capitalize(primary)}, ${capitalize(secondary)}, and ${capitalize(tertiary)} all contribute roughly equally. You draw from all three depending on context.`;
    case 'anchor_dual_lenses':
      return `${capitalize(primary)} anchors your expression, while ${capitalize(secondary)} and ${capitalize(tertiary)} act as dual lenses, both coloring how your anchor manifests.`;
    case 'anchor_lens_shadow':
      return `${capitalize(primary)} leads as anchor, ${capitalize(secondary)} provides the primary lens, and ${capitalize(tertiary)} operates as a background shadow influence.`;
  }
}

function getTriadLabel(triadClass: TriadClass, primary: string, secondary: string, tertiary: string): string {
  switch (triadClass) {
    case 'triad_fusion':
      return `${capitalize(primary)}–${capitalize(secondary)}–${capitalize(tertiary)} Triad`;
    case 'anchor_dual_lenses':
      return `${capitalize(primary)} Anchor, ${capitalize(secondary)}+${capitalize(tertiary)} Dual Lenses`;
    case 'anchor_lens_shadow':
      return `${capitalize(primary)} Anchor, ${capitalize(secondary)} Lens, ${capitalize(tertiary)} Shadow`;
  }
}

function buildTriadRoster(sorted: SortedArchetype[]): TriadRoster {
  const primary = sorted[0].name;
  const secondary = sorted[1].name;
  const tertiary = sorted[2].name;
  const triad_class = classifyTriad(sorted);

  return {
    triad_class,
    primary,
    secondary,
    tertiary,
    label: getTriadLabel(triad_class, primary, secondary, tertiary),
    description: getTriadDescription(triad_class, primary, secondary, tertiary),
  };
}

function buildPolyphonicRoster(sorted: SortedArchetype[]): PolyphonicRoster {
  const CONTRIBUTION_THRESHOLD = 0.12;
  const contributing = sorted
    .filter(s => s.probability >= CONTRIBUTION_THRESHOLD)
    .map(s => s.name);

  const names = contributing.map(n => capitalize(n)).join(', ');

  return {
    contributing,
    label: `Polyphonic Profile (${contributing.length} active)`,
    description: `Multiple archetypes contribute meaningfully to your profile: ${names}. No single pair or triad dominates—you draw flexibly from several sources.`,
  };
}

function computeConfidence(
  shape: ShapeClass,
  sorted: SortedArchetype[],
  metrics: DerivedMetrics
): ConfidenceMetrics {
  const notes: string[] = [];
  let shape_conf: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  let blend_gap = 0;

  const p1 = sorted[0]?.probability ?? 0;
  const p2 = sorted[1]?.probability ?? 0;
  const p3 = sorted[2]?.probability ?? 0;
  const p4 = sorted[3]?.probability ?? 0;

  // Compute distance from nearest threshold
  switch (shape) {
    case 'monophonic': {
      const distFromP1 = p1 - SHAPE_THRESHOLDS.mono_p1;
      const distFromP2 = SHAPE_THRESHOLDS.mono_p2_max - p2;
      blend_gap = Math.min(distFromP1, distFromP2);
      if (blend_gap < 0.05) {
        shape_conf = 'LOW';
        notes.push('Near threshold for monophonic classification');
      } else if (blend_gap < 0.10) {
        shape_conf = 'MEDIUM';
      }
      break;
    }
    case 'dyadic': {
      const distFromS2 = metrics.S2 - SHAPE_THRESHOLDS.dyad_s2;
      const distFromP3 = SHAPE_THRESHOLDS.dyad_p3_max - p3;
      blend_gap = Math.min(distFromS2, distFromP3);

      // Also check proximity to blend class boundaries
      const r2 = metrics.r2;
      const blendDistances = [
        Math.abs(r2 - 0.45),
        Math.abs(r2 - 0.55),
        Math.abs(r2 - 0.65),
        Math.abs(r2 - 0.80),
        Math.abs(r2 - 0.92),
      ];
      const minBlendDist = Math.min(...blendDistances);

      if (minBlendDist < 0.02) {
        notes.push('Near blend class boundary');
        if (shape_conf === 'HIGH') shape_conf = 'MEDIUM';
      }

      if (blend_gap < 0.05) {
        shape_conf = 'LOW';
        notes.push('Near threshold for dyadic classification');
      } else if (blend_gap < 0.10 && shape_conf === 'HIGH') {
        shape_conf = 'MEDIUM';
      }
      break;
    }
    case 'triadic': {
      const distFromS3 = metrics.S3 - SHAPE_THRESHOLDS.triad_s3;
      const distFromP4 = SHAPE_THRESHOLDS.triad_p4_max - p4;
      blend_gap = Math.min(distFromS3, distFromP4);

      if (blend_gap < 0.05) {
        shape_conf = 'LOW';
        notes.push('Near threshold for triadic classification');
      } else if (blend_gap < 0.10) {
        shape_conf = 'MEDIUM';
      }
      break;
    }
    case 'polyphonic': {
      blend_gap = p1 - SHAPE_THRESHOLDS.diffuse_p1;
      shape_conf = 'MEDIUM';
      notes.push('Polyphonic profiles have inherently lower classification confidence');
      break;
    }
    case 'diffuse': {
      blend_gap = SHAPE_THRESHOLDS.diffuse_p1 - p1;
      shape_conf = 'LOW';
      notes.push('Diffuse profile: no clear archetype dominance');
      break;
    }
  }

  // Check for high entropy
  if (metrics.entropy_n > 0.90) {
    notes.push('Very high entropy suggests dispersed profile');
  }

  return { shape_conf, blend_gap, notes };
}

function buildSummaryLabel(shape: ShapeClass, roster: RosterOutput): string {
  switch (shape) {
    case 'monophonic':
      return `${capitalize(roster.sorted_probs[0].name)} Dominant`;
    case 'dyadic':
      return roster.dyad!.label;
    case 'triadic':
      return roster.triad!.label;
    case 'polyphonic':
      return roster.polyphonic!.label;
    case 'diffuse':
      return 'Diffuse Profile';
  }
}

export function computeRoster(archetypes: ArchetypeProbabilities): RosterOutput {
  const sorted_probs = sortArchetypes(archetypes);
  const metrics = computeDerivedMetrics(sorted_probs);
  const shape_class = classifyShape(sorted_probs, metrics);
  const confidence = computeConfidence(shape_class, sorted_probs, metrics);

  const roster: RosterOutput = {
    version: 'HPMA-RosterSpec-1.0',
    sorted_probs,
    metrics,
    shape_class,
    confidence,
    summary_label: '', // Will be set after building shape-specific rosters
  };

  // Build shape-specific rosters
  switch (shape_class) {
    case 'dyadic':
      roster.dyad = buildDyadRoster(sorted_probs, metrics);
      break;
    case 'triadic':
      roster.triad = buildTriadRoster(sorted_probs);
      break;
    case 'polyphonic':
      roster.polyphonic = buildPolyphonicRoster(sorted_probs);
      break;
  }

  roster.summary_label = buildSummaryLabel(shape_class, roster);

  return roster;
}

export function getShapeClassDescription(shape: ShapeClass): string {
  const descriptions: Record<ShapeClass, string> = {
    monophonic: 'A single archetype strongly dominates your profile, with minimal influence from others.',
    dyadic: 'Two archetypes form a clear pair that together define your expression.',
    triadic: 'Three archetypes form a stable triangle, each contributing meaningfully.',
    polyphonic: 'Multiple archetypes contribute without a clear pair or triad structure.',
    diffuse: 'No single archetype stands out strongly—your profile is distributed broadly.',
  };
  return descriptions[shape];
}

export function getBlendClassLabel(blend: DyadBlendClass): string {
  const labels: Record<DyadBlendClass, string> = {
    fusion: '50/50 Fusion',
    tilted_fusion: '60/40 Tilted Fusion',
    anchor_lens: '75/25 Anchor-Lens',
    dominant_trace: '85/15 Dominant-Trace',
    near_pure: '95/5 Near-Pure',
  };
  return labels[blend];
}

export function getTriadClassLabel(triad: TriadClass): string {
  const labels: Record<TriadClass, string> = {
    triad_fusion: 'Balanced Triad',
    anchor_dual_lenses: 'Anchor + Dual Lenses',
    anchor_lens_shadow: 'Anchor-Lens-Shadow',
  };
  return labels[triad];
}

import {
  ArchetypeProbabilities,
  ArchetypeName,
  Structure,
  ShapeClass,
  DuetMode,
  DyadBlendClass,
  TrioMode,
  TriadClass,
  PolyphonicMode,
  DyadName,
  SortedArchetype,
  DerivedMetrics,
  DuetRoster,
  DyadRoster,
  TrioRoster,
  TriadRoster,
  ChoralRoster,
  PolyphonicRoster,
  ConfidenceMetrics,
  RosterOutput,
} from '@/types/assessment';

// ═══════════════════════════════════════════════════════════════
// HPMA ROSTER VOCABULARY v1.0
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// CANONICAL DYAD NAMES (15 pairs)
// ─────────────────────────────────────────────────────────────────

type DyadPairKey = `${ArchetypeName}-${ArchetypeName}`;

const DYAD_NAMES: Record<string, DyadName> = {
  'explorer-philosopher': 'Seeker-Sage',
  'philosopher-explorer': 'Seeker-Sage',
  'explorer-organizer': 'Visionary Builder',
  'organizer-explorer': 'Visionary Builder',
  'explorer-connector': 'Wayfinder Diplomat',
  'connector-explorer': 'Wayfinder Diplomat',
  'explorer-protector': 'Sentinel Scout',
  'protector-explorer': 'Sentinel Scout',
  'explorer-performer': 'Spotlight Pioneer',
  'performer-explorer': 'Spotlight Pioneer',
  'philosopher-organizer': 'Systems Theorist',
  'organizer-philosopher': 'Systems Theorist',
  'philosopher-connector': 'Bridge Scholar',
  'connector-philosopher': 'Bridge Scholar',
  'philosopher-protector': 'Vigilant Stoic',
  'protector-philosopher': 'Vigilant Stoic',
  'philosopher-performer': 'Public Intellectual',
  'performer-philosopher': 'Public Intellectual',
  'organizer-connector': 'Community Operator',
  'connector-organizer': 'Community Operator',
  'organizer-protector': 'Risk Steward',
  'protector-organizer': 'Risk Steward',
  'organizer-performer': 'Showrunner Executive',
  'performer-organizer': 'Showrunner Executive',
  'connector-protector': 'Guardian Caretaker',
  'protector-connector': 'Guardian Caretaker',
  'connector-performer': 'Charismatic Host',
  'performer-connector': 'Charismatic Host',
  'protector-performer': 'Watchful Champion',
  'performer-protector': 'Watchful Champion',
};

function getDyadName(a: ArchetypeName, b: ArchetypeName): DyadName | string {
  const key = `${a}-${b}`;
  return DYAD_NAMES[key] || `${capitalize(a)}–${capitalize(b)} Hybrid`;
}

// ─────────────────────────────────────────────────────────────────
// THRESHOLDS
// ─────────────────────────────────────────────────────────────────

const DUET_MODE_THRESHOLDS = {
  TWIN_HELIX: { min: 0.45, max: 0.55 },        // ~50/50
  LEANING_HELIX: { min: 0.55, max: 0.65 },     // ~60/40
  KEYSTONE_LENS: { min: 0.65, max: 0.80 },     // ~75/25
  SIGNATURE_ACCENT: { min: 0.80, max: 0.92 },  // ~90/10
  PURELINE: { min: 0.92, max: 1.00 },          // ~95/5+
} as const;

const STRUCTURE_THRESHOLDS = {
  mist_p1: 0.35,
  solo_p1: 0.70,
  solo_p2_max: 0.20,
  duet_s2: 0.70,
  duet_p3_max: 0.20,
  trio_s3: 0.80,
  trio_p4_max: 0.15,
  chord_top4_threshold: 0.12,
} as const;

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// STRUCTURE CLASSIFICATION
// ─────────────────────────────────────────────────────────────────

function classifyStructure(sorted: SortedArchetype[], metrics: DerivedMetrics): Structure {
  const p1 = sorted[0]?.probability ?? 0;
  const p2 = sorted[1]?.probability ?? 0;
  const p3 = sorted[2]?.probability ?? 0;
  const p4 = sorted[3]?.probability ?? 0;

  // Rule 1: Mist if dominant is too weak
  if (p1 < STRUCTURE_THRESHOLDS.mist_p1) {
    return 'MIST';
  }

  // Rule 2: Solo if single dominant
  if (p1 >= STRUCTURE_THRESHOLDS.solo_p1 && p2 <= STRUCTURE_THRESHOLDS.solo_p2_max) {
    return 'SOLO';
  }

  // Rule 3: Duet if top-2 dominate
  if (metrics.S2 >= STRUCTURE_THRESHOLDS.duet_s2 && p3 <= STRUCTURE_THRESHOLDS.duet_p3_max) {
    return 'DUET';
  }

  // Rule 4: Trio if top-3 dominate
  if (metrics.S3 >= STRUCTURE_THRESHOLDS.trio_s3 && p4 <= STRUCTURE_THRESHOLDS.trio_p4_max) {
    return 'TRIO';
  }

  // Rule 5: Chord vs Chorus
  const activeVoices = sorted.filter(s => s.probability >= STRUCTURE_THRESHOLDS.chord_top4_threshold);
  if (activeVoices.length <= 4 && p1 >= 0.25) {
    return 'CHORD';
  }

  return 'CHORUS';
}

// Legacy shape class mapping
function structureToShapeClass(structure: Structure): ShapeClass {
  switch (structure) {
    case 'SOLO': return 'monophonic';
    case 'DUET': return 'dyadic';
    case 'TRIO': return 'triadic';
    case 'CHORD':
    case 'CHORUS': return 'polyphonic';
    case 'MIST':
    case 'FAULTED': return 'diffuse';
  }
}

// ─────────────────────────────────────────────────────────────────
// DUET MODE CLASSIFICATION
// ─────────────────────────────────────────────────────────────────

function classifyDuetMode(r2: number): DuetMode {
  if (r2 >= DUET_MODE_THRESHOLDS.TWIN_HELIX.min && r2 <= DUET_MODE_THRESHOLDS.TWIN_HELIX.max) {
    return 'TWIN_HELIX';
  }
  if (r2 > DUET_MODE_THRESHOLDS.LEANING_HELIX.min && r2 <= DUET_MODE_THRESHOLDS.LEANING_HELIX.max) {
    return 'LEANING_HELIX';
  }
  if (r2 > DUET_MODE_THRESHOLDS.KEYSTONE_LENS.min && r2 <= DUET_MODE_THRESHOLDS.KEYSTONE_LENS.max) {
    return 'KEYSTONE_LENS';
  }
  if (r2 > DUET_MODE_THRESHOLDS.SIGNATURE_ACCENT.min && r2 <= DUET_MODE_THRESHOLDS.SIGNATURE_ACCENT.max) {
    return 'SIGNATURE_ACCENT';
  }
  return 'PURELINE';
}

// Legacy blend class mapping
function duetModeToBlendClass(mode: DuetMode): DyadBlendClass {
  switch (mode) {
    case 'TWIN_HELIX': return 'fusion';
    case 'LEANING_HELIX': return 'tilted_fusion';
    case 'KEYSTONE_LENS': return 'anchor_lens';
    case 'SIGNATURE_ACCENT': return 'dominant_trace';
    case 'PURELINE': return 'near_pure';
  }
}

function getDuetModeLabel(mode: DuetMode): string {
  const labels: Record<DuetMode, string> = {
    TWIN_HELIX: 'Twin-Helix',
    LEANING_HELIX: 'Leaning Helix',
    KEYSTONE_LENS: 'Keystone & Lens',
    SIGNATURE_ACCENT: 'Signature & Accent',
    PURELINE: 'Pureline',
  };
  return labels[mode];
}

function getDuetModeDescription(mode: DuetMode, identity: string, anchor: string, lens: string): string {
  switch (mode) {
    case 'TWIN_HELIX':
      return `A balanced 50/50 ${identity}. Both ${capitalize(anchor)} and ${capitalize(lens)} co-drive behavior equally—context determines which takes the lead.`;
    case 'LEANING_HELIX':
      return `${capitalize(anchor)} slightly leads (~60/40) in your ${identity} blend, but ${capitalize(lens)} remains a strong co-driver.`;
    case 'KEYSTONE_LENS':
      return `${capitalize(anchor)} is your keystone (~75/25). ${capitalize(lens)} acts as a consistent lens, coloring how your anchor expresses.`;
    case 'SIGNATURE_ACCENT':
      return `Strong ${capitalize(anchor)} signature (~90/10). ${capitalize(lens)} appears as a subtle accent rather than an active co-pilot.`;
    case 'PURELINE':
      return `Near-pure ${capitalize(anchor)} orientation (~95/5). ${capitalize(lens)} provides only trace coloring to your dominant voice.`;
  }
}

function buildDuetRoster(sorted: SortedArchetype[], metrics: DerivedMetrics): DuetRoster {
  const anchor = sorted[0].name;
  const lens = sorted[1].name;
  const mode = classifyDuetMode(metrics.r2);
  const identity = getDyadName(anchor, lens);

  return {
    mode,
    identity,
    anchor,
    lens,
    label: `Duet: ${identity} — ${getDuetModeLabel(mode)}`,
    description: getDuetModeDescription(mode, identity, anchor, lens),
  };
}

// Legacy dyad roster
function buildDyadRoster(sorted: SortedArchetype[], metrics: DerivedMetrics): DyadRoster {
  const anchor = sorted[0].name;
  const lens = sorted[1].name;
  const mode = classifyDuetMode(metrics.r2);
  const blend_class = duetModeToBlendClass(mode);
  const identity = getDyadName(anchor, lens);

  return {
    blend_class,
    anchor,
    lens,
    label: `${identity} — ${getDuetModeLabel(mode)}`,
    description: getDuetModeDescription(mode, identity, anchor, lens),
  };
}

// ─────────────────────────────────────────────────────────────────
// TRIO MODE CLASSIFICATION
// ─────────────────────────────────────────────────────────────────

function classifyTrioMode(sorted: SortedArchetype[]): TrioMode {
  const p1 = sorted[0].probability;
  const p2 = sorted[1].probability;
  const p3 = sorted[2].probability;

  const TRI_HELIX_THRESHOLD = 0.08;
  const PRISM_THRESHOLD = 0.05;

  const maxDiff = Math.max(Math.abs(p1 - p2), Math.abs(p2 - p3), Math.abs(p1 - p3));

  // All 3 within ±8%: Tri-Helix
  if (maxDiff <= TRI_HELIX_THRESHOLD) {
    return 'TRI_HELIX';
  }

  // Check for Keystone Prism: p1 > p2 ≈ p3
  const gap12 = p1 - p2;
  const gap23 = p2 - p3;

  if (gap12 > TRI_HELIX_THRESHOLD && gap23 <= PRISM_THRESHOLD) {
    return 'KEYSTONE_PRISM';
  }

  // Clear rank order: Keystone Orbit
  if (gap12 > PRISM_THRESHOLD && gap23 > PRISM_THRESHOLD) {
    return 'KEYSTONE_ORBIT';
  }

  return 'TRIAD_STACK';
}

// Legacy triad class mapping
function trioModeToTriadClass(mode: TrioMode): TriadClass {
  switch (mode) {
    case 'TRI_HELIX': return 'triad_fusion';
    case 'KEYSTONE_PRISM': return 'anchor_dual_lenses';
    case 'KEYSTONE_ORBIT':
    case 'TRIAD_STACK': return 'anchor_lens_shadow';
  }
}

function getTrioModeLabel(mode: TrioMode): string {
  const labels: Record<TrioMode, string> = {
    TRI_HELIX: 'Tri-Helix',
    KEYSTONE_PRISM: 'Keystone Prism',
    KEYSTONE_ORBIT: 'Keystone Orbit',
    TRIAD_STACK: 'Triad Stack',
  };
  return labels[mode];
}

function buildTrioRoster(sorted: SortedArchetype[]): TrioRoster {
  const primary = sorted[0].name;
  const secondary = sorted[1].name;
  const tertiary = sorted[2].name;
  const mode = classifyTrioMode(sorted);

  let label: string;
  let description: string;

  switch (mode) {
    case 'TRI_HELIX':
      label = `Trio: ${capitalize(primary)}–${capitalize(secondary)}–${capitalize(tertiary)} Tri-Helix`;
      description = `A balanced triad where ${capitalize(primary)}, ${capitalize(secondary)}, and ${capitalize(tertiary)} all contribute roughly equally. You draw from all three depending on context.`;
      break;
    case 'KEYSTONE_PRISM':
      label = `Trio: ${capitalize(primary)} Keystone Prism (Lenses: ${capitalize(secondary)}, ${capitalize(tertiary)})`;
      description = `${capitalize(primary)} anchors your expression, while ${capitalize(secondary)} and ${capitalize(tertiary)} act as dual lenses, both coloring how your keystone manifests.`;
      break;
    case 'KEYSTONE_ORBIT':
      label = `Trio: ${capitalize(primary)} Keystone Orbit (Lens: ${capitalize(secondary)}; Shadow: ${capitalize(tertiary)})`;
      description = `${capitalize(primary)} leads as keystone, ${capitalize(secondary)} provides the primary lens, and ${capitalize(tertiary)} operates as a background shadow influence.`;
      break;
    case 'TRIAD_STACK':
      label = `Trio: ${capitalize(primary)}–${capitalize(secondary)}–${capitalize(tertiary)} Stack`;
      description = `A three-voice structure led by ${capitalize(primary)}, with ${capitalize(secondary)} and ${capitalize(tertiary)} contributing in descending order.`;
      break;
  }

  return { mode, primary, secondary, tertiary, label, description };
}

// Legacy triad roster
function buildTriadRoster(sorted: SortedArchetype[]): TriadRoster {
  const primary = sorted[0].name;
  const secondary = sorted[1].name;
  const tertiary = sorted[2].name;
  const mode = classifyTrioMode(sorted);
  const triad_class = trioModeToTriadClass(mode);

  const trio = buildTrioRoster(sorted);

  return {
    triad_class,
    primary,
    secondary,
    tertiary,
    label: trio.label.replace('Trio: ', ''),
    description: trio.description,
  };
}

// ─────────────────────────────────────────────────────────────────
// POLYPHONIC MODE CLASSIFICATION (CHORD / CHORUS)
// ─────────────────────────────────────────────────────────────────

function classifyPolyphonicMode(sorted: SortedArchetype[], structure: Structure): PolyphonicMode {
  const activeVoices = sorted.filter(s => s.probability >= STRUCTURE_THRESHOLDS.chord_top4_threshold);
  const p1 = sorted[0]?.probability ?? 0;
  const p4 = sorted[3]?.probability ?? 0;

  if (structure === 'CHORD') {
    if (activeVoices.length === 4) {
      return 'CHORD_TOP4';
    }
    return 'CHORD_TOP_HEAVY';
  }

  // CHORUS
  return 'CHORUS_DISTRIBUTED';
}

function buildChoralRoster(sorted: SortedArchetype[], structure: Structure): ChoralRoster {
  const mode = classifyPolyphonicMode(sorted, structure);
  const contributing = sorted
    .filter(s => s.probability >= STRUCTURE_THRESHOLDS.chord_top4_threshold)
    .map(s => s.name);
  const anchor = sorted[0].name;

  let label: string;
  let description: string;

  switch (mode) {
    case 'CHORD_TOP4':
      label = `Chord: ${capitalize(anchor)} Chord (Top voices: ${contributing.map(c => capitalize(c)).join(', ')})`;
      description = `A structured four-voice chord led by ${capitalize(anchor)}. All four voices contribute meaningfully to your expression.`;
      break;
    case 'CHORD_TOP_HEAVY':
      label = `Chord: ${capitalize(anchor)} Top-Heavy (Voices: ${contributing.map(c => capitalize(c)).join(', ')})`;
      description = `${capitalize(anchor)} leads a top-heavy polyphonic structure where the leading voices are strong but a fourth voice is still present.`;
      break;
    case 'CHORUS_DISTRIBUTED':
      label = `Chorus: Distributed (Top voices: ${contributing.map(c => capitalize(c)).join(', ')})`;
      description = `Multiple voices contribute with similar weights. No single pair or triad dominates—you draw flexibly from several sources.`;
      break;
    case 'CHORUS_CONTEXT_SPLIT':
      label = `Chorus: Context-Split (Anchors vary by context)`;
      description = `Your anchor shifts based on context. Different situations activate different primary voices.`;
      break;
  }

  return { mode, anchor, contributing, label, description };
}

// Legacy polyphonic roster
function buildPolyphonicRoster(sorted: SortedArchetype[]): PolyphonicRoster {
  const contributing = sorted
    .filter(s => s.probability >= STRUCTURE_THRESHOLDS.chord_top4_threshold)
    .map(s => s.name);

  const names = contributing.map(n => capitalize(n)).join(', ');

  return {
    contributing,
    label: `Polyphonic Profile (${contributing.length} active)`,
    description: `Multiple archetypes contribute meaningfully to your profile: ${names}. No single pair or triad dominates—you draw flexibly from several sources.`,
  };
}

// ─────────────────────────────────────────────────────────────────
// CONFIDENCE CALCULATION
// ─────────────────────────────────────────────────────────────────

function computeConfidence(
  structure: Structure,
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

  switch (structure) {
    case 'SOLO': {
      const distFromP1 = p1 - STRUCTURE_THRESHOLDS.solo_p1;
      const distFromP2 = STRUCTURE_THRESHOLDS.solo_p2_max - p2;
      blend_gap = Math.min(distFromP1, distFromP2);
      if (blend_gap < 0.05) {
        shape_conf = 'LOW';
        notes.push('Near threshold for Solo classification');
      } else if (blend_gap < 0.10) {
        shape_conf = 'MEDIUM';
      }
      break;
    }
    case 'DUET': {
      const distFromS2 = metrics.S2 - STRUCTURE_THRESHOLDS.duet_s2;
      const distFromP3 = STRUCTURE_THRESHOLDS.duet_p3_max - p3;
      blend_gap = Math.min(distFromS2, distFromP3);

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
        notes.push('Near mode boundary');
        if (shape_conf === 'HIGH') shape_conf = 'MEDIUM';
      }

      if (blend_gap < 0.05) {
        shape_conf = 'LOW';
        notes.push('Near threshold for Duet classification');
      } else if (blend_gap < 0.10 && shape_conf === 'HIGH') {
        shape_conf = 'MEDIUM';
      }
      break;
    }
    case 'TRIO': {
      const distFromS3 = metrics.S3 - STRUCTURE_THRESHOLDS.trio_s3;
      const distFromP4 = STRUCTURE_THRESHOLDS.trio_p4_max - p4;
      blend_gap = Math.min(distFromS3, distFromP4);

      if (blend_gap < 0.05) {
        shape_conf = 'LOW';
        notes.push('Near threshold for Trio classification');
      } else if (blend_gap < 0.10) {
        shape_conf = 'MEDIUM';
      }
      break;
    }
    case 'CHORD':
    case 'CHORUS': {
      blend_gap = p1 - STRUCTURE_THRESHOLDS.mist_p1;
      shape_conf = 'MEDIUM';
      notes.push('Polyphonic profiles have inherently lower classification confidence');
      break;
    }
    case 'MIST': {
      blend_gap = STRUCTURE_THRESHOLDS.mist_p1 - p1;
      shape_conf = 'LOW';
      notes.push('Mist profile: no clear voice dominance');
      break;
    }
    case 'FAULTED': {
      blend_gap = 0;
      shape_conf = 'LOW';
      notes.push('Faulted: response quality issues detected');
      break;
    }
  }

  if (metrics.entropy_n > 0.90) {
    notes.push('Very high entropy suggests dispersed profile');
  }

  return { shape_conf, blend_gap, notes };
}

// ─────────────────────────────────────────────────────────────────
// MAIN ROSTER COMPUTATION
// ─────────────────────────────────────────────────────────────────

export function computeRoster(archetypes: ArchetypeProbabilities): RosterOutput {
  const sorted_probs = sortArchetypes(archetypes);
  const metrics = computeDerivedMetrics(sorted_probs);
  const structure = classifyStructure(sorted_probs, metrics);
  const shape_class = structureToShapeClass(structure);
  const confidence = computeConfidence(structure, sorted_probs, metrics);

  const roster: RosterOutput = {
    version: 'HPMA-Vocabulary-1.0',
    sorted_probs,
    metrics,
    structure,
    shape_class,
    confidence,
    summary_label: '',
  };

  // Build structure-specific rosters
  switch (structure) {
    case 'DUET':
      roster.duet = buildDuetRoster(sorted_probs, metrics);
      roster.dyad = buildDyadRoster(sorted_probs, metrics);
      roster.summary_label = roster.duet.label;
      break;
    case 'TRIO':
      roster.trio = buildTrioRoster(sorted_probs);
      roster.triad = buildTriadRoster(sorted_probs);
      roster.summary_label = roster.trio.label;
      break;
    case 'CHORD':
    case 'CHORUS':
      roster.choral = buildChoralRoster(sorted_probs, structure);
      roster.polyphonic = buildPolyphonicRoster(sorted_probs);
      roster.summary_label = roster.choral.label;
      break;
    case 'SOLO':
      roster.summary_label = `Solo: ${capitalize(sorted_probs[0].name)} Dominant`;
      break;
    case 'MIST':
      roster.summary_label = 'Mist: Unresolved Profile';
      break;
    case 'FAULTED':
      roster.summary_label = 'Faulted: Invalid Response';
      break;
  }

  return roster;
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC HELPERS
// ─────────────────────────────────────────────────────────────────

export function getStructureDescription(structure: Structure): string {
  const descriptions: Record<Structure, string> = {
    SOLO: 'A single voice strongly dominates your profile, with minimal influence from others.',
    DUET: 'Two voices form a clear pair that together define your expression.',
    TRIO: 'Three voices form a stable triad, each contributing meaningfully.',
    CHORD: 'Multiple voices contribute in a structured, top-heavy arrangement.',
    CHORUS: 'Many voices are active without a clear dominant structure.',
    MIST: 'No single voice stands out strongly—your profile is distributed broadly.',
    FAULTED: 'Response quality issues prevent reliable classification.',
  };
  return descriptions[structure];
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

export function getDuetModeLabelPublic(mode: DuetMode): string {
  return getDuetModeLabel(mode);
}

export function getBlendClassLabel(blend: DyadBlendClass): string {
  const labels: Record<DyadBlendClass, string> = {
    fusion: 'Twin-Helix (50/50)',
    tilted_fusion: 'Leaning Helix (60/40)',
    anchor_lens: 'Keystone & Lens (75/25)',
    dominant_trace: 'Signature & Accent (90/10)',
    near_pure: 'Pureline (95/5)',
  };
  return labels[blend];
}

export function getTrioModeLabelPublic(mode: TrioMode): string {
  return getTrioModeLabel(mode);
}

export function getTriadClassLabel(triad: TriadClass): string {
  const labels: Record<TriadClass, string> = {
    triad_fusion: 'Tri-Helix',
    anchor_dual_lenses: 'Keystone Prism',
    anchor_lens_shadow: 'Keystone Orbit',
  };
  return labels[triad];
}

export { getDyadName };

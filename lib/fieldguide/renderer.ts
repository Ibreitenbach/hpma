import { AssessmentResult } from '@/types/assessment';
import {
  ContentBundle,
  DyadEvaluation,
  PrimaryEvaluation,
  FieldGuideReport,
  EvaluationContext,
  RuleMatch,
  ModeModifiers,
  CompatibilityMatch,
} from './types';
import { RuleEvaluator, collectFlags, mergeSnippets, createContext } from './evaluator';

// Mode labels for human-readable display
const MODE_LABELS: Record<string, string> = {
  TWIN_HELIX: 'Twin-Helix',
  LEANING_HELIX: 'Leaning Helix',
  KEYSTONE_LENS: 'Keystone & Lens',
  SIGNATURE_ACCENT: 'Signature & Accent',
  PURELINE: 'Pureline',
  TRI_HELIX: 'Tri-Helix',
  KEYSTONE_PRISM: 'Keystone Prism',
  KEYSTONE_ORBIT: 'Keystone Orbit',
  TRIAD_STACK: 'Triad Stack',
  CHORD_TOP4: 'Chord (Top-4)',
  CHORD_TOP_HEAVY: 'Chord (Top-Heavy)',
  CHORUS_DISTRIBUTED: 'Chorus (Distributed)',
  CHORUS_CONTEXT_SPLIT: 'Chorus (Context-Split)',
  SOLO: 'Solo',
  NONE: 'Unclassified',
};

// Structure labels
const STRUCTURE_LABELS: Record<string, string> = {
  SOLO: 'Solo',
  DUET: 'Duet',
  TRIO: 'Trio',
  CHORD: 'Chord',
  CHORUS: 'Chorus',
  MIST: 'Mist',
  FAULTED: 'Faulted',
};

/**
 * Generates a complete FieldGuideReport from assessment results and content.
 */
export function generateFieldGuide(
  result: AssessmentResult,
  content: ContentBundle
): FieldGuideReport {
  const context = createContext(result);
  const evaluator = new RuleEvaluator(content.rules.thresholds);
  const ruleMatches = evaluator.evaluateAll(content.rules.rules, context);

  // Determine identity key and content based on structure
  const identityKey = getIdentityKey(result);
  let identityContent: DyadEvaluation | PrimaryEvaluation | undefined;

  if (result.roster.structure === 'SOLO') {
    // For solo structures, look up in primaries
    identityContent = content.primaries[identityKey.toLowerCase()] as PrimaryEvaluation | undefined;
  } else if (result.roster.duet) {
    // For duets, look up in dyads
    identityContent = content.dyads[identityKey] as DyadEvaluation | undefined;
  } else {
    // For trio/chord/chorus, try dyads first, then fall back to primary of anchor
    identityContent = content.dyads[identityKey] as DyadEvaluation | undefined;
    if (!identityContent) {
      const primaryKey = getPrimaryArchetypeKey(result);
      identityContent = content.primaries[primaryKey.toLowerCase()] as PrimaryEvaluation | undefined;
    }
  }

  // Get mode modifiers
  const modeModifiers = getModeModifiers(result, content);

  // Build the report
  const report = buildReport(
    result,
    context,
    content,
    identityContent,
    modeModifiers,
    ruleMatches
  );

  return report;
}

/**
 * Gets the identity key for content lookup (e.g., "SEEKER_SAGE").
 */
function getIdentityKey(result: AssessmentResult): string {
  if (result.roster.duet) {
    // Convert identity name to key format: "Seeker-Sage" -> "SEEKER_SAGE"
    return result.roster.duet.identity
      .replace(/-/g, '_')
      .replace(/ /g, '_')
      .toUpperCase();
  }

  // For non-duet structures, use primary archetype
  return getPrimaryArchetypeKey(result);
}

/**
 * Gets the primary archetype key for content lookup.
 */
function getPrimaryArchetypeKey(result: AssessmentResult): string {
  const sorted = Object.entries(result.archetypes)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length > 0) {
    return sorted[0][0].toUpperCase();
  }

  return 'UNKNOWN';
}

/**
 * Gets mode modifiers from content.
 */
function getModeModifiers(
  result: AssessmentResult,
  content: ContentBundle
): ModeModifiers | undefined {
  if (result.roster.duet) {
    return content.modes.duet_modes[result.roster.duet.mode];
  }
  if (result.roster.trio) {
    return content.modes.trio_modes[result.roster.trio.mode];
  }
  if (result.roster.choral) {
    return content.modes.polyphonic_modes[result.roster.choral.mode];
  }
  return undefined;
}

/**
 * Builds the complete report by merging all content sources.
 */
function buildReport(
  result: AssessmentResult,
  context: EvaluationContext,
  content: ContentBundle,
  identityContent: DyadEvaluation | PrimaryEvaluation | undefined,
  modeModifiers: ModeModifiers | undefined,
  ruleMatches: RuleMatch[]
): FieldGuideReport {
  // Collect all flags and snippets from rules
  const flags = collectFlags(ruleMatches);
  const snippets = mergeSnippets(ruleMatches);

  // Track selected blocks for glass-box trace
  const selectedBlocks: string[] = [];

  // Get identity info
  const identityName = getIdentityName(result, content);
  const identityTagline = identityContent?.tagline || '';
  const modeName = getModeName(result);
  const modeRatio = modeModifiers?.ratio;

  // Build summary label
  const summaryLabel = buildSummaryLabel(result, identityName, modeName);

  // Build roles
  const roles = buildRoles(result);

  // Merge domains from identity content + mode adds + rule snippets
  const domains = mergeDomains(identityContent, modeModifiers, snippets, selectedBlocks);

  return {
    version: 'HPMA-Report-1.0',
    generated_at: new Date().toISOString(),

    structure: result.roster.structure,
    structure_label: STRUCTURE_LABELS[result.roster.structure] || result.roster.structure,
    identity_name: identityName,
    identity_tagline: identityTagline,
    mode_name: modeName,
    mode_ratio: modeRatio,
    summary_label: summaryLabel,

    roles,
    domains,

    trace: {
      flags,
      matched_rules: ruleMatches.map(m => m.rule_id),
      selected_blocks: selectedBlocks,
    },
  };
}

/**
 * Gets the human-readable identity name.
 */
function getIdentityName(result: AssessmentResult, content: ContentBundle): string {
  if (result.roster.duet) {
    return result.roster.duet.identity;
  }

  // For non-duet, find primary archetype name
  const sorted = Object.entries(result.archetypes)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length > 0) {
    const key = sorted[0][0].toUpperCase();
    const primary = content.identities.primaries[key];
    return primary?.name || sorted[0][0];
  }

  return 'Unknown';
}

/**
 * Gets the human-readable mode name.
 */
function getModeName(result: AssessmentResult): string {
  if (result.roster.duet) {
    return MODE_LABELS[result.roster.duet.mode] || result.roster.duet.mode;
  }
  if (result.roster.trio) {
    return MODE_LABELS[result.roster.trio.mode] || result.roster.trio.mode;
  }
  if (result.roster.choral) {
    return MODE_LABELS[result.roster.choral.mode] || result.roster.choral.mode;
  }
  return MODE_LABELS[result.roster.structure] || 'Unclassified';
}

/**
 * Builds the summary label (e.g., "Duet: Seeker-Sage — Twin-Helix").
 */
function buildSummaryLabel(
  result: AssessmentResult,
  identityName: string,
  modeName: string
): string {
  const structureLabel = STRUCTURE_LABELS[result.roster.structure] || result.roster.structure;
  return `${structureLabel}: ${identityName} — ${modeName}`;
}

/**
 * Builds the roles object based on roster structure.
 */
function buildRoles(result: AssessmentResult): FieldGuideReport['roles'] {
  const roles: FieldGuideReport['roles'] = {};

  if (result.roster.duet) {
    roles.anchor = {
      name: 'Anchor',
      archetype: result.roster.duet.anchor,
    };
    roles.lens = {
      name: 'Lens',
      archetype: result.roster.duet.lens,
    };
  }

  if (result.roster.trio) {
    roles.keystone = {
      name: 'Keystone',
      archetype: result.roster.trio.primary,
    };
    roles.lens = {
      name: 'Lens',
      archetype: result.roster.trio.secondary,
    };
    roles.shadow = {
      name: 'Shadow',
      archetype: result.roster.trio.tertiary,
    };
  }

  if (result.roster.choral) {
    if (result.roster.choral.anchor) {
      roles.anchor = {
        name: 'Anchor',
        archetype: result.roster.choral.anchor,
      };
    }
    roles.voices = result.roster.choral.contributing.map(arch => ({
      name: 'Voice',
      archetype: arch,
    }));
  }

  return roles;
}

/**
 * Merges domain content from identity + mode + rules.
 */
function mergeDomains(
  identityContent: DyadEvaluation | PrimaryEvaluation | undefined,
  modeModifiers: ModeModifiers | undefined,
  ruleSnippets: Record<string, string[]>,
  selectedBlocks: string[]
): FieldGuideReport['domains'] {
  const domains: FieldGuideReport['domains'] = {
    strengths: { bullets: [], notes: [], evidence: [] },
    watchouts: { bullets: [], telltales: [], notes: [] },
    career: { best_environments: [], role_patterns: [], anti_patterns: [], collaboration: [], notes: [] },
    money: { style: [], risks: [], guardrails: [], notes: [] },
    relationships: { offers: [], needs: [], triggers: [], repair: [], notes: [] },
    parenting: { strengths: [], traps: [], do_more: [], do_less: [], notes: [] },
    hobbies: { recharge: [], play: [], warning_signs: [], notes: [] },
    self_improvement: { leverage: [], keystone_constraints: [], if_then_rules: [], growth_edges: [], notes: [] },
    compatibility: { complimentary: [], friction: [], conflict: [], general_notes: [] },
  };

  // Layer 1: Identity content
  if (identityContent?.domains) {
    const d = identityContent.domains;

    if (d.strengths) {
      domains.strengths.bullets.push(...(d.strengths.bullets || []));
      selectedBlocks.push('identity:strengths');
    }

    if (d.watchouts) {
      domains.watchouts.bullets.push(...(d.watchouts.bullets || []));
      domains.watchouts.telltales.push(...(d.watchouts.telltales || []));
      selectedBlocks.push('identity:watchouts');
    }

    if (d.career) {
      domains.career.best_environments.push(...(d.career.best_environments || []));
      domains.career.role_patterns.push(...(d.career.role_patterns || []));
      domains.career.anti_patterns.push(...(d.career.anti_patterns || []));
      domains.career.collaboration.push(...(d.career.collaboration || []));
      selectedBlocks.push('identity:career');
    }

    if (d.money) {
      domains.money.style.push(...(d.money.style || []));
      domains.money.risks.push(...(d.money.risks || []));
      domains.money.guardrails.push(...(d.money.guardrails || []));
      selectedBlocks.push('identity:money');
    }

    if (d.relationships) {
      domains.relationships.offers.push(...(d.relationships.offers || []));
      domains.relationships.needs.push(...(d.relationships.needs || []));
      domains.relationships.triggers.push(...(d.relationships.triggers || []));
      domains.relationships.repair.push(...(d.relationships.repair || []));
      selectedBlocks.push('identity:relationships');
    }

    if (d.parenting) {
      domains.parenting.strengths.push(...(d.parenting.strengths || []));
      domains.parenting.traps.push(...(d.parenting.traps || []));
      domains.parenting.do_more.push(...(d.parenting.do_more || []));
      domains.parenting.do_less.push(...(d.parenting.do_less || []));
      selectedBlocks.push('identity:parenting');
    }

    if (d.hobbies) {
      domains.hobbies.recharge.push(...(d.hobbies.recharge || []));
      domains.hobbies.play.push(...(d.hobbies.play || []));
      domains.hobbies.warning_signs.push(...(d.hobbies.warning_signs || []));
      selectedBlocks.push('identity:hobbies');
    }

    if (d.self_improvement) {
      domains.self_improvement.leverage.push(...(d.self_improvement.leverage || []));
      domains.self_improvement.keystone_constraints.push(...(d.self_improvement.keystone_constraints || []));
      domains.self_improvement.if_then_rules.push(...(d.self_improvement.if_then_rules || []));
      domains.self_improvement.growth_edges.push(...(d.self_improvement.growth_edges || []));
      selectedBlocks.push('identity:self_improvement');
    }

    if (d.compatibility) {
      domains.compatibility.complimentary.push(...(d.compatibility.complimentary || []));
      domains.compatibility.friction.push(...(d.compatibility.friction || []));
      domains.compatibility.conflict.push(...(d.compatibility.conflict || []));
      domains.compatibility.general_notes.push(...(d.compatibility.general_notes || []));
      selectedBlocks.push('identity:compatibility');
    }
  }

  // Layer 2: Mode modifiers (adds strengths/watchouts/prescriptions)
  if (modeModifiers?.adds) {
    if (modeModifiers.adds.strengths) {
      domains.strengths.notes.push(...modeModifiers.adds.strengths);
      selectedBlocks.push('mode:strengths');
    }
    if (modeModifiers.adds.watchouts) {
      domains.watchouts.notes.push(...modeModifiers.adds.watchouts);
      selectedBlocks.push('mode:watchouts');
    }
    if (modeModifiers.adds.prescriptions) {
      domains.self_improvement.notes.push(...modeModifiers.adds.prescriptions);
      selectedBlocks.push('mode:prescriptions');
    }
  }

  // Layer 3: Rule snippets (personalized additions)
  for (const [path, snippetList] of Object.entries(ruleSnippets)) {
    const [domain, field] = path.split('.');
    if (domain && field && domains[domain as keyof typeof domains]) {
      const domainObj = domains[domain as keyof typeof domains] as Record<string, unknown[]>;
      if (Array.isArray(domainObj[field])) {
        (domainObj[field] as string[]).push(...snippetList);
        selectedBlocks.push(`rule:${path}`);
      }
    }
  }

  return domains;
}

/**
 * Renders the report to markdown format.
 */
export function renderToMarkdown(report: FieldGuideReport): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${report.identity_name}`);
  lines.push(`*${report.identity_tagline}*`);
  lines.push('');
  lines.push(`**${report.summary_label}**`);
  if (report.mode_ratio) {
    lines.push(`Voice Balance: ${report.mode_ratio}`);
  }
  lines.push('');

  // Roles
  if (Object.keys(report.roles).length > 0) {
    lines.push('## Your Voices');
    if (report.roles.anchor) {
      lines.push(`- **${report.roles.anchor.name}**: ${report.roles.anchor.archetype}`);
    }
    if (report.roles.keystone) {
      lines.push(`- **${report.roles.keystone.name}**: ${report.roles.keystone.archetype}`);
    }
    if (report.roles.lens) {
      lines.push(`- **${report.roles.lens.name}**: ${report.roles.lens.archetype}`);
    }
    if (report.roles.accent) {
      lines.push(`- **${report.roles.accent.name}**: ${report.roles.accent.archetype}`);
    }
    if (report.roles.shadow) {
      lines.push(`- **${report.roles.shadow.name}**: ${report.roles.shadow.archetype}`);
    }
    if (report.roles.voices) {
      for (const voice of report.roles.voices) {
        lines.push(`- **${voice.name}**: ${voice.archetype}`);
      }
    }
    lines.push('');
  }

  // Strengths
  if (report.domains.strengths.bullets.length > 0 || report.domains.strengths.notes.length > 0) {
    lines.push('## Strengths');
    for (const bullet of report.domains.strengths.bullets) {
      lines.push(`- ${bullet}`);
    }
    if (report.domains.strengths.notes.length > 0) {
      lines.push('');
      for (const note of report.domains.strengths.notes) {
        lines.push(`> ${note}`);
      }
    }
    lines.push('');
  }

  // Watchouts
  if (report.domains.watchouts.bullets.length > 0 || report.domains.watchouts.notes.length > 0) {
    lines.push('## Watch For');
    for (const bullet of report.domains.watchouts.bullets) {
      lines.push(`- ${bullet}`);
    }
    if (report.domains.watchouts.telltales.length > 0) {
      lines.push('');
      lines.push('**Telltale Signs:**');
      for (const telltale of report.domains.watchouts.telltales) {
        lines.push(`- *${telltale}*`);
      }
    }
    if (report.domains.watchouts.notes.length > 0) {
      lines.push('');
      for (const note of report.domains.watchouts.notes) {
        lines.push(`> ${note}`);
      }
    }
    lines.push('');
  }

  // Career
  const career = report.domains.career;
  if (career.best_environments.length > 0 || career.role_patterns.length > 0) {
    lines.push('## Career');
    if (career.best_environments.length > 0) {
      lines.push('**Best Environments:**');
      for (const env of career.best_environments) {
        lines.push(`- ${env}`);
      }
    }
    if (career.role_patterns.length > 0) {
      lines.push('');
      lines.push('**Role Patterns:**');
      for (const pattern of career.role_patterns) {
        lines.push(`- ${pattern}`);
      }
    }
    if (career.anti_patterns.length > 0) {
      lines.push('');
      lines.push('**Avoid:**');
      for (const anti of career.anti_patterns) {
        lines.push(`- ${anti}`);
      }
    }
    if (career.notes.length > 0) {
      lines.push('');
      for (const note of career.notes) {
        lines.push(`> ${note}`);
      }
    }
    lines.push('');
  }

  // Money
  const money = report.domains.money;
  if (money.style.length > 0) {
    lines.push('## Money');
    lines.push('**Style:**');
    for (const s of money.style) {
      lines.push(`- ${s}`);
    }
    if (money.risks.length > 0) {
      lines.push('');
      lines.push('**Risks:**');
      for (const r of money.risks) {
        lines.push(`- ${r}`);
      }
    }
    if (money.guardrails.length > 0) {
      lines.push('');
      lines.push('**Guardrails:**');
      for (const g of money.guardrails) {
        lines.push(`- ${g}`);
      }
    }
    if (money.notes.length > 0) {
      lines.push('');
      for (const note of money.notes) {
        lines.push(`> ${note}`);
      }
    }
    lines.push('');
  }

  // Relationships
  const rel = report.domains.relationships;
  if (rel.offers.length > 0 || rel.needs.length > 0) {
    lines.push('## Relationships');
    if (rel.offers.length > 0) {
      lines.push('**You Offer:**');
      for (const o of rel.offers) {
        lines.push(`- ${o}`);
      }
    }
    if (rel.needs.length > 0) {
      lines.push('');
      lines.push('**You Need:**');
      for (const n of rel.needs) {
        lines.push(`- ${n}`);
      }
    }
    if (rel.triggers.length > 0) {
      lines.push('');
      lines.push('**Triggers:**');
      for (const t of rel.triggers) {
        lines.push(`- ${t}`);
      }
    }
    if (rel.repair.length > 0) {
      lines.push('');
      lines.push('**Repair:**');
      for (const r of rel.repair) {
        lines.push(`- ${r}`);
      }
    }
    if (rel.notes.length > 0) {
      lines.push('');
      for (const note of rel.notes) {
        lines.push(`> ${note}`);
      }
    }
    lines.push('');
  }

  // Self-Improvement
  const self = report.domains.self_improvement;
  if (self.leverage.length > 0 || self.if_then_rules.length > 0 || self.notes.length > 0) {
    lines.push('## Self-Improvement');
    if (self.leverage.length > 0) {
      lines.push('**Leverage Points:**');
      for (const l of self.leverage) {
        lines.push(`- ${l}`);
      }
    }
    if (self.keystone_constraints.length > 0) {
      lines.push('');
      lines.push('**Keystone Constraints:**');
      for (const k of self.keystone_constraints) {
        lines.push(`- ${k}`);
      }
    }
    if (self.if_then_rules.length > 0) {
      lines.push('');
      lines.push('**If-Then Rules:**');
      for (const rule of self.if_then_rules) {
        lines.push(`- ${rule}`);
      }
    }
    if (self.growth_edges.length > 0) {
      lines.push('');
      lines.push('**Growth Edges:**');
      for (const edge of self.growth_edges) {
        lines.push(`- ${edge}`);
      }
    }
    if (self.notes.length > 0) {
      lines.push('');
      for (const note of self.notes) {
        lines.push(`> ${note}`);
      }
    }
    lines.push('');
  }

  // Compatibility
  const compat = report.domains.compatibility;
  if (compat.complimentary.length > 0 || compat.friction.length > 0) {
    lines.push('## Compatibility');
    if (compat.complimentary.length > 0) {
      lines.push('**Complementary Matches:**');
      for (const c of compat.complimentary) {
        lines.push(`- **${c.match}**: ${c.why}`);
      }
    }
    if (compat.friction.length > 0) {
      lines.push('');
      lines.push('**Friction Points:**');
      for (const f of compat.friction) {
        lines.push(`- **${f.match}**: ${f.why}`);
      }
    }
    if (compat.conflict.length > 0) {
      lines.push('');
      lines.push('**Potential Conflicts:**');
      for (const c of compat.conflict) {
        lines.push(`- **${c.match}**: ${c.why}`);
      }
    }
    if (compat.general_notes.length > 0) {
      lines.push('');
      for (const note of compat.general_notes) {
        lines.push(`> ${note}`);
      }
    }
    lines.push('');
  }

  // Trace (for glass-box reporting)
  lines.push('---');
  lines.push('');
  lines.push('*Glass-Box Trace*');
  lines.push(`Flags: ${report.trace.flags.join(', ') || 'none'}`);
  lines.push(`Rules Matched: ${report.trace.matched_rules.length}`);

  return lines.join('\n');
}

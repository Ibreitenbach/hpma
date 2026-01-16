import { AssessmentResult } from '@/types/assessment';

export function toJSON(result: AssessmentResult): string {
  return JSON.stringify(result, null, 2);
}

export function toCSV(result: AssessmentResult): string {
  const lines: string[] = [];

  // Header
  lines.push('Category,Dimension,Score');

  // HEXACO traits
  for (const [trait, score] of Object.entries(result.hexaco)) {
    lines.push(`HEXACO,${trait},${score.toFixed(2)}`);
  }

  // Motives
  for (const [motive, score] of Object.entries(result.motives)) {
    lines.push(`Motive,${motive},${score.toFixed(2)}`);
  }

  // Affects
  for (const [affect, score] of Object.entries(result.affects)) {
    lines.push(`Affect,${affect},${score.toFixed(2)}`);
  }

  // Archetypes
  lines.push('');
  lines.push('Archetype,Probability');
  for (const [archetype, prob] of Object.entries(result.archetypes)) {
    lines.push(`${archetype},${(prob * 100).toFixed(1)}%`);
  }

  // Metadata
  lines.push('');
  lines.push('Metadata,Value');
  lines.push(`Completed,${result.completedAt}`);
  lines.push(`Duration (seconds),${Math.round(result.durationMs / 1000)}`);
  lines.push(`Uncertainty,${(result.archetypeUncertainty * 100).toFixed(1)}%`);

  // Validity flags
  lines.push('');
  lines.push('Validity Flag,Status');
  lines.push(`Idealized,${result.validity.idealized ? 'FLAGGED' : 'OK'}`);
  lines.push(`Random,${result.validity.random ? 'FLAGGED' : 'OK'}`);
  lines.push(`Inattentive,${result.validity.inattentive ? 'FLAGGED' : 'OK'}`);

  // Roster Vocabulary (v1.0)
  lines.push('');
  lines.push('Roster Classification,Value');
  lines.push(`Version,${result.roster.version}`);
  lines.push(`Structure,${result.roster.structure}`);
  lines.push(`Summary Label,${result.roster.summary_label}`);
  lines.push(`Confidence,${result.roster.confidence.shape_conf}`);

  // Derived Metrics
  lines.push('');
  lines.push('Derived Metric,Value');
  lines.push(`S2 (Top 2 Sum),${(result.roster.metrics.S2 * 100).toFixed(1)}%`);
  lines.push(`S3 (Top 3 Sum),${(result.roster.metrics.S3 * 100).toFixed(1)}%`);
  lines.push(`r2 (Blend Ratio),${(result.roster.metrics.r2 * 100).toFixed(1)}%`);
  lines.push(`g12 (Gap),${(result.roster.metrics.g12 * 100).toFixed(1)}%`);
  lines.push(`Entropy (Normalized),${(result.roster.metrics.entropy_n * 100).toFixed(1)}%`);

  // Duet details (new vocabulary)
  if (result.roster.duet) {
    lines.push('');
    lines.push('Duet Details,Value');
    lines.push(`Mode,${result.roster.duet.mode}`);
    lines.push(`Identity,${result.roster.duet.identity}`);
    lines.push(`Anchor,${result.roster.duet.anchor}`);
    lines.push(`Lens,${result.roster.duet.lens}`);
    lines.push(`Label,${result.roster.duet.label}`);
  }

  // Trio details (new vocabulary)
  if (result.roster.trio) {
    lines.push('');
    lines.push('Trio Details,Value');
    lines.push(`Mode,${result.roster.trio.mode}`);
    lines.push(`Keystone,${result.roster.trio.primary}`);
    lines.push(`Lens,${result.roster.trio.secondary}`);
    lines.push(`Shadow,${result.roster.trio.tertiary}`);
    lines.push(`Label,${result.roster.trio.label}`);
  }

  // Choral details (new vocabulary)
  if (result.roster.choral) {
    lines.push('');
    lines.push('Choral Details,Value');
    lines.push(`Mode,${result.roster.choral.mode}`);
    lines.push(`Anchor,${result.roster.choral.anchor || 'N/A'}`);
    lines.push(`Active Voices,${result.roster.choral.contributing.join('; ')}`);
    lines.push(`Label,${result.roster.choral.label}`);
  }

  // Legacy shape-specific details (for backward compatibility)
  if (result.roster.dyad) {
    lines.push('');
    lines.push('Legacy Dyad Details,Value');
    lines.push(`Blend Class,${result.roster.dyad.blend_class}`);
    lines.push(`Anchor,${result.roster.dyad.anchor}`);
    lines.push(`Lens,${result.roster.dyad.lens}`);
  }

  if (result.roster.triad) {
    lines.push('');
    lines.push('Legacy Triad Details,Value');
    lines.push(`Triad Class,${result.roster.triad.triad_class}`);
    lines.push(`Primary,${result.roster.triad.primary}`);
    lines.push(`Secondary,${result.roster.triad.secondary}`);
    lines.push(`Tertiary,${result.roster.triad.tertiary}`);
  }

  if (result.roster.polyphonic) {
    lines.push('');
    lines.push('Legacy Polyphonic Details,Value');
    lines.push(`Contributing,${result.roster.polyphonic.contributing.join('; ')}`);
  }

  return lines.join('\n');
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(result: AssessmentResult): void {
  const timestamp = new Date().toISOString().split('T')[0];
  downloadBlob(toJSON(result), `hpma-results-${timestamp}.json`, 'application/json');
}

export function downloadCSV(result: AssessmentResult): void {
  const timestamp = new Date().toISOString().split('T')[0];
  downloadBlob(toCSV(result), `hpma-results-${timestamp}.csv`, 'text/csv');
}

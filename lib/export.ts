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

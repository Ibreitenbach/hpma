import {
  Rule,
  RulesContent,
  RuleMatch,
  RuleSnippet,
  EvaluationContext,
} from './types';

type ThresholdMap = Record<string, number>;

/**
 * Parses and evaluates rule conditions against assessment context.
 * Supports:
 * - Simple comparisons: scores.hexaco.O >= 6.0
 * - Threshold references: scores.hexaco.O >= thresholds.high
 * - Boolean AND: condition1 AND condition2
 * - Boolean equality: validity.idealized == true
 * - String equality: roster.duet.mode == 'TWIN_HELIX'
 */
export class RuleEvaluator {
  private thresholds: ThresholdMap;

  constructor(thresholds: ThresholdMap) {
    this.thresholds = thresholds;
  }

  /**
   * Evaluates all rules against the context, returning matches.
   */
  evaluateAll(rules: Rule[], context: EvaluationContext): RuleMatch[] {
    const matches: RuleMatch[] = [];

    for (const rule of rules) {
      if (this.evaluateCondition(rule.when, context)) {
        matches.push({
          rule_id: rule.id,
          flags: rule.add_flags,
          snippets: rule.add_snippets || {},
        });
      }
    }

    return matches;
  }

  /**
   * Evaluates a single condition string.
   */
  evaluateCondition(condition: string, context: EvaluationContext): boolean {
    // Handle AND conditions
    if (condition.includes(' AND ')) {
      const parts = condition.split(' AND ').map(p => p.trim());
      return parts.every(part => this.evaluateSingleCondition(part, context));
    }

    // Handle OR conditions
    if (condition.includes(' OR ')) {
      const parts = condition.split(' OR ').map(p => p.trim());
      return parts.some(part => this.evaluateSingleCondition(part, context));
    }

    return this.evaluateSingleCondition(condition, context);
  }

  /**
   * Evaluates a single atomic condition (no AND/OR).
   */
  private evaluateSingleCondition(condition: string, context: EvaluationContext): boolean {
    // Parse the condition into left, operator, right
    const match = condition.match(/^(.+?)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
    if (!match) {
      console.warn(`Invalid condition format: ${condition}`);
      return false;
    }

    const [, leftPath, operator, rightValue] = match;

    // Resolve left side (always a path into context)
    const left = this.resolvePath(leftPath.trim(), context);

    // Resolve right side (could be a threshold reference, literal, or path)
    const right = this.resolveValue(rightValue.trim(), context);

    // Compare
    return this.compare(left, operator, right);
  }

  /**
   * Resolves a dotted path to a value in the context.
   */
  private resolvePath(path: string, context: EvaluationContext): unknown {
    const parts = path.split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  /**
   * Resolves a value that could be:
   * - A threshold reference: thresholds.high
   * - A string literal: 'TWIN_HELIX'
   * - A boolean literal: true/false
   * - A numeric literal: 6.0
   */
  private resolveValue(value: string, context: EvaluationContext): unknown {
    // Threshold reference
    if (value.startsWith('thresholds.')) {
      const thresholdName = value.substring('thresholds.'.length);
      return this.thresholds[thresholdName];
    }

    // String literal (single quotes)
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }

    // String literal (double quotes)
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }

    // Boolean literals
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Numeric literal
    const num = parseFloat(value);
    if (!isNaN(num)) return num;

    // Path reference (e.g., roster.structure)
    return this.resolvePath(value, context);
  }

  /**
   * Performs comparison between two values.
   */
  private compare(left: unknown, operator: string, right: unknown): boolean {
    // Handle undefined/null
    if (left === undefined || left === null) {
      return operator === '==' ? right === undefined || right === null : false;
    }

    switch (operator) {
      case '>=':
        return (left as number) >= (right as number);
      case '<=':
        return (left as number) <= (right as number);
      case '>':
        return (left as number) > (right as number);
      case '<':
        return (left as number) < (right as number);
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }
}

/**
 * Collects all flags from rule matches.
 */
export function collectFlags(matches: RuleMatch[]): string[] {
  const flags = new Set<string>();
  for (const match of matches) {
    for (const flag of match.flags) {
      flags.add(flag);
    }
  }
  return Array.from(flags);
}

/**
 * Merges snippets from all rule matches into domain buckets.
 */
export function mergeSnippets(matches: RuleMatch[]): Record<string, string[]> {
  const merged: Record<string, string[]> = {};

  for (const match of matches) {
    for (const [domainPath, snippets] of Object.entries(match.snippets)) {
      if (!merged[domainPath]) {
        merged[domainPath] = [];
      }
      merged[domainPath].push(...snippets);
    }
  }

  return merged;
}

/**
 * Creates an evaluation context from an AssessmentResult.
 */
export function createContext(result: import('@/types/assessment').AssessmentResult): EvaluationContext {
  return {
    scores: {
      hexaco: {
        H: result.hexaco.H,
        E: result.hexaco.E,
        X: result.hexaco.X,
        A: result.hexaco.A,
        C: result.hexaco.C,
        O: result.hexaco.O,
      },
      motives: {
        security: result.motives.security,
        belonging: result.motives.belonging,
        status: result.motives.status,
        mastery: result.motives.mastery,
        autonomy: result.motives.autonomy,
        purpose: result.motives.purpose,
      },
      affects: {
        seeking: result.affects.seeking,
        fear: result.affects.fear,
        anger: result.affects.anger,
        care: result.affects.care,
        grief: result.affects.grief,
        play: result.affects.play,
        desire: result.affects.desire,
      },
    },
    archetypes: {
      explorer: result.archetypes.explorer,
      organizer: result.archetypes.organizer,
      connector: result.archetypes.connector,
      protector: result.archetypes.protector,
      performer: result.archetypes.performer,
      philosopher: result.archetypes.philosopher,
    },
    validity: {
      idealized: result.validity.idealized,
      random: result.validity.random,
      inattentive: result.validity.inattentive,
    },
    roster: {
      structure: result.roster.structure,
      duet: result.roster.duet,
      trio: result.roster.trio,
      choral: result.roster.choral,
      metrics: result.roster.metrics,
    },
  };
}

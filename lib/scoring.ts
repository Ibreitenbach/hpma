import { Question, HEXACOProfile, MotiveProfile, AffectProfile } from '@/types/assessment';
import { questions, QUESTION_RANGES } from './questions';

export function reverseScore(value: number): number {
  return 8 - value;
}

export function getScore(responses: Record<number, number>, questionId: number): number {
  const question = questions.find(q => q.id === questionId);
  if (!question) return 0;

  const rawValue = responses[questionId] ?? 0;
  return question.reversed ? reverseScore(rawValue) : rawValue;
}

export function computeDomainAverage(
  responses: Record<number, number>,
  domain: keyof typeof QUESTION_RANGES
): number {
  const [start, end] = QUESTION_RANGES[domain];
  const domainQuestions = questions.filter(q => q.id >= start && q.id <= end);

  if (domainQuestions.length === 0) return 0;

  const sum = domainQuestions.reduce((acc, q) => {
    return acc + getScore(responses, q.id);
  }, 0);

  return sum / domainQuestions.length;
}

export function zScore(raw: number, mean: number = 4, sd: number = 1.5): number {
  return (raw - mean) / sd;
}

export function computeHEXACO(responses: Record<number, number>): HEXACOProfile {
  return {
    H: computeDomainAverage(responses, 'H'),
    E: computeDomainAverage(responses, 'E'),
    X: computeDomainAverage(responses, 'X'),
    A: computeDomainAverage(responses, 'A'),
    C: computeDomainAverage(responses, 'C'),
    O: computeDomainAverage(responses, 'O'),
  };
}

export function computeMotives(responses: Record<number, number>): MotiveProfile {
  return {
    security: computeDomainAverage(responses, 'security'),
    belonging: computeDomainAverage(responses, 'belonging'),
    status: computeDomainAverage(responses, 'status'),
    mastery: computeDomainAverage(responses, 'mastery'),
    autonomy: computeDomainAverage(responses, 'autonomy'),
    purpose: computeDomainAverage(responses, 'purpose'),
  };
}

export function computeAffects(responses: Record<number, number>): AffectProfile {
  return {
    seeking: computeDomainAverage(responses, 'seeking'),
    fear: computeDomainAverage(responses, 'fear'),
    anger: computeDomainAverage(responses, 'anger'),
    care: computeDomainAverage(responses, 'care'),
    grief: computeDomainAverage(responses, 'grief'),
    play: computeDomainAverage(responses, 'play'),
    desire: computeDomainAverage(responses, 'desire'),
  };
}

export function computeFullProfile(responses: Record<number, number>): {
  hexaco: HEXACOProfile;
  motives: MotiveProfile;
  affects: AffectProfile;
} {
  return {
    hexaco: computeHEXACO(responses),
    motives: computeMotives(responses),
    affects: computeAffects(responses),
  };
}

// Normalized scores (0-1 scale for visualizations)
export function normalizeScore(score: number, min: number = 1, max: number = 7): number {
  return (score - min) / (max - min);
}

export function normalizeProfile<T extends Record<string, number>>(profile: T): T {
  const normalized = {} as T;
  for (const key in profile) {
    normalized[key] = normalizeScore(profile[key]) as T[typeof key];
  }
  return normalized;
}

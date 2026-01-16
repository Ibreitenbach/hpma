import { ValidityFlags } from '@/types/assessment';

export function checkValidity(responses: Record<number, number>): ValidityFlags {
  // Item 107: "I have never told a lie in my entire life." (idealized if >= 6)
  // Item 109: "I always stay perfectly calm no matter what." (idealized if >= 6)
  const idealized = (responses[107] >= 6) || (responses[109] >= 6);

  // Item 112: "I answered some questions randomly." (random if >= 4)
  const random = responses[112] >= 4;

  // Item 111: "I read every statement carefully before answering." (inattentive if <= 3)
  const inattentive = responses[111] <= 3;

  return {
    idealized,
    random,
    inattentive,
  };
}

export function getValidityMessage(flags: ValidityFlags): string | null {
  const messages: string[] = [];

  if (flags.idealized) {
    messages.push("Some responses suggest idealized self-presentation. Results may reflect aspirational rather than typical behavior.");
  }

  if (flags.random) {
    messages.push("You indicated some responses may have been random. Results should be interpreted with caution.");
  }

  if (flags.inattentive) {
    messages.push("Low attention to items detected. Consider retaking the assessment with more focus.");
  }

  return messages.length > 0 ? messages.join(' ') : null;
}

export function hasValidityIssues(flags: ValidityFlags): boolean {
  return flags.idealized || flags.random || flags.inattentive;
}

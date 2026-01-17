export * from './types';
export * from './evaluator';
export * from './renderer';
export * from './loader';
export * from './content-bundle';

// Re-export main functions for convenience
import { generateFieldGuide, renderToMarkdown } from './renderer';
import { createContext, RuleEvaluator, collectFlags, mergeSnippets } from './evaluator';
import { loadContent } from './loader';
import { contentBundle } from './content-bundle';

export {
  generateFieldGuide,
  renderToMarkdown,
  createContext,
  RuleEvaluator,
  collectFlags,
  mergeSnippets,
  loadContent,
  contentBundle,
};

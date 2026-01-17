'use client';

import { motion } from 'framer-motion';
import type { ClassName, Epithet, EpithetCategory } from '@/types/assessment';

interface ClassNameDisplayProps {
  className: ClassName;
}

const CATEGORY_COLORS: Record<EpithetCategory, { bg: string; text: string; border: string }> = {
  trait_facet: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  motive: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  affect: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  attachment: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  antagonism: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  context: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

const CATEGORY_LABELS: Record<EpithetCategory, string> = {
  trait_facet: 'Trait',
  motive: 'Motive',
  affect: 'Affect',
  attachment: 'Attachment',
  antagonism: 'Antagonism',
  context: 'Context',
};

function EpithetBadge({ epithet }: { epithet: Epithet }) {
  const colors = CATEGORY_COLORS[epithet.category];
  const word = epithet.direction === 'high' ? epithet.positiveWord : epithet.negativeWord;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border}`}
    >
      <span className={`text-sm font-medium ${colors.text}`}>{word}</span>
      <span className="text-xs text-gray-400">
        {CATEGORY_LABELS[epithet.category]}
      </span>
    </motion.div>
  );
}

export default function ClassNameDisplay({ className }: ClassNameDisplayProps) {
  const hasEpithets = className.epithets.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl p-6 shadow-lg border border-indigo-100"
    >
      {/* Main class name */}
      <div className="text-center mb-6">
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
          Your Personality Class
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          {className.full}
        </motion.h2>
        {className.templateUsed !== className.full && (
          <div className="text-sm text-gray-500 mt-2">
            {className.templateUsed}
          </div>
        )}
      </div>

      {/* Epithet breakdown */}
      {hasEpithets && (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-gray-400 text-center">
            Defining Traits
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {className.epithets.map((epithet, idx) => (
              <motion.div
                key={epithet.sourceKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <EpithetBadge epithet={epithet} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Salience details (collapsible) */}
      {hasEpithets && (
        <details className="mt-4">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 text-center">
            Salience Details
          </summary>
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            {className.epithets.map((e) => (
              <div key={e.sourceKey} className="flex justify-between px-4">
                <span>
                  {e.direction === 'high' ? e.positiveWord : e.negativeWord}
                  <span className="text-gray-400 ml-1">({e.sourceKey.split('.')[1]})</span>
                </span>
                <span className="font-mono">
                  z={e.zScore.toFixed(2)} → salience={e.salience.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Fallback for balanced profiles */}
      {!hasEpithets && (
        <div className="text-center text-gray-500 text-sm">
          Your profile shows balanced scores across all dimensions.
          No single trait dominates.
        </div>
      )}
    </motion.div>
  );
}

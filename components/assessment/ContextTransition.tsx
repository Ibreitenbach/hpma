'use client';

import { motion } from 'framer-motion';
import type { ContextType } from '@/types/assessment';

interface ContextTransitionProps {
  fromPhase: 'BASELINE' | ContextType;
  toPhase: ContextType;
  onContinue: () => void;
  onSkip?: () => void;
}

const CONTEXT_INFO: Record<ContextType, { title: string; description: string; icon: string; examples: string[] }> = {
  BASELINE: {
    title: 'Baseline',
    description: 'Your general tendencies',
    icon: '📊',
    examples: [],
  },
  WORK: {
    title: 'Work & Obligations',
    description: 'How you behave in structured, professional settings',
    icon: '💼',
    examples: ['At the office', 'In meetings', 'With deadlines', 'Around colleagues'],
  },
  STRESS: {
    title: 'Under Pressure',
    description: 'How you respond when overwhelmed or threatened',
    icon: '⚡',
    examples: ['During crises', 'When overloaded', 'Facing conflict', 'Under time pressure'],
  },
  INTIMACY: {
    title: 'Close Relationships',
    description: 'How you are with those closest to you',
    icon: '💜',
    examples: ['With your partner', 'Close friends', 'Family members', 'Deep conversations'],
  },
  PUBLIC: {
    title: 'Being Observed',
    description: 'How you behave when you feel watched or judged',
    icon: '👁️',
    examples: ['Presentations', 'Social events', 'First impressions', 'Being evaluated'],
  },
};

export default function ContextTransition({
  fromPhase,
  toPhase,
  onContinue,
  onSkip,
}: ContextTransitionProps) {
  const info = CONTEXT_INFO[toPhase];
  const isFirstContext = fromPhase === 'BASELINE';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="max-w-xl mx-auto text-center">
        {isFirstContext && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-4">
              ✓ Baseline Complete
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Now Let&apos;s Explore Context
            </h2>
            <p className="text-gray-600">
              The same person can show up differently in different situations.
              We&apos;ll re-ask 24 key questions in 4 life contexts to see how
              your personality shifts.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: isFirstContext ? 0.3 : 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-5xl mb-4">{info.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Context: {info.title}
          </h3>
          <p className="text-gray-600 mb-6">{info.description}</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Think about situations like:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {info.examples.map((ex) => (
                <span
                  key={ex}
                  className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Answer the next 24 questions imagining yourself in these situations.
          </p>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Start {info.title} Section
            </motion.button>

            {onSkip && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Skip context sections (baseline only)
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xs text-gray-400"
        >
          24 questions per context • 4 contexts total • ~10 minutes remaining
        </motion.div>
      </div>
    </motion.div>
  );
}

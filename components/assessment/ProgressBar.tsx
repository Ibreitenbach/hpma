'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  answeredCount: number;
}

export default function ProgressBar({ current, total, answeredCount }: ProgressBarProps) {
  const progressPercent = ((current + 1) / total) * 100;
  const answeredPercent = (answeredCount / total) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Question {current + 1} of {total}</span>
        <span>{answeredCount} answered ({Math.round(answeredPercent)}%)</span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Answered progress (lighter) */}
        <motion.div
          className="absolute h-full bg-indigo-200"
          initial={{ width: 0 }}
          animate={{ width: `${answeredPercent}%` }}
          transition={{ duration: 0.3 }}
        />
        {/* Current position (darker) */}
        <motion.div
          className="absolute h-full bg-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {/* Section markers */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>Traits</span>
        <span className="ml-8">Motives</span>
        <span className="mr-4">Affects</span>
        <span>✓</span>
      </div>
    </div>
  );
}

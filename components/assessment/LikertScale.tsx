'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface LikertScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
  onSubmit?: () => void;
}

const SCALE_LABELS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Slightly Disagree' },
  { value: 4, label: 'Neutral' },
  { value: 5, label: 'Slightly Agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Strongly Agree' },
];

export default function LikertScale({ value, onChange, onSubmit }: LikertScaleProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key;
    if (key >= '1' && key <= '7') {
      onChange(parseInt(key));
    } else if ((key === 'Enter' || key === ' ') && value !== undefined && onSubmit) {
      onSubmit();
    }
  }, [onChange, onSubmit, value]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-xs text-gray-500">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
      <div className="flex gap-2 justify-center">
        {SCALE_LABELS.map(({ value: v, label }) => (
          <motion.button
            key={v}
            onClick={() => onChange(v)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-12 h-12 rounded-full font-semibold text-lg transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${value === v
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={label}
            aria-label={`${v} - ${label}`}
          >
            {v}
          </motion.button>
        ))}
      </div>
      <div className="text-center mt-4 text-sm text-gray-400">
        Press 1-7 to answer, Enter to continue
      </div>
    </div>
  );
}

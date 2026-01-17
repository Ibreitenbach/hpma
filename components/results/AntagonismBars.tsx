'use client';

import { motion } from 'framer-motion';
import type { AntagonismProfile } from '@/types/assessment';

interface AntagonismBarsProps {
  profile: AntagonismProfile;
  width?: number;
}

const FACET_LABELS: Record<string, { label: string; description: string }> = {
  exploitative: {
    label: 'Exploitative',
    description: 'Tendency to manipulate others for personal gain',
  },
  callous: {
    label: 'Callous',
    description: 'Lack of empathy or concern for others',
  },
  combative: {
    label: 'Combative',
    description: 'Confrontational and aggressive tendencies',
  },
  image_driven: {
    label: 'Image-Driven',
    description: 'Need for admiration and special treatment',
  },
};

function getBarColor(score: number, elevated: boolean): string {
  if (score >= 5.5) return 'bg-rose-500';
  if (score >= 4.5) return 'bg-amber-500';
  return 'bg-slate-400';
}

function getTextColor(score: number): string {
  if (score >= 5.5) return 'text-rose-600';
  if (score >= 4.5) return 'text-amber-600';
  return 'text-slate-600';
}

export default function AntagonismBars({
  profile,
  width = 380,
}: AntagonismBarsProps) {
  const facets = ['exploitative', 'callous', 'combative', 'image_driven'] as const;
  const maxScore = 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-lg"
      style={{ width }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Antagonism Profile</h3>
        {profile.elevated && (
          <span className="px-2 py-1 text-xs font-medium bg-rose-100 text-rose-700 rounded-full">
            Elevated
          </span>
        )}
      </div>

      <div className="space-y-4">
        {facets.map((facet, idx) => {
          const score = profile[facet];
          const percentage = (score / maxScore) * 100;
          const info = FACET_LABELS[facet];

          return (
            <motion.div
              key={facet}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{info.label}</span>
                <span className={`text-sm font-semibold ${getTextColor(score)}`}>
                  {score.toFixed(1)}
                </span>
              </div>

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                  className={`h-full rounded-full ${getBarColor(score, profile.elevated)}`}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">{info.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Composite score */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Composite Score</span>
          <span className={`text-lg font-bold ${profile.elevated ? 'text-rose-600' : 'text-gray-700'}`}>
            {profile.composite.toFixed(2)}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(profile.composite / maxScore) * 100}%` }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className={`h-full rounded-full ${profile.elevated ? 'bg-rose-500' : 'bg-slate-400'}`}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {profile.elevated
            ? 'Score indicates elevated antagonistic tendencies'
            : 'Score within typical range'}
        </p>
      </div>
    </motion.div>
  );
}

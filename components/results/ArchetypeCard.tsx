'use client';

import { motion } from 'framer-motion';
import { ArchetypeProbabilities } from '@/types/assessment';
import { getArchetypeDescription } from '@/lib/archetypes';

interface ArchetypeCardProps {
  archetypes: ArchetypeProbabilities;
  uncertainty: number;
}

const ARCHETYPE_COLORS: Record<keyof ArchetypeProbabilities, string> = {
  explorer: 'from-purple-500 to-indigo-500',
  organizer: 'from-blue-500 to-cyan-500',
  connector: 'from-emerald-500 to-teal-500',
  protector: 'from-amber-500 to-orange-500',
  performer: 'from-pink-500 to-rose-500',
  philosopher: 'from-violet-500 to-purple-500',
};

const ARCHETYPE_ICONS: Record<keyof ArchetypeProbabilities, string> = {
  explorer: '🧭',
  organizer: '📐',
  connector: '🤝',
  protector: '🛡️',
  performer: '🎭',
  philosopher: '💭',
};

export default function ArchetypeCard({ archetypes, uncertainty }: ArchetypeCardProps) {
  const sorted = Object.entries(archetypes)
    .sort(([, a], [, b]) => b - a)
    .map(([name, probability]) => ({
      name: name as keyof ArchetypeProbabilities,
      probability,
    }));

  const top = sorted[0];
  const second = sorted[1];
  const isBlend = uncertainty > 0.7; // High uncertainty means close probabilities

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Archetype Profile</h3>

      {/* Primary archetype */}
      <div className={`bg-gradient-to-r ${ARCHETYPE_COLORS[top.name]} rounded-xl p-4 text-white mb-4`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{ARCHETYPE_ICONS[top.name]}</span>
          <div>
            <h4 className="text-xl font-bold capitalize">{top.name}</h4>
            <p className="text-sm opacity-90">{(top.probability * 100).toFixed(1)}% match</p>
          </div>
        </div>
        <p className="text-sm opacity-90">{getArchetypeDescription(top.name)}</p>
      </div>

      {/* Blend indicator */}
      {isBlend && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Blend Profile Detected:</span> Your scores suggest a
            {' '}<span className="font-medium capitalize">{top.name}–{second.name}</span> blend.
            This indicates strength in both archetypes.
          </p>
        </div>
      )}

      {/* All probabilities */}
      <div className="space-y-2">
        {sorted.map(({ name, probability }, index) => (
          <div key={name} className="flex items-center gap-3">
            <span className="text-lg">{ARCHETYPE_ICONS[name]}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize font-medium text-gray-700">{name}</span>
                <span className="text-gray-500">{(probability * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${probability * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-full bg-gradient-to-r ${ARCHETYPE_COLORS[name]}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Uncertainty indicator */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Profile Certainty</span>
          <span className={`font-medium ${uncertainty < 0.5 ? 'text-green-600' : uncertainty < 0.7 ? 'text-amber-600' : 'text-red-500'}`}>
            {uncertainty < 0.5 ? 'High' : uncertainty < 0.7 ? 'Moderate' : 'Low (Blend)'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Based on gap between top archetype probabilities
        </p>
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ArchetypeProbabilities, BlendProfile } from '@/types/assessment';
import { getArchetypeDescription, getBlendModeExplanation, getSwitcherExplanation } from '@/lib/archetypes';

interface ArchetypeCardProps {
  archetypes: ArchetypeProbabilities;
  blendProfile: BlendProfile;
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

const MODE_BADGES: Record<BlendProfile['mode'], { label: string; color: string }> = {
  'fusion': { label: '50/50 Fusion', color: 'bg-purple-100 text-purple-800' },
  'anchor-lens': { label: 'Anchor–Lens', color: 'bg-blue-100 text-blue-800' },
  'inverse-anchor-lens': { label: 'Inverse A–L', color: 'bg-teal-100 text-teal-800' },
  'diffuse': { label: 'Diffuse', color: 'bg-gray-100 text-gray-800' },
};

export default function ArchetypeCard({ archetypes, blendProfile }: ArchetypeCardProps) {
  const sorted = Object.entries(archetypes)
    .sort(([, a], [, b]) => b - a)
    .map(([name, probability]) => ({
      name: name as keyof ArchetypeProbabilities,
      probability,
    }));

  const { mode, anchor, lens, label, description, isTrueDyad, pairStrength, blendRatio, switcherBehavior } = blendProfile;
  const modeBadge = MODE_BADGES[mode];
  const switcherExplanation = getSwitcherExplanation(switcherBehavior);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      {/* Header with blend mode badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Archetype Profile</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${modeBadge.color}`}>
          {modeBadge.label}
        </span>
      </div>

      {/* Blend Label - the main result */}
      <div className={`bg-gradient-to-r ${ARCHETYPE_COLORS[anchor]} rounded-xl p-4 text-white mb-4`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex -space-x-2">
            <span className="text-3xl">{ARCHETYPE_ICONS[anchor]}</span>
            {mode === 'fusion' && (
              <span className="text-3xl">{ARCHETYPE_ICONS[lens]}</span>
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold">{label}</h4>
            <p className="text-sm opacity-90">
              {mode === 'fusion'
                ? `${Math.round(blendRatio * 100)}/${Math.round((1 - blendRatio) * 100)} balance`
                : `${Math.round(blendProfile.anchorProbability * 100)}% anchor / ${Math.round(blendProfile.lensProbability * 100)}% lens`
              }
            </p>
          </div>
        </div>
        <p className="text-sm opacity-90">{description}</p>
      </div>

      {/* Anchor-Lens explanation */}
      {mode !== 'diffuse' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[anchor]} bg-opacity-10`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{ARCHETYPE_ICONS[anchor]}</span>
              <span className="text-sm font-semibold text-gray-800 capitalize">
                {mode === 'fusion' ? anchor : 'Anchor'}
              </span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{anchor}</p>
            <p className="text-xs text-gray-500 mt-1">
              {mode === 'fusion' ? 'Co-driver' : 'What you return to under load'}
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[lens]} bg-opacity-10`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{ARCHETYPE_ICONS[lens]}</span>
              <span className="text-sm font-semibold text-gray-800 capitalize">
                {mode === 'fusion' ? lens : 'Lens'}
              </span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{lens}</p>
            <p className="text-xs text-gray-500 mt-1">
              {mode === 'fusion' ? 'Co-driver' : 'Always on, shaping expression'}
            </p>
          </div>
        </div>
      )}

      {/* Switcher behavior for Fusion profiles */}
      {mode === 'fusion' && switcherExplanation && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-indigo-800">
            <span className="font-semibold">Stress Response:</span> {switcherExplanation}
          </p>
        </div>
      )}

      {/* Dyad strength indicator */}
      {!isTrueDyad && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Diffuse Profile:</span> Your top two archetypes account for only {Math.round(pairStrength * 100)}% of your profile. Consider the top 3 for a fuller picture.
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
                <span className="capitalize font-medium text-gray-700">
                  {name}
                  {name === anchor && mode !== 'diffuse' && (
                    <span className="ml-1 text-xs text-gray-400">
                      {mode === 'fusion' ? '(co)' : '(anchor)'}
                    </span>
                  )}
                  {name === lens && mode !== 'diffuse' && mode !== 'fusion' && (
                    <span className="ml-1 text-xs text-gray-400">(lens)</span>
                  )}
                  {name === lens && mode === 'fusion' && (
                    <span className="ml-1 text-xs text-gray-400">(co)</span>
                  )}
                </span>
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

      {/* Mode explanation */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          <span className="font-medium">What is {modeBadge.label}?</span> {getBlendModeExplanation(mode)}
        </p>
      </div>
    </motion.div>
  );
}

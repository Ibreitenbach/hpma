'use client';

import { motion } from 'framer-motion';
import {
  ArchetypeProbabilities,
  BlendProfile,
  RosterOutput,
  ShapeClass,
  DyadBlendClass,
  TriadClass,
  ArchetypeName,
} from '@/types/assessment';
import { getShapeClassDescription, getBlendClassLabel, getTriadClassLabel } from '@/lib/roster';

interface ArchetypeCardProps {
  archetypes: ArchetypeProbabilities;
  blendProfile: BlendProfile;
  roster: RosterOutput;
}

const ARCHETYPE_COLORS: Record<ArchetypeName, string> = {
  explorer: 'from-purple-500 to-indigo-500',
  organizer: 'from-blue-500 to-cyan-500',
  connector: 'from-emerald-500 to-teal-500',
  protector: 'from-amber-500 to-orange-500',
  performer: 'from-pink-500 to-rose-500',
  philosopher: 'from-violet-500 to-purple-500',
};

const ARCHETYPE_ICONS: Record<ArchetypeName, string> = {
  explorer: '🧭',
  organizer: '📐',
  connector: '🤝',
  protector: '🛡️',
  performer: '🎭',
  philosopher: '💭',
};

const SHAPE_BADGES: Record<ShapeClass, { label: string; color: string }> = {
  monophonic: { label: 'Monophonic', color: 'bg-indigo-100 text-indigo-800' },
  dyadic: { label: 'Dyadic', color: 'bg-purple-100 text-purple-800' },
  triadic: { label: 'Triadic', color: 'bg-teal-100 text-teal-800' },
  polyphonic: { label: 'Polyphonic', color: 'bg-amber-100 text-amber-800' },
  diffuse: { label: 'Diffuse', color: 'bg-gray-100 text-gray-700' },
};

const CONFIDENCE_COLORS = {
  HIGH: 'text-emerald-600',
  MEDIUM: 'text-amber-600',
  LOW: 'text-red-500',
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ArchetypeCard({ archetypes, blendProfile, roster }: ArchetypeCardProps) {
  const { shape_class, sorted_probs, metrics, confidence, summary_label, dyad, triad, polyphonic } = roster;
  const shapeBadge = SHAPE_BADGES[shape_class];
  const primaryArchetype = sorted_probs[0].name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      {/* Header with shape class badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Archetype Profile</h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${shapeBadge.color}`}>
            {shapeBadge.label}
          </span>
          <span className={`text-xs font-medium ${CONFIDENCE_COLORS[confidence.shape_conf]}`}>
            {confidence.shape_conf}
          </span>
        </div>
      </div>

      {/* Main Summary Label */}
      <div className={`bg-gradient-to-r ${ARCHETYPE_COLORS[primaryArchetype]} rounded-xl p-4 text-white mb-4`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex -space-x-1">
            {shape_class === 'monophonic' && (
              <span className="text-3xl">{ARCHETYPE_ICONS[primaryArchetype]}</span>
            )}
            {shape_class === 'dyadic' && dyad && (
              <>
                <span className="text-3xl">{ARCHETYPE_ICONS[dyad.anchor]}</span>
                <span className="text-2xl opacity-80">{ARCHETYPE_ICONS[dyad.lens]}</span>
              </>
            )}
            {shape_class === 'triadic' && triad && (
              <>
                <span className="text-3xl">{ARCHETYPE_ICONS[triad.primary]}</span>
                <span className="text-2xl opacity-80">{ARCHETYPE_ICONS[triad.secondary]}</span>
                <span className="text-xl opacity-60">{ARCHETYPE_ICONS[triad.tertiary]}</span>
              </>
            )}
            {(shape_class === 'polyphonic' || shape_class === 'diffuse') && (
              <span className="text-3xl">🎵</span>
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold">{summary_label}</h4>
            <p className="text-sm opacity-90">
              {shape_class === 'dyadic' && dyad && getBlendClassLabel(dyad.blend_class)}
              {shape_class === 'triadic' && triad && getTriadClassLabel(triad.triad_class)}
              {shape_class === 'monophonic' && `${(sorted_probs[0].probability * 100).toFixed(0)}% dominant`}
              {(shape_class === 'polyphonic' || shape_class === 'diffuse') &&
                `${polyphonic?.contributing.length ?? sorted_probs.filter(s => s.probability >= 0.12).length} active archetypes`}
            </p>
          </div>
        </div>
        <p className="text-sm opacity-90">
          {shape_class === 'dyadic' && dyad?.description}
          {shape_class === 'triadic' && triad?.description}
          {shape_class === 'monophonic' && getShapeClassDescription('monophonic')}
          {shape_class === 'polyphonic' && polyphonic?.description}
          {shape_class === 'diffuse' && getShapeClassDescription('diffuse')}
        </p>
      </div>

      {/* Shape-specific detail cards */}
      {shape_class === 'dyadic' && dyad && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[dyad.anchor]} bg-opacity-10`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{ARCHETYPE_ICONS[dyad.anchor]}</span>
              <span className="text-sm font-semibold text-gray-800">Anchor</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{dyad.anchor}</p>
            <p className="text-xs text-gray-500 mt-1">
              {(sorted_probs.find(s => s.name === dyad.anchor)?.probability ?? 0 * 100).toFixed(1)}%
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[dyad.lens]} bg-opacity-10`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{ARCHETYPE_ICONS[dyad.lens]}</span>
              <span className="text-sm font-semibold text-gray-800">Lens</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{dyad.lens}</p>
            <p className="text-xs text-gray-500 mt-1">
              {(sorted_probs.find(s => s.name === dyad.lens)?.probability ?? 0 * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {shape_class === 'triadic' && triad && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[triad.primary]} bg-opacity-10`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">{ARCHETYPE_ICONS[triad.primary]}</span>
              <span className="text-xs font-semibold text-gray-700">Primary</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{triad.primary}</p>
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[triad.secondary]} bg-opacity-10`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">{ARCHETYPE_ICONS[triad.secondary]}</span>
              <span className="text-xs font-semibold text-gray-700">Secondary</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{triad.secondary}</p>
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[triad.tertiary]} bg-opacity-10`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">{ARCHETYPE_ICONS[triad.tertiary]}</span>
              <span className="text-xs font-semibold text-gray-700">Tertiary</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{triad.tertiary}</p>
          </div>
        </div>
      )}

      {shape_class === 'polyphonic' && polyphonic && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Active Archetypes:</span>{' '}
            {polyphonic.contributing.map(a => capitalize(a)).join(', ')}
          </p>
        </div>
      )}

      {/* Confidence notes */}
      {confidence.notes.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600">
            {confidence.notes.map((note, i) => (
              <span key={i} className="block">{note}</span>
            ))}
          </p>
        </div>
      )}

      {/* All probabilities */}
      <div className="space-y-2">
        {sorted_probs.map(({ name, probability }, index) => (
          <div key={name} className="flex items-center gap-3">
            <span className="text-lg">{ARCHETYPE_ICONS[name]}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize font-medium text-gray-700">
                  {name}
                  {shape_class === 'dyadic' && dyad && name === dyad.anchor && (
                    <span className="ml-1 text-xs text-gray-400">(anchor)</span>
                  )}
                  {shape_class === 'dyadic' && dyad && name === dyad.lens && (
                    <span className="ml-1 text-xs text-gray-400">(lens)</span>
                  )}
                  {shape_class === 'triadic' && triad && name === triad.primary && (
                    <span className="ml-1 text-xs text-gray-400">(1st)</span>
                  )}
                  {shape_class === 'triadic' && triad && name === triad.secondary && (
                    <span className="ml-1 text-xs text-gray-400">(2nd)</span>
                  )}
                  {shape_class === 'triadic' && triad && name === triad.tertiary && (
                    <span className="ml-1 text-xs text-gray-400">(3rd)</span>
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

      {/* Metrics summary */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">S2:</span> {(metrics.S2 * 100).toFixed(1)}%
          </div>
          <div>
            <span className="font-medium">r2:</span> {(metrics.r2 * 100).toFixed(1)}%
          </div>
          <div>
            <span className="font-medium">Entropy:</span> {(metrics.entropy_n * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Shape class explanation */}
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-gray-500">
          <span className="font-medium">What is {shapeBadge.label}?</span> {getShapeClassDescription(shape_class)}
        </p>
      </div>

      {/* Version badge */}
      <div className="mt-3 text-right">
        <span className="text-[10px] text-gray-400">{roster.version}</span>
      </div>
    </motion.div>
  );
}

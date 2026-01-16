'use client';

import { motion } from 'framer-motion';
import {
  ArchetypeProbabilities,
  BlendProfile,
  RosterOutput,
  Structure,
  DuetMode,
  TrioMode,
  ArchetypeName,
} from '@/types/assessment';
import { getStructureDescription, getDuetModeLabelPublic, getTrioModeLabelPublic } from '@/lib/roster';

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

const STRUCTURE_BADGES: Record<Structure, { label: string; color: string }> = {
  SOLO: { label: 'Solo', color: 'bg-indigo-100 text-indigo-800' },
  DUET: { label: 'Duet', color: 'bg-purple-100 text-purple-800' },
  TRIO: { label: 'Trio', color: 'bg-teal-100 text-teal-800' },
  CHORD: { label: 'Chord', color: 'bg-amber-100 text-amber-800' },
  CHORUS: { label: 'Chorus', color: 'bg-orange-100 text-orange-800' },
  MIST: { label: 'Mist', color: 'bg-gray-100 text-gray-700' },
  FAULTED: { label: 'Faulted', color: 'bg-red-100 text-red-700' },
};

const CONFIDENCE_COLORS = {
  HIGH: 'text-emerald-600',
  MEDIUM: 'text-amber-600',
  LOW: 'text-red-500',
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRoleLabel(structure: Structure, position: 'anchor' | 'lens' | 'secondary' | 'tertiary'): string {
  if (structure === 'DUET') {
    return position === 'anchor' ? 'Anchor' : 'Lens';
  }
  if (structure === 'TRIO') {
    switch (position) {
      case 'anchor': return 'Keystone';
      case 'lens':
      case 'secondary': return 'Lens';
      case 'tertiary': return 'Shadow';
    }
  }
  return capitalize(position);
}

export default function ArchetypeCard({ archetypes, blendProfile, roster }: ArchetypeCardProps) {
  const { structure, sorted_probs, metrics, confidence, summary_label, duet, trio, choral } = roster;
  const structureBadge = STRUCTURE_BADGES[structure];
  const primaryArchetype = sorted_probs[0].name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      {/* Header with structure badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Archetype Profile</h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${structureBadge.color}`}>
            {structureBadge.label}
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
            {structure === 'SOLO' && (
              <span className="text-3xl">{ARCHETYPE_ICONS[primaryArchetype]}</span>
            )}
            {structure === 'DUET' && duet && (
              <>
                <span className="text-3xl">{ARCHETYPE_ICONS[duet.anchor]}</span>
                <span className="text-2xl opacity-80">{ARCHETYPE_ICONS[duet.lens]}</span>
              </>
            )}
            {structure === 'TRIO' && trio && (
              <>
                <span className="text-3xl">{ARCHETYPE_ICONS[trio.primary]}</span>
                <span className="text-2xl opacity-80">{ARCHETYPE_ICONS[trio.secondary]}</span>
                <span className="text-xl opacity-60">{ARCHETYPE_ICONS[trio.tertiary]}</span>
              </>
            )}
            {(structure === 'CHORD' || structure === 'CHORUS' || structure === 'MIST') && (
              <span className="text-3xl">🎵</span>
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold">{summary_label}</h4>
            <p className="text-sm opacity-90">
              {structure === 'DUET' && duet && getDuetModeLabelPublic(duet.mode)}
              {structure === 'TRIO' && trio && getTrioModeLabelPublic(trio.mode)}
              {structure === 'SOLO' && `${(sorted_probs[0].probability * 100).toFixed(0)}% dominant`}
              {(structure === 'CHORD' || structure === 'CHORUS') && choral &&
                `${choral.contributing.length} active voices`}
              {structure === 'MIST' && 'No clear dominance'}
            </p>
          </div>
        </div>
        <p className="text-sm opacity-90">
          {structure === 'DUET' && duet?.description}
          {structure === 'TRIO' && trio?.description}
          {structure === 'SOLO' && getStructureDescription('SOLO')}
          {(structure === 'CHORD' || structure === 'CHORUS') && choral?.description}
          {structure === 'MIST' && getStructureDescription('MIST')}
        </p>
      </div>

      {/* Structure-specific detail cards */}
      {structure === 'DUET' && duet && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[duet.anchor]} bg-opacity-10`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{ARCHETYPE_ICONS[duet.anchor]}</span>
              <span className="text-sm font-semibold text-gray-800">Anchor</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{duet.anchor}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((sorted_probs.find(s => s.name === duet.anchor)?.probability ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[duet.lens]} bg-opacity-10`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{ARCHETYPE_ICONS[duet.lens]}</span>
              <span className="text-sm font-semibold text-gray-800">
                {duet.mode === 'SIGNATURE_ACCENT' ? 'Accent' : 'Lens'}
              </span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{duet.lens}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((sorted_probs.find(s => s.name === duet.lens)?.probability ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {structure === 'TRIO' && trio && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[trio.primary]} bg-opacity-10`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">{ARCHETYPE_ICONS[trio.primary]}</span>
              <span className="text-xs font-semibold text-gray-700">Keystone</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{trio.primary}</p>
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[trio.secondary]} bg-opacity-10`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">{ARCHETYPE_ICONS[trio.secondary]}</span>
              <span className="text-xs font-semibold text-gray-700">Lens</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{trio.secondary}</p>
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${ARCHETYPE_COLORS[trio.tertiary]} bg-opacity-10`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">{ARCHETYPE_ICONS[trio.tertiary]}</span>
              <span className="text-xs font-semibold text-gray-700">
                {trio.mode === 'KEYSTONE_PRISM' ? 'Lens' : 'Shadow'}
              </span>
            </div>
            <p className="text-xs text-gray-600 capitalize">{trio.tertiary}</p>
          </div>
        </div>
      )}

      {(structure === 'CHORD' || structure === 'CHORUS') && choral && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Active Voices:</span>{' '}
            {choral.contributing.map(a => capitalize(a)).join(', ')}
          </p>
        </div>
      )}

      {/* Dyad Identity highlight for Duets */}
      {structure === 'DUET' && duet && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-indigo-800">
            <span className="font-semibold">Identity:</span> {duet.identity}
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
                  {structure === 'DUET' && duet && name === duet.anchor && (
                    <span className="ml-1 text-xs text-gray-400">(anchor)</span>
                  )}
                  {structure === 'DUET' && duet && name === duet.lens && (
                    <span className="ml-1 text-xs text-gray-400">
                      ({duet.mode === 'SIGNATURE_ACCENT' ? 'accent' : 'lens'})
                    </span>
                  )}
                  {structure === 'TRIO' && trio && name === trio.primary && (
                    <span className="ml-1 text-xs text-gray-400">(keystone)</span>
                  )}
                  {structure === 'TRIO' && trio && name === trio.secondary && (
                    <span className="ml-1 text-xs text-gray-400">(lens)</span>
                  )}
                  {structure === 'TRIO' && trio && name === trio.tertiary && (
                    <span className="ml-1 text-xs text-gray-400">
                      ({trio.mode === 'KEYSTONE_PRISM' ? 'lens' : 'shadow'})
                    </span>
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

      {/* Structure explanation */}
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-gray-500">
          <span className="font-medium">What is {structureBadge.label}?</span> {getStructureDescription(structure)}
        </p>
      </div>

      {/* Version badge */}
      <div className="mt-3 text-right">
        <span className="text-[10px] text-gray-400">{roster.version}</span>
      </div>
    </motion.div>
  );
}

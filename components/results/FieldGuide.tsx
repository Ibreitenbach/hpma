'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AssessmentResult } from '@/types/assessment';
import { FieldGuideReport, CompatibilityMatch } from '@/lib/fieldguide/types';
import { generateFieldGuide, loadContent } from '@/lib/fieldguide';

interface FieldGuideProps {
  result: AssessmentResult;
}

export default function FieldGuide({ result }: FieldGuideProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['strengths', 'watchouts', 'career'])
  );

  // Generate the field guide report client-side
  const { report, error } = useMemo(() => {
    try {
      const content = loadContent();
      const fieldGuideReport = generateFieldGuide(result, content);
      return { report: fieldGuideReport, error: null };
    } catch (err) {
      console.error('Field Guide generation error:', err);
      return { report: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [result]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  if (error || !report) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-8 shadow-lg"
      >
        <div className="text-amber-600">
          Field Guide generation unavailable: {error || 'No report generated'}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold">{report.identity_name}</h2>
        <p className="text-indigo-100 mt-1 italic">{report.identity_tagline}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {report.structure_label}
          </span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {report.mode_name}
          </span>
          {report.mode_ratio && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {report.mode_ratio}
            </span>
          )}
        </div>
      </div>

      {/* Roles */}
      {Object.keys(report.roles).length > 0 && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h3 className="text-sm font-semibold text-indigo-800 mb-2">Your Voices</h3>
          <div className="flex flex-wrap gap-3">
            {report.roles.anchor && (
              <VoiceChip label="Anchor" value={report.roles.anchor.archetype} color="indigo" />
            )}
            {report.roles.keystone && (
              <VoiceChip label="Keystone" value={report.roles.keystone.archetype} color="purple" />
            )}
            {report.roles.lens && (
              <VoiceChip label="Lens" value={report.roles.lens.archetype} color="cyan" />
            )}
            {report.roles.shadow && (
              <VoiceChip label="Shadow" value={report.roles.shadow.archetype} color="gray" />
            )}
            {report.roles.voices?.map((v, i) => (
              <VoiceChip key={i} label="Voice" value={v.archetype} color="pink" />
            ))}
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="divide-y divide-gray-100">
        <ContentSection
          title="Strengths"
          sectionKey="strengths"
          expanded={expandedSections.has('strengths')}
          onToggle={() => toggleSection('strengths')}
          icon="✨"
        >
          <BulletList items={report.domains.strengths.bullets} />
          <NotesList items={report.domains.strengths.notes} />
          {report.domains.strengths.evidence.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Evidence: {report.domains.strengths.evidence.join(' • ')}
            </div>
          )}
        </ContentSection>

        <ContentSection
          title="Watch For"
          sectionKey="watchouts"
          expanded={expandedSections.has('watchouts')}
          onToggle={() => toggleSection('watchouts')}
          icon="⚠️"
        >
          <BulletList items={report.domains.watchouts.bullets} />
          {report.domains.watchouts.telltales.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-semibold text-amber-700">Telltale Signs:</span>
              <ul className="mt-1 space-y-1">
                {report.domains.watchouts.telltales.map((t, i) => (
                  <li key={i} className="text-sm text-amber-700 italic pl-3">• {t}</li>
                ))}
              </ul>
            </div>
          )}
          <NotesList items={report.domains.watchouts.notes} />
        </ContentSection>

        <ContentSection
          title="Career"
          sectionKey="career"
          expanded={expandedSections.has('career')}
          onToggle={() => toggleSection('career')}
          icon="💼"
        >
          {report.domains.career.best_environments.length > 0 && (
            <SubSection title="Best Environments">
              <BulletList items={report.domains.career.best_environments} />
            </SubSection>
          )}
          {report.domains.career.role_patterns.length > 0 && (
            <SubSection title="Role Patterns">
              <BulletList items={report.domains.career.role_patterns} />
            </SubSection>
          )}
          {report.domains.career.anti_patterns.length > 0 && (
            <SubSection title="Avoid">
              <BulletList items={report.domains.career.anti_patterns} className="text-amber-700" />
            </SubSection>
          )}
          <NotesList items={report.domains.career.notes} />
        </ContentSection>

        <ContentSection
          title="Money"
          sectionKey="money"
          expanded={expandedSections.has('money')}
          onToggle={() => toggleSection('money')}
          icon="💰"
        >
          {report.domains.money.style.length > 0 && (
            <SubSection title="Style">
              <BulletList items={report.domains.money.style} />
            </SubSection>
          )}
          {report.domains.money.risks.length > 0 && (
            <SubSection title="Risks">
              <BulletList items={report.domains.money.risks} className="text-amber-700" />
            </SubSection>
          )}
          {report.domains.money.guardrails.length > 0 && (
            <SubSection title="Guardrails">
              <BulletList items={report.domains.money.guardrails} className="text-green-700" />
            </SubSection>
          )}
          <NotesList items={report.domains.money.notes} />
        </ContentSection>

        <ContentSection
          title="Relationships"
          sectionKey="relationships"
          expanded={expandedSections.has('relationships')}
          onToggle={() => toggleSection('relationships')}
          icon="❤️"
        >
          {report.domains.relationships.offers.length > 0 && (
            <SubSection title="You Offer">
              <BulletList items={report.domains.relationships.offers} />
            </SubSection>
          )}
          {report.domains.relationships.needs.length > 0 && (
            <SubSection title="You Need">
              <BulletList items={report.domains.relationships.needs} />
            </SubSection>
          )}
          {report.domains.relationships.triggers.length > 0 && (
            <SubSection title="Triggers">
              <BulletList items={report.domains.relationships.triggers} className="text-amber-700" />
            </SubSection>
          )}
          {report.domains.relationships.repair.length > 0 && (
            <SubSection title="Repair">
              <BulletList items={report.domains.relationships.repair} className="text-green-700" />
            </SubSection>
          )}
          <NotesList items={report.domains.relationships.notes} />
        </ContentSection>

        <ContentSection
          title="Parenting"
          sectionKey="parenting"
          expanded={expandedSections.has('parenting')}
          onToggle={() => toggleSection('parenting')}
          icon="👶"
        >
          {report.domains.parenting.strengths.length > 0 && (
            <SubSection title="Strengths">
              <BulletList items={report.domains.parenting.strengths} />
            </SubSection>
          )}
          {report.domains.parenting.traps.length > 0 && (
            <SubSection title="Traps">
              <BulletList items={report.domains.parenting.traps} className="text-amber-700" />
            </SubSection>
          )}
          <div className="grid grid-cols-2 gap-4 mt-2">
            {report.domains.parenting.do_more.length > 0 && (
              <SubSection title="Do More">
                <BulletList items={report.domains.parenting.do_more} className="text-green-700" />
              </SubSection>
            )}
            {report.domains.parenting.do_less.length > 0 && (
              <SubSection title="Do Less">
                <BulletList items={report.domains.parenting.do_less} className="text-amber-700" />
              </SubSection>
            )}
          </div>
          <NotesList items={report.domains.parenting.notes} />
        </ContentSection>

        <ContentSection
          title="Hobbies & Recharge"
          sectionKey="hobbies"
          expanded={expandedSections.has('hobbies')}
          onToggle={() => toggleSection('hobbies')}
          icon="🎮"
        >
          {report.domains.hobbies.recharge.length > 0 && (
            <SubSection title="Recharge">
              <BulletList items={report.domains.hobbies.recharge} />
            </SubSection>
          )}
          {report.domains.hobbies.play.length > 0 && (
            <SubSection title="Play">
              <BulletList items={report.domains.hobbies.play} />
            </SubSection>
          )}
          {report.domains.hobbies.warning_signs.length > 0 && (
            <SubSection title="Warning Signs">
              <BulletList items={report.domains.hobbies.warning_signs} className="text-amber-700" />
            </SubSection>
          )}
          <NotesList items={report.domains.hobbies.notes} />
        </ContentSection>

        <ContentSection
          title="Self-Improvement"
          sectionKey="self_improvement"
          expanded={expandedSections.has('self_improvement')}
          onToggle={() => toggleSection('self_improvement')}
          icon="🎯"
        >
          {report.domains.self_improvement.leverage.length > 0 && (
            <SubSection title="Leverage Points">
              <BulletList items={report.domains.self_improvement.leverage} />
            </SubSection>
          )}
          {report.domains.self_improvement.keystone_constraints.length > 0 && (
            <SubSection title="Keystone Constraints">
              <BulletList items={report.domains.self_improvement.keystone_constraints} />
            </SubSection>
          )}
          {report.domains.self_improvement.if_then_rules.length > 0 && (
            <SubSection title="If-Then Rules">
              <BulletList items={report.domains.self_improvement.if_then_rules} className="font-mono text-sm" />
            </SubSection>
          )}
          {report.domains.self_improvement.growth_edges.length > 0 && (
            <SubSection title="Growth Edges">
              <BulletList items={report.domains.self_improvement.growth_edges} />
            </SubSection>
          )}
          <NotesList items={report.domains.self_improvement.notes} />
        </ContentSection>

        <ContentSection
          title="Compatibility"
          sectionKey="compatibility"
          expanded={expandedSections.has('compatibility')}
          onToggle={() => toggleSection('compatibility')}
          icon="🤝"
        >
          {report.domains.compatibility.complimentary.length > 0 && (
            <SubSection title="Complementary Matches">
              <CompatibilityList items={report.domains.compatibility.complimentary} type="good" />
            </SubSection>
          )}
          {report.domains.compatibility.friction.length > 0 && (
            <SubSection title="Friction Points">
              <CompatibilityList items={report.domains.compatibility.friction} type="friction" />
            </SubSection>
          )}
          {report.domains.compatibility.conflict.length > 0 && (
            <SubSection title="Potential Conflicts">
              <CompatibilityList items={report.domains.compatibility.conflict} type="conflict" />
            </SubSection>
          )}
          {report.domains.compatibility.general_notes.length > 0 && (
            <div className="mt-3 space-y-1">
              {report.domains.compatibility.general_notes.map((note, i) => (
                <p key={i} className="text-sm text-gray-600 italic">{note}</p>
              ))}
            </div>
          )}
        </ContentSection>

        {/* Validity notes */}
        {report.domains.validity?.notes && report.domains.validity.notes.length > 0 && (
          <ContentSection
            title="Validity Notes"
            sectionKey="validity"
            expanded={expandedSections.has('validity')}
            onToggle={() => toggleSection('validity')}
            icon="📊"
          >
            <div className="bg-amber-50 p-3 rounded-lg">
              {report.domains.validity.notes.map((note, i) => (
                <p key={i} className="text-sm text-amber-800">{note}</p>
              ))}
            </div>
          </ContentSection>
        )}
      </div>

      {/* Trace footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
        <details>
          <summary className="cursor-pointer hover:text-gray-600">Glass-Box Trace</summary>
          <div className="mt-2 space-y-1">
            <p><strong>Flags:</strong> {report.trace.flags.join(', ') || 'none'}</p>
            <p><strong>Rules Matched:</strong> {report.trace.matched_rules.length}</p>
            <p><strong>Blocks:</strong> {report.trace.selected_blocks.join(', ')}</p>
          </div>
        </details>
      </div>
    </motion.div>
  );
}

// Helper components
function VoiceChip({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    cyan: 'bg-cyan-100 text-cyan-800',
    gray: 'bg-gray-100 text-gray-800',
    pink: 'bg-pink-100 text-pink-800',
  };

  return (
    <span className={`px-2 py-1 rounded-lg text-sm ${colorClasses[color] || colorClasses.gray}`}>
      <span className="font-medium">{label}:</span> {value}
    </span>
  );
}

function ContentSection({
  title,
  sectionKey,
  expanded,
  onToggle,
  icon,
  children,
}: {
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: () => void;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-medium text-gray-800">{title}</span>
        </div>
        <span className="text-gray-400 text-lg">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 pb-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</h4>
      {children}
    </div>
  );
}

function BulletList({ items, className = '' }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={`space-y-1 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400">
          {item}
        </li>
      ))}
    </ul>
  );
}

function NotesList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 space-y-1 pl-3 border-l-2 border-indigo-200">
      {items.map((note, i) => (
        <p key={i} className="text-sm text-indigo-700">{note}</p>
      ))}
    </div>
  );
}

function CompatibilityList({ items, type }: { items: CompatibilityMatch[]; type: 'good' | 'friction' | 'conflict' }) {
  if (items.length === 0) return null;

  const colorClasses = {
    good: 'text-green-700',
    friction: 'text-amber-700',
    conflict: 'text-red-700',
  };

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-sm">
          <span className={`font-medium ${colorClasses[type]}`}>{item.match}</span>
          <span className="text-gray-600"> — {item.why}</span>
        </li>
      ))}
    </ul>
  );
}

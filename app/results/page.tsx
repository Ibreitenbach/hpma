'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AssessmentResult } from '@/types/assessment';
import { getValidityMessage, hasValidityIssues } from '@/lib/validity';
import RadarChart from '@/components/results/RadarChart';
import BarChart from '@/components/results/BarChart';
import TraitHelix from '@/components/results/TraitHelix';
import Hypergraph from '@/components/results/Hypergraph';
import ArchetypeCard from '@/components/results/ArchetypeCard';
import ExportButtons from '@/components/results/ExportButtons';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('hpma-result');
    if (!stored) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(stored) as AssessmentResult;
      setResult(parsed);
    } catch {
      router.push('/');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-gray-500">Loading results...</div>
      </div>
    );
  }

  const validityMessage = getValidityMessage(result.validity);
  const durationMinutes = Math.round(result.durationMs / 60000);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your HPMA Results</h1>
          <p className="text-gray-600">
            Completed in {durationMinutes} minute{durationMinutes !== 1 ? 's' : ''} •{' '}
            {new Date(result.completedAt).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Validity warning */}
        {hasValidityIssues(result.validity) && validityMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-8 max-w-3xl mx-auto"
          >
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Validity Notice</h3>
                <p className="text-sm text-amber-700">{validityMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left column: Radar + Archetypes */}
          <div className="space-y-6">
            <RadarChart data={result.hexaco} width={380} height={380} />
            <ArchetypeCard
              archetypes={result.archetypes}
              uncertainty={result.archetypeUncertainty}
            />
          </div>

          {/* Middle column: Bar charts */}
          <div className="space-y-6">
            <BarChart
              data={result.motives}
              title="Motivational Drivers"
              colorScheme="cyan"
              width={380}
              height={280}
            />
            <BarChart
              data={result.affects}
              title="Affective Systems"
              colorScheme="pink"
              width={380}
              height={320}
            />
          </div>

          {/* Right column: Summary stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Summary</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-indigo-600 mb-2">HEXACO Traits</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(result.hexaco).map(([trait, value]) => (
                      <div key={trait} className="flex justify-between">
                        <span className="text-gray-600">{trait}</span>
                        <span className="font-medium">{value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-cyan-600 mb-2">Top Motives</h4>
                  <div className="text-sm">
                    {Object.entries(result.motives)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(([motive, value]) => (
                        <div key={motive} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{motive}</span>
                          <span className="font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-pink-600 mb-2">Dominant Affects</h4>
                  <div className="text-sm">
                    {Object.entries(result.affects)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(([affect, value]) => (
                        <div key={affect} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{affect}</span>
                          <span className="font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Interpretation guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <h4 className="font-medium text-gray-800 mb-2">Score Interpretation</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>1-2.5:</strong> Low — rarely expressed</p>
                <p><strong>2.5-4:</strong> Below average</p>
                <p><strong>4-4.5:</strong> Average</p>
                <p><strong>4.5-5.5:</strong> Above average</p>
                <p><strong>5.5-7:</strong> High — frequently expressed</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Full-width visualizations */}
        <div className="space-y-6 mb-8">
          <TraitHelix
            hexaco={result.hexaco}
            motives={result.motives}
            affects={result.affects}
            width={1100}
            height={350}
          />

          <Hypergraph
            hexaco={result.hexaco}
            motives={result.motives}
            affects={result.affects}
            width={1100}
            height={500}
          />
        </div>

        {/* Export buttons */}
        <ExportButtons result={result} />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-sm text-gray-400"
        >
          <p>HPMA v0.9 — Research prototype. Results are for exploration, not clinical diagnosis.</p>
          <p className="mt-1">All data processed locally. Nothing sent to any server.</p>
        </motion.footer>
      </div>
    </main>
  );
}

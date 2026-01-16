'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Hybrid Personality Matrix
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Assessment v0.9 (Pilot)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            What This Assessment Measures
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-indigo-50 rounded-xl">
              <h3 className="font-semibold text-indigo-900 mb-2">
                Trait Structure
              </h3>
              <p className="text-sm text-indigo-700">
                HEXACO model: Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness
              </p>
              <p className="text-xs text-indigo-500 mt-2">48 items</p>
            </div>

            <div className="p-4 bg-cyan-50 rounded-xl">
              <h3 className="font-semibold text-cyan-900 mb-2">
                Motivational Drivers
              </h3>
              <p className="text-sm text-cyan-700">
                Security, Belonging, Status, Mastery, Autonomy, Purpose
              </p>
              <p className="text-xs text-cyan-500 mt-2">30 items</p>
            </div>

            <div className="p-4 bg-pink-50 rounded-xl">
              <h3 className="font-semibold text-pink-900 mb-2">
                Affective Systems
              </h3>
              <p className="text-sm text-pink-700">
                Seeking, Fear, Anger, Care, Grief, Play, Desire
              </p>
              <p className="text-xs text-pink-500 mt-2">28 items</p>
            </div>
          </div>

          <div className="border-t pt-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-3">
              Probabilistic Archetype Mapping
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Explorer', 'Organizer', 'Connector', 'Protector', 'Performer', 'Philosopher'].map(type => (
                <span key={type} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {type}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Instead of rigid categories, you&apos;ll receive probability distributions showing your blend of archetypes.
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-8">
            <h4 className="font-medium text-amber-800 mb-2">Before You Begin</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Use the 1-7 scale for each statement</li>
              <li>• Answer based on your typical behavior over the past 6-12 months</li>
              <li>• Don&apos;t overthink — your first honest answer is usually best</li>
              <li>• The assessment takes approximately 15-20 minutes</li>
              <li>• Progress is auto-saved; you can resume if interrupted</li>
            </ul>
          </div>

          <div className="text-center">
            <Link href="/assessment">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
              >
                Begin Assessment
              </motion.button>
            </Link>
            <p className="text-xs text-gray-400 mt-4">
              112 items • ~15 minutes • All data stays on your device
            </p>
          </div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm text-gray-400"
        >
          <p>HPMA v0.9 — Research prototype. Not clinically validated.</p>
        </motion.footer>
      </div>
    </main>
  );
}

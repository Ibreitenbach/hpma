'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Question, QuestionV2 } from '@/types/assessment';
import LikertScale from './LikertScale';

type QuestionType = Question | QuestionV2;
type DomainType = QuestionType['domain'];

interface QuestionCardProps {
  question: QuestionType;
  response: number | undefined;
  onResponse: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLast: boolean;
  onComplete: () => void;
  contextStem?: string;
}

function getDomainLabel(domain: DomainType): string {
  const labels: Record<string, string> = {
    H: 'Honesty-Humility',
    E: 'Emotionality',
    X: 'Extraversion',
    A: 'Agreeableness',
    C: 'Conscientiousness',
    O: 'Openness',
    motive: 'Motivational Driver',
    affect: 'Affective System',
    validity: 'Response Check',
    attachment: 'Attachment Style',
    antagonism: 'Interpersonal Style',
  };
  return labels[domain] || domain;
}

function getDomainColor(domain: DomainType): string {
  const colors: Record<string, string> = {
    H: 'bg-amber-100 text-amber-800',
    E: 'bg-rose-100 text-rose-800',
    X: 'bg-orange-100 text-orange-800',
    A: 'bg-emerald-100 text-emerald-800',
    C: 'bg-blue-100 text-blue-800',
    O: 'bg-purple-100 text-purple-800',
    motive: 'bg-cyan-100 text-cyan-800',
    affect: 'bg-pink-100 text-pink-800',
    validity: 'bg-gray-100 text-gray-800',
    attachment: 'bg-teal-100 text-teal-800',
    antagonism: 'bg-red-100 text-red-800',
  };
  return colors[domain] || 'bg-gray-100 text-gray-800';
}

export default function QuestionCard({
  question,
  response,
  onResponse,
  onNext,
  onPrev,
  canGoBack,
  canGoForward,
  isLast,
  onComplete,
  contextStem,
}: QuestionCardProps) {
  const handleSubmit = () => {
    if (response !== undefined) {
      if (isLast) {
        onComplete();
      } else {
        onNext();
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Domain badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDomainColor(question.domain)}`}>
              {getDomainLabel(question.domain)}
            </span>
            {question.subdomain !== 'normal' && question.subdomain !== 'idealized' && question.subdomain !== 'attentiveness' && question.subdomain !== 'random' && (
              <span className="text-xs text-gray-400">
                {question.subdomain}
              </span>
            )}
          </div>

          {/* Question text with optional context stem */}
          <h2 className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">
            {contextStem && (
              <span className="text-indigo-600 font-semibold">{contextStem} </span>
            )}
            {question.text}
          </h2>

          {/* Likert scale */}
          <LikertScale
            value={response}
            onChange={onResponse}
            onSubmit={handleSubmit}
          />

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onPrev}
              disabled={!canGoBack}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canGoBack
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              ← Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={response === undefined}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                response !== undefined
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLast ? 'Complete Assessment' : 'Next →'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

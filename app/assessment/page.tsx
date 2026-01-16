'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AssessmentProvider, useAssessment } from '@/components/assessment/AssessmentProvider';
import QuestionCard from '@/components/assessment/QuestionCard';
import ProgressBar from '@/components/assessment/ProgressBar';
import { questions } from '@/lib/questions';
import { computeFullProfile } from '@/lib/scoring';
import { computeArchetypeProbabilities, computeBlendProfile } from '@/lib/archetypes';
import { checkValidity } from '@/lib/validity';
import { AssessmentResult } from '@/types/assessment';

function AssessmentContent() {
  const router = useRouter();
  const {
    state,
    currentQuestion,
    progress,
    answeredCount,
    setResponse,
    nextQuestion,
    prevQuestion,
    complete,
  } = useAssessment();

  useEffect(() => {
    if (state.isComplete) {
      // Compute results
      const { hexaco, motives, affects } = computeFullProfile(state.responses);
      const { archetypes, uncertainty } = computeArchetypeProbabilities({ hexaco, motives, affects });
      const blendProfile = computeBlendProfile(archetypes, { hexaco, motives, affects });
      const validity = checkValidity(state.responses);

      const result: AssessmentResult = {
        responses: state.responses,
        hexaco,
        motives,
        affects,
        archetypes,
        archetypeUncertainty: uncertainty,
        blendProfile,
        validity,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - state.startTime,
      };

      // Store result and navigate
      sessionStorage.setItem('hpma-result', JSON.stringify(result));
      router.push('/results');
    }
  }, [state.isComplete, state.responses, state.startTime, router]);

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  const isLast = state.currentIndex === questions.length - 1;
  const allAnswered = answeredCount === questions.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ProgressBar
            current={state.currentIndex}
            total={questions.length}
            answeredCount={answeredCount}
          />
        </motion.div>

        <QuestionCard
          question={currentQuestion}
          response={state.responses[currentQuestion.id]}
          onResponse={(value) => setResponse(currentQuestion.id, value)}
          onNext={nextQuestion}
          onPrev={prevQuestion}
          canGoBack={state.currentIndex > 0}
          canGoForward={state.responses[currentQuestion.id] !== undefined}
          isLast={isLast && allAnswered}
          onComplete={complete}
        />

        {isLast && !allAnswered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-amber-600 bg-amber-50 p-4 rounded-xl"
          >
            You&apos;ve reached the last question, but {questions.length - answeredCount} items remain unanswered.
            Please go back and complete all questions to finish the assessment.
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to restart? All progress will be lost.')) {
                localStorage.removeItem('hpma-assessment-state');
                window.location.reload();
              }
            }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Restart Assessment
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AssessmentPage() {
  return (
    <AssessmentProvider>
      <AssessmentContent />
    </AssessmentProvider>
  );
}

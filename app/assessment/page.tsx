'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AssessmentProvider, useAssessment, AssessmentPhase } from '@/components/assessment/AssessmentProvider';
import QuestionCard from '@/components/assessment/QuestionCard';
import ProgressBar from '@/components/assessment/ProgressBar';
import ContextTransition from '@/components/assessment/ContextTransition';
import { ALL_QUESTIONS_V2, BASELINE_QUESTIONS_V2 } from '@/lib/questions-v2';
import { computeFullProfile } from '@/lib/scoring';
import { computeArchetypeProbabilities, computeBlendProfile } from '@/lib/archetypes';
import { computeRoster } from '@/lib/roster';
import { checkValidity } from '@/lib/validity';
import { computeAttachment, computeAntagonism, computeFacetProfile, computeContextDependence } from '@/lib/scoring-v2';
import { computeClassName } from '@/lib/class-name';
import { AssessmentResultV2, ContextType, HEXACOFacet } from '@/types/assessment';

function AssessmentContent() {
  const router = useRouter();
  const {
    state,
    currentQuestion,
    progress,
    answeredCount,
    phase,
    contextType,
    contextStem,
    baselineCount,
    phaseProgress,
    isTransitionPoint,
    setResponse,
    nextQuestion,
    prevQuestion,
    complete,
  } = useAssessment();

  // Track whether we're showing a transition screen
  const [showTransition, setShowTransition] = useState(false);
  const [transitionToPhase, setTransitionToPhase] = useState<ContextType | null>(null);

  // Detect phase transitions
  useEffect(() => {
    // When finishing baseline, show transition to first context
    if (phase === 'BASELINE' && isTransitionPoint) {
      setTransitionToPhase('WORK');
      setShowTransition(true);
    }
    // When moving between context phases, show transition
    else if (phase === 'CONTEXT_WORK' && phaseProgress.current === phaseProgress.total &&
             state.responses[currentQuestion?.id ?? -1] !== undefined) {
      setTransitionToPhase('STRESS');
      setShowTransition(true);
    }
    else if (phase === 'CONTEXT_STRESS' && phaseProgress.current === phaseProgress.total &&
             state.responses[currentQuestion?.id ?? -1] !== undefined) {
      setTransitionToPhase('INTIMACY');
      setShowTransition(true);
    }
    else if (phase === 'CONTEXT_INTIMACY' && phaseProgress.current === phaseProgress.total &&
             state.responses[currentQuestion?.id ?? -1] !== undefined) {
      setTransitionToPhase('PUBLIC');
      setShowTransition(true);
    }
  }, [phase, isTransitionPoint, phaseProgress, state.responses, currentQuestion?.id]);

  useEffect(() => {
    if (state.isComplete) {
      // Separate baseline and context responses
      type SituationalContext = Exclude<ContextType, 'BASELINE'>;
      const baselineResponses: Record<number, number> = {};
      const contextResponses: Record<SituationalContext, Record<number, number>> = {
        WORK: {},
        STRESS: {},
        INTIMACY: {},
        PUBLIC: {},
      };

      // Baseline items: IDs 1-140
      // Context items: IDs 1001-1024 (WORK), 2001-2024 (STRESS), 3001-3024 (INTIMACY), 4001-4024 (PUBLIC)
      Object.entries(state.responses).forEach(([idStr, value]) => {
        const id = parseInt(idStr, 10);
        if (id <= 140) {
          baselineResponses[id] = value;
        } else if (id >= 1001 && id <= 1024) {
          contextResponses.WORK[id] = value;
        } else if (id >= 2001 && id <= 2024) {
          contextResponses.STRESS[id] = value;
        } else if (id >= 3001 && id <= 3024) {
          contextResponses.INTIMACY[id] = value;
        } else if (id >= 4001 && id <= 4024) {
          contextResponses.PUBLIC[id] = value;
        }
      });

      // Compute core results from baseline responses
      const { hexaco, motives, affects } = computeFullProfile(baselineResponses);
      const { archetypes, uncertainty } = computeArchetypeProbabilities({ hexaco, motives, affects });
      const blendProfile = computeBlendProfile(archetypes, { hexaco, motives, affects });
      const roster = computeRoster(archetypes);
      const validity = checkValidity(baselineResponses);

      // Compute v2 module scores
      const facetProfile = computeFacetProfile(baselineResponses);
      const attachment = computeAttachment(baselineResponses);
      const antagonism = computeAntagonism(baselineResponses);

      // Compute real context dependence if context sections were completed
      const hasContextData = Object.values(contextResponses).some(ctx => Object.keys(ctx).length > 0);
      const contextDependence = hasContextData
        ? computeContextDependence(baselineResponses, contextResponses)
        : {
            contexts: {
              WORK: { context: 'WORK' as SituationalContext, deltas: [], topShifts: [], shiftPattern: 'STABLE' as const },
              STRESS: { context: 'STRESS' as SituationalContext, deltas: [], topShifts: [], shiftPattern: 'STABLE' as const },
              INTIMACY: { context: 'INTIMACY' as SituationalContext, deltas: [], topShifts: [], shiftPattern: 'STABLE' as const },
              PUBLIC: { context: 'PUBLIC' as SituationalContext, deltas: [], topShifts: [], shiftPattern: 'STABLE' as const },
            },
            overallVolatility: 0,
            mostContextDependentFacets: [] as HEXACOFacet[],
            mostStableFacets: [] as HEXACOFacet[],
          };

      // Generate class name from epithets
      const className = computeClassName(
        { facetProfile, motives, affects, attachment, antagonism },
        roster
      );

      const result: AssessmentResultV2 = {
        version: 'HPMA-2.0',
        responses: baselineResponses,
        contextResponses,
        hexaco,
        motives,
        affects,
        archetypes,
        archetypeUncertainty: uncertainty,
        blendProfile,
        roster,
        validity,
        attachment,
        antagonism,
        contextDependence,
        facetProfile,
        className,
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

  const totalQuestions = ALL_QUESTIONS_V2.length;
  const isLast = state.currentIndex === totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;

  // Handle transition screen
  const handleContinueFromTransition = () => {
    setShowTransition(false);
    nextQuestion();
  };

  const handleSkipContext = () => {
    // Skip to completion by marking all as done
    setShowTransition(false);
    complete();
  };

  // Show transition screen between phases
  if (showTransition && transitionToPhase) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
        <ContextTransition
          fromPhase={phase === 'BASELINE' ? 'BASELINE' : contextType ?? 'BASELINE'}
          toPhase={transitionToPhase}
          onContinue={handleContinueFromTransition}
          onSkip={phase === 'BASELINE' ? handleSkipContext : undefined}
        />
      </main>
    );
  }

  // Phase indicator for context sections
  const phaseLabel = phase === 'BASELINE'
    ? `Baseline: ${phaseProgress.current}/${phaseProgress.total}`
    : contextType
      ? `${contextType}: ${phaseProgress.current}/${phaseProgress.total}`
      : '';

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
            total={totalQuestions}
            answeredCount={answeredCount}
          />
          {/* Phase indicator */}
          <div className="text-center mt-2 text-sm text-gray-500">
            {phaseLabel}
          </div>
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
          contextStem={contextStem}
        />

        {isLast && !allAnswered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-amber-600 bg-amber-50 p-4 rounded-xl"
          >
            You&apos;ve reached the last question, but {totalQuestions - answeredCount} items remain unanswered.
            Please go back and complete all questions to finish the assessment.
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to restart? All progress will be lost.')) {
                localStorage.removeItem('hpma-assessment-state-v2');
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

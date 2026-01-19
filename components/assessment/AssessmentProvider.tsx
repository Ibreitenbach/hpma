'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { AssessmentState, AssessmentAction, ContextType } from '@/types/assessment';
import {
  BASELINE_QUESTIONS_V2,
  CONTEXT_QUESTIONS_V2,
  ALL_QUESTIONS_V2,
  CONTEXT_STEMS,
  ID_RANGES,
} from '@/lib/questions-v2';

const STORAGE_KEY = 'hpma-assessment-state-v2';

// Assessment phases
export type AssessmentPhase = 'BASELINE' | 'TRANSITION' | 'CONTEXT_WORK' | 'CONTEXT_STRESS' | 'CONTEXT_INTIMACY' | 'CONTEXT_PUBLIC' | 'COMPLETE';

// Get phase from current index
function getPhaseFromIndex(index: number): AssessmentPhase {
  const baselineCount = BASELINE_QUESTIONS_V2.length; // 140
  const contextPerPhase = 24;

  if (index < baselineCount) return 'BASELINE';

  const contextIndex = index - baselineCount;
  if (contextIndex < contextPerPhase) return 'CONTEXT_WORK';
  if (contextIndex < contextPerPhase * 2) return 'CONTEXT_STRESS';
  if (contextIndex < contextPerPhase * 3) return 'CONTEXT_INTIMACY';
  return 'CONTEXT_PUBLIC';
}

// Get context type from phase
function getContextFromPhase(phase: AssessmentPhase): ContextType | null {
  switch (phase) {
    case 'CONTEXT_WORK': return 'WORK';
    case 'CONTEXT_STRESS': return 'STRESS';
    case 'CONTEXT_INTIMACY': return 'INTIMACY';
    case 'CONTEXT_PUBLIC': return 'PUBLIC';
    default: return null;
  }
}

const initialState: AssessmentState = {
  currentIndex: 0,
  responses: {},
  startTime: Date.now(),
  isComplete: false,
};

function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case 'SET_RESPONSE':
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.questionId]: action.value,
        },
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, ALL_QUESTIONS_V2.length - 1),
      };
    case 'PREV_QUESTION':
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      };
    case 'GO_TO_QUESTION':
      return {
        ...state,
        currentIndex: Math.max(0, Math.min(action.index, ALL_QUESTIONS_V2.length - 1)),
      };
    case 'COMPLETE':
      return {
        ...state,
        isComplete: true,
      };
    case 'RESET':
      return {
        ...initialState,
        startTime: Date.now(),
      };
    case 'RESTORE':
      return {
        ...state,
        ...action.state,
      };
    default:
      return state;
  }
}

interface AssessmentContextValue {
  state: AssessmentState;
  dispatch: React.Dispatch<AssessmentAction>;
  currentQuestion: typeof ALL_QUESTIONS_V2[0] | undefined;
  progress: number;
  answeredCount: number;
  phase: AssessmentPhase;
  contextType: ContextType | null;
  contextStem: string;
  baselineCount: number;
  contextCount: number;
  phaseProgress: { current: number; total: number };
  isTransitionPoint: boolean;
  setResponse: (questionId: number, value: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  complete: () => void;
  skipToContext: () => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.isComplete) {
          dispatch({ type: 'RESTORE', state: parsed });
        }
      } catch {
        // Invalid saved state, ignore
      }
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (!state.isComplete) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  const baselineCount = BASELINE_QUESTIONS_V2.length;
  const contextCount = CONTEXT_QUESTIONS_V2.length;
  const totalCount = ALL_QUESTIONS_V2.length;

  const currentQuestion = ALL_QUESTIONS_V2[state.currentIndex];
  const progress = ((state.currentIndex + 1) / totalCount) * 100;
  const answeredCount = Object.keys(state.responses).length;

  // Phase tracking
  const phase = useMemo(() => getPhaseFromIndex(state.currentIndex), [state.currentIndex]);
  const contextType = useMemo(() => getContextFromPhase(phase), [phase]);
  const contextStem = contextType ? CONTEXT_STEMS[contextType] : '';

  // Check if we're at a transition point (end of baseline, about to start context)
  const isTransitionPoint = state.currentIndex === baselineCount - 1 &&
    state.responses[currentQuestion?.id] !== undefined;

  // Phase-specific progress
  const phaseProgress = useMemo(() => {
    if (phase === 'BASELINE') {
      return { current: state.currentIndex + 1, total: baselineCount };
    }
    const contextIndex = state.currentIndex - baselineCount;
    const phaseIndex = contextIndex % 24;
    return { current: phaseIndex + 1, total: 24 };
  }, [phase, state.currentIndex, baselineCount]);

  const setResponse = useCallback((questionId: number, value: number) => {
    dispatch({ type: 'SET_RESPONSE', questionId, value });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const prevQuestion = useCallback(() => {
    dispatch({ type: 'PREV_QUESTION' });
  }, []);

  const complete = useCallback(() => {
    dispatch({ type: 'COMPLETE' });
  }, []);

  const skipToContext = useCallback(() => {
    dispatch({ type: 'GO_TO_QUESTION', index: baselineCount });
  }, [baselineCount]);

  return (
    <AssessmentContext.Provider
      value={{
        state,
        dispatch,
        currentQuestion,
        progress,
        answeredCount,
        phase,
        contextType,
        contextStem,
        baselineCount,
        contextCount,
        phaseProgress,
        isTransitionPoint,
        setResponse,
        nextQuestion,
        prevQuestion,
        complete,
        skipToContext,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
}

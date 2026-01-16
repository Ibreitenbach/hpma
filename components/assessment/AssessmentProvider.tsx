'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AssessmentState, AssessmentAction } from '@/types/assessment';
import { questions } from '@/lib/questions';

const STORAGE_KEY = 'hpma-assessment-state';

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
        currentIndex: Math.min(state.currentIndex + 1, questions.length - 1),
      };
    case 'PREV_QUESTION':
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      };
    case 'GO_TO_QUESTION':
      return {
        ...state,
        currentIndex: Math.max(0, Math.min(action.index, questions.length - 1)),
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
  currentQuestion: typeof questions[0] | undefined;
  progress: number;
  answeredCount: number;
  setResponse: (questionId: number, value: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  complete: () => void;
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

  const currentQuestion = questions[state.currentIndex];
  const progress = ((state.currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(state.responses).length;

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

  return (
    <AssessmentContext.Provider
      value={{
        state,
        dispatch,
        currentQuestion,
        progress,
        answeredCount,
        setResponse,
        nextQuestion,
        prevQuestion,
        complete,
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

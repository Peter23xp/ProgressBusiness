import { create } from 'zustand';

export type TutorialStepType = 'welcome' | 'spotlight' | 'tooltip' | 'action' | 'completion';

export interface TutorialStep {
  id: string;
  sectionId: string;
  sectionLabel: string;
  type: TutorialStepType;
  targetId?: string;
  targetRoute?: string;
  title: string;
  description: string;
  tip?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  nextLabel?: string;
  canSkip?: boolean;
  requiresOnline?: boolean;
}

interface TutorialState {
  isActive: boolean;
  isCompleted: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  highlightedElementId: string | null;
  showWelcomeModal: boolean;
  showCompletionModal: boolean;
  showResumeDialog: boolean;
  showQuitDialog: boolean;
  savedStepIndex: number;

  start: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  quit: () => void;
  complete: () => void;
  restart: () => void;
  setHighlightedElement: (id: string | null) => void;
  loadSteps: (steps: TutorialStep[], savedIndex?: number) => void;
  setShowWelcomeModal: (show: boolean) => void;
  setShowCompletionModal: (show: boolean) => void;
  setShowResumeDialog: (show: boolean) => void;
  setShowQuitDialog: (show: boolean) => void;
}

export const useTutorialStore = create<TutorialState>()((set, get) => ({
  isActive: false,
  isCompleted: false,
  currentStepIndex: 0,
  steps: [],
  highlightedElementId: null,
  showWelcomeModal: false,
  showCompletionModal: false,
  showResumeDialog: false,
  showQuitDialog: false,
  savedStepIndex: 0,

  loadSteps: (steps, savedIndex = 0) =>
    set({ steps, savedStepIndex: Math.min(savedIndex, Math.max(0, steps.length - 1)) }),

  start: () => {
    const { steps } = get();
    set({
      isActive: true,
      currentStepIndex: 0,
      showWelcomeModal: false,
      highlightedElementId: steps[0]?.targetId ?? null,
    });
  },

  resume: () => {
    const { savedStepIndex } = get();
    set({ isActive: true, currentStepIndex: savedStepIndex, showResumeDialog: false });
  },

  next: () => {
    const { currentStepIndex, steps } = get();
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= steps.length) {
      set({ showCompletionModal: true, isActive: false });
    } else {
      const nextStep = steps[nextIndex];
      set({
        currentStepIndex: nextIndex,
        highlightedElementId: nextStep.targetId ?? null,
      });
    }
  },

  previous: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex <= 0) return;
    const prevIndex = currentStepIndex - 1;
    const prevStep = steps[prevIndex];
    set({
      currentStepIndex: prevIndex,
      highlightedElementId: prevStep.targetId ?? null,
    });
  },

  quit: () =>
    set({ isActive: false, showQuitDialog: false, highlightedElementId: null }),

  complete: () =>
    set({ isActive: false, isCompleted: true, showCompletionModal: false, highlightedElementId: null }),

  restart: () =>
    set({
      isActive: false,
      isCompleted: false,
      currentStepIndex: 0,
      savedStepIndex: 0,
      highlightedElementId: null,
      showWelcomeModal: true,
      showCompletionModal: false,
      showResumeDialog: false,
    }),

  setHighlightedElement: (id) => set({ highlightedElementId: id }),
  setShowWelcomeModal: (show) => set({ showWelcomeModal: show }),
  setShowCompletionModal: (show) => set({ showCompletionModal: show }),
  setShowResumeDialog: (show) => set({ showResumeDialog: show }),
  setShowQuitDialog: (show) => set({ showQuitDialog: show }),
}));

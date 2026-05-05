// frontend/src/hooks/useTutorial.ts
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTutorialStore } from '@/store/tutorial.store';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { getCachedData, cacheData } from '@/lib/offline';
import { getTutorialStepsForRole } from '@/components/tutorial/steps/superadmin.steps';
import { api } from '@/lib/api';

export interface TutorialProgress {
  userId: string;
  role: string;
  currentStepIndex: number;
  completedStepIds: string[];
  isCompleted: boolean;
  startedAt: string;
  lastSeenAt: string;
}

function tutorialKey(userId: string) {
  return `tutorial:progress:${userId}`;
}

export function useTutorial() {
  const store = useTutorialStore();
  const { user } = useAuthStore();
  const { isOnline } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const initializedRef = useRef(false);

  // ── Initialize on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      const saved = await getCachedData<TutorialProgress>(tutorialKey(user.id));
      const progress = saved?.data;

      if (progress?.isCompleted) {
        useTutorialStore.setState({ isCompleted: true });
        return;
      }

      const steps = getTutorialStepsForRole(user.role);
      store.loadSteps(steps, progress?.currentStepIndex ?? 0);

      if (progress && progress.currentStepIndex > 0) {
        useTutorialStore.setState({ showResumeDialog: true });
      } else {
        useTutorialStore.setState({ showWelcomeModal: true });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Auto-navigate to targetRoute ─────────────────────────────────
  useEffect(() => {
    if (!store.isActive) return;
    const currentStep = store.steps[store.currentStepIndex];
    if (currentStep?.targetRoute && location.pathname !== currentStep.targetRoute) {
      navigate(currentStep.targetRoute);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentStepIndex, store.isActive]);

  // ── Scroll to targetId ───────────────────────────────────────────
  useEffect(() => {
    if (!store.isActive) return;
    const currentStep = store.steps[store.currentStepIndex];
    if (currentStep?.targetId) {
      const el = document.querySelector(`[data-tutorial="${currentStep.targetId}"]`);
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el?.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth', block: 'center' });
      store.setHighlightedElement(currentStep.targetId);
    } else {
      store.setHighlightedElement(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentStepIndex, store.isActive]);

  // ── Persist progress to idb ──────────────────────────────────────
  useEffect(() => {
    if (!store.isActive || !user) return;
    const currentStep = store.steps[store.currentStepIndex];
    if (!currentStep) return;
    const progress: TutorialProgress = {
      userId: user.id,
      role: user.role,
      currentStepIndex: store.currentStepIndex,
      completedStepIds: store.steps.slice(0, store.currentStepIndex).map((s) => s.id),
      isCompleted: false,
      startedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    cacheData(tutorialKey(user.id), progress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentStepIndex, store.isActive]);

  // ── complete() — PATCH API + idb ────────────────────────────────
  async function complete() {
    if (!user) return;
    store.complete();
    const progress: TutorialProgress = {
      userId: user.id,
      role: user.role,
      currentStepIndex: store.steps.length - 1,
      completedStepIds: store.steps.map((s) => s.id),
      isCompleted: true,
      startedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    await cacheData(tutorialKey(user.id), progress);
    if (isOnline) {
      try {
        await api.patch('/users/me/tutorial', { tutorialCompleted: true });
      } catch {
        // silently ignore — idb is source of truth
      }
    }
  }

  // ── restart() — reset idb + PATCH false + navigate ───────────────
  async function restart() {
    if (!user) return;
    const steps = getTutorialStepsForRole(user.role);
    store.loadSteps(steps, 0);
    store.restart();
    await cacheData(tutorialKey(user.id), {
      userId: user.id,
      role: user.role,
      currentStepIndex: 0,
      completedStepIds: [],
      isCompleted: false,
      startedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    } as TutorialProgress);
    if (isOnline) {
      try {
        await api.patch('/users/me/tutorial', { tutorialCompleted: false });
      } catch {
        // silently ignore
      }
    }
    navigate('/dashboard');
  }

  // ── ignoreForever() — mark completed in idb only (no API) ────────
  async function ignoreForever() {
    if (!user) return;
    useTutorialStore.setState({ isCompleted: true, showResumeDialog: false });
    await cacheData(tutorialKey(user.id), {
      userId: user.id,
      role: user.role,
      currentStepIndex: 0,
      completedStepIds: [],
      isCompleted: true,
      startedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    } as TutorialProgress);
  }

  const currentStep = store.steps[store.currentStepIndex];

  return {
    isActive: store.isActive,
    isCompleted: store.isCompleted,
    currentStep,
    currentIndex: store.currentStepIndex,
    totalSteps: store.steps.length,
    progress: store.steps.length > 0 ? store.currentStepIndex / store.steps.length : 0,
    next: store.next,
    previous: store.previous,
    quit: store.quit,
    restart,
    complete,
    ignoreForever,
    goToStep: (index: number) => {
      const step = store.steps[index];
      if (!step) return;
      useTutorialStore.setState({
        currentStepIndex: index,
        highlightedElementId: step.targetId ?? null,
      });
    },
    // Dialog visibility
    showWelcomeModal: store.showWelcomeModal,
    showCompletionModal: store.showCompletionModal,
    showResumeDialog: store.showResumeDialog,
    showQuitDialog: store.showQuitDialog,
    savedStepIndex: store.savedStepIndex,
    setShowQuitDialog: store.setShowQuitDialog,
    // store actions
    start: store.start,
    resume: store.resume,
    setShowWelcomeModal: store.setShowWelcomeModal,
    setShowResumeDialog: store.setShowResumeDialog,
  };
}

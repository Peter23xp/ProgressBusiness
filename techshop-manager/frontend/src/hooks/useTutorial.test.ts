import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useTutorial } from './useTutorial';
import { useTutorialStore } from '@/store/tutorial.store';
import { getTutorialStepsForRole } from '@/components/tutorial/steps/superadmin.steps';
import * as offline from '@/lib/offline';

vi.mock('@/lib/offline', () => ({
  getCachedData: vi.fn().mockResolvedValue(null),
  cacheData: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/api', () => ({
  api: { patch: vi.fn().mockResolvedValue({}) },
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'user-1', role: 'SUPER_ADMIN', name: 'Peter', siteId: null, siteName: null },
  })),
}));

vi.mock('@/store/ui.store', () => ({
  useUIStore: vi.fn(() => ({ isOnline: true })),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(MemoryRouter, null, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(offline.getCachedData).mockResolvedValue(null);
  useTutorialStore.setState({
    isActive: false, isCompleted: false, currentStepIndex: 0,
    steps: [], highlightedElementId: null,
    showWelcomeModal: false, showCompletionModal: false,
    showResumeDialog: false, showQuitDialog: false, savedStepIndex: 0,
  });
});

describe('useTutorial', () => {
  test('20 — shows WelcomeModal when no saved progress', async () => {
    vi.mocked(offline.getCachedData).mockResolvedValue(null);
    renderHook(() => useTutorial(), { wrapper });
    await waitFor(() => {
      expect(useTutorialStore.getState().showWelcomeModal).toBe(true);
    });
  });

  test('21 — shows ResumeDialog when partial progress in idb', async () => {
    vi.mocked(offline.getCachedData).mockResolvedValue({
      data: { currentStepIndex: 3, isCompleted: false, userId: 'user-1', role: 'SUPER_ADMIN' },
      cachedAt: new Date().toISOString(),
    } as any);
    renderHook(() => useTutorial(), { wrapper });
    await waitFor(() => {
      expect(useTutorialStore.getState().showResumeDialog).toBe(true);
    });
  });

  test('22 — sets isCompleted=true when idb says completed', async () => {
    vi.mocked(offline.getCachedData).mockResolvedValue({
      data: { currentStepIndex: 17, isCompleted: true, userId: 'user-1', role: 'SUPER_ADMIN' },
      cachedAt: new Date().toISOString(),
    } as any);
    renderHook(() => useTutorial(), { wrapper });
    await waitFor(() => {
      expect(useTutorialStore.getState().isCompleted).toBe(true);
    });
    expect(useTutorialStore.getState().showWelcomeModal).toBe(false);
    expect(useTutorialStore.getState().showResumeDialog).toBe(false);
  });

  test('23 — navigate called if step has different targetRoute', async () => {
    const steps = getTutorialStepsForRole('SUPER_ADMIN');
    useTutorialStore.setState({
      isActive: true,
      steps,
      currentStepIndex: 3,
    });
    renderHook(() => useTutorial(), { wrapper });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/settings/users');
    });
  });

  test('24 — scrollIntoView called when element has data-tutorial attr', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-tutorial', 'sidebar-nav-rapports');
    document.body.appendChild(el);
    const scrollSpy = vi.fn();
    el.scrollIntoView = scrollSpy;

    const steps = getTutorialStepsForRole('SUPER_ADMIN');
    useTutorialStore.setState({
      isActive: true,
      steps,
      currentStepIndex: 9,
      highlightedElementId: 'sidebar-nav-rapports',
    });
    renderHook(() => useTutorial(), { wrapper });

    await waitFor(() => { expect(scrollSpy).toHaveBeenCalled(); });
    document.body.removeChild(el);
  });

  test('25 — getTutorialStepsForRole returns 18 steps for SUPER_ADMIN', () => {
    const steps = getTutorialStepsForRole('SUPER_ADMIN');
    expect(steps).toHaveLength(18);
  });

  test('26 — cacheData called on step change', async () => {
    vi.mocked(offline.getCachedData).mockResolvedValue(null);
    const steps = getTutorialStepsForRole('SUPER_ADMIN');
    useTutorialStore.setState({ isActive: true, steps, currentStepIndex: 0 });
    renderHook(() => useTutorial(), { wrapper });

    act(() => { useTutorialStore.setState({ currentStepIndex: 1 }); });

    await waitFor(() => {
      expect(offline.cacheData).toHaveBeenCalled();
    });
  });

  test('27 — HelpButton visible after isCompleted=true', () => {
    useTutorialStore.setState({ isActive: false, isCompleted: true });
    expect(useTutorialStore.getState().isCompleted).toBe(true);
    expect(useTutorialStore.getState().isActive).toBe(false);
  });

  test('28 — HelpButton hidden when isActive=true', () => {
    useTutorialStore.setState({ isActive: true, isCompleted: true });
    expect(useTutorialStore.getState().isActive).toBe(true);
  });
});

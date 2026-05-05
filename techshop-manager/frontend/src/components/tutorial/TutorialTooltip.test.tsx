import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TutorialTooltip } from './TutorialTooltip';
import { TutorialProvider } from './TutorialProvider';
import { useTutorialStore } from '@/store/tutorial.store';
import type { TutorialStep } from '@/store/tutorial.store';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

vi.mock('@/lib/offline', () => ({
  getCachedData: vi.fn().mockResolvedValue(null),
  cacheData: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/api', () => ({
  api: { patch: vi.fn().mockResolvedValue({}) },
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'u1', role: 'SUPER_ADMIN', name: 'Peter', siteId: null, siteName: null },
  })),
}));

vi.mock('@/store/ui.store', () => ({
  useUIStore: vi.fn(() => ({ isOnline: true })),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useLocation: () => ({ pathname: '/dashboard' }) };
});

const MOCK_STEPS: TutorialStep[] = [
  { id: 'step-0', sectionId: 's1', sectionLabel: 'Section 1', type: 'spotlight', title: 'Titre 0', description: 'Desc 0', tip: 'Conseil 0' },
  { id: 'step-1', sectionId: 's1', sectionLabel: 'Section 1', type: 'tooltip', title: 'Titre 1', description: 'Desc 1' },
  { id: 'step-2', sectionId: 's2', sectionLabel: 'Section 2', type: 'tooltip', title: 'Dernière', description: 'Desc 2', nextLabel: 'Terminer ✓' },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter><TutorialProvider>{children}</TutorialProvider></MemoryRouter>;
}

beforeEach(() => {
  useTutorialStore.setState({
    isActive: false, isCompleted: false, currentStepIndex: 0,
    steps: [], highlightedElementId: null,
    showWelcomeModal: false, showCompletionModal: false,
    showResumeDialog: false, showQuitDialog: false, savedStepIndex: 0,
  });
});

describe('TutorialTooltip', () => {
  test('8 — not rendered when isActive=false', () => {
    useTutorialStore.setState({ isActive: false, steps: MOCK_STEPS });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('9 — title and description displayed', () => {
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 0 });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    expect(screen.getByText('Titre 0')).toBeInTheDocument();
    expect(screen.getByText('Desc 0')).toBeInTheDocument();
  });

  test('10 — tip displayed when defined, absent when not', () => {
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 0 });
    const { rerender } = render(<Wrapper><TutorialTooltip /></Wrapper>);
    expect(screen.getByText(/Conseil 0/)).toBeInTheDocument();

    useTutorialStore.setState({ currentStepIndex: 1 });
    rerender(<Wrapper><TutorialTooltip /></Wrapper>);
    expect(screen.queryByText(/💡/)).toBeNull();
  });

  test('11 — Précédent button absent at step 0', () => {
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 0 });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    expect(screen.queryByLabelText('Étape précédente')).toBeNull();
  });

  test('12 — "Terminer ✓" shown at last step', () => {
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 2 });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    expect(screen.getByText('Terminer ✓')).toBeInTheDocument();
  });

  test('13 — click Suivant calls store.next()', () => {
    const nextSpy = vi.fn();
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 0, next: nextSpy });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    fireEvent.click(screen.getByLabelText('Étape suivante'));
    expect(nextSpy).toHaveBeenCalled();
  });

  test('14 — click Précédent calls store.previous()', () => {
    const prevSpy = vi.fn();
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 1, previous: prevSpy });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    fireEvent.click(screen.getByLabelText('Étape précédente'));
    expect(prevSpy).toHaveBeenCalled();
  });

  test('15 — click ✕ opens quit dialog', () => {
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 0 });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    fireEvent.click(screen.getByLabelText('Quitter le tutoriel'));
    expect(useTutorialStore.getState().showQuitDialog).toBe(true);
  });

  test('16 — ArrowRight key advances step', () => {
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 0 });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(useTutorialStore.getState().currentStepIndex).toBe(1);
  });

  test('17 — ArrowLeft key goes to previous step', () => {
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 1 });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(useTutorialStore.getState().currentStepIndex).toBe(0);
  });

  test('18 — Escape key opens quit dialog', () => {
    useTutorialStore.setState({ isActive: true, steps: MOCK_STEPS, currentStepIndex: 0 });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(useTutorialStore.getState().showQuitDialog).toBe(true);
  });

  test('19 — component renders with auto placement (sidebar element)', () => {
    const el = document.createElement('div');
    el.setAttribute('data-tutorial', 'sidebar-test');
    document.body.appendChild(el);
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 200, width: 180, height: 32,
      right: 190, bottom: 232, x: 10, y: 200, toJSON: () => ({}),
    } as DOMRect);

    useTutorialStore.setState({
      isActive: true,
      steps: [{ ...MOCK_STEPS[0], targetId: 'sidebar-test', placement: 'auto' }],
      currentStepIndex: 0, highlightedElementId: 'sidebar-test',
    });
    render(<Wrapper><TutorialTooltip /></Wrapper>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    document.body.removeChild(el);
  });
});

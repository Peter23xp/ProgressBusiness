import { render, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TutorialOverlay } from './TutorialOverlay';
import { useTutorialStore } from '@/store/tutorial.store';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

function setState(patch: Partial<ReturnType<typeof useTutorialStore.getState>>) {
  useTutorialStore.setState(patch);
}

beforeEach(() => {
  useTutorialStore.setState({ isActive: false, highlightedElementId: null });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('TutorialOverlay', () => {
  test('1 — not rendered when isActive=false', () => {
    const { container } = render(<TutorialOverlay />);
    expect(container.firstChild).toBeNull();
  });

  test('2 — rendered when isActive=true', () => {
    setState({ isActive: true, highlightedElementId: null });
    const { container } = render(<TutorialOverlay />);
    expect(container.firstChild).not.toBeNull();
  });

  test('3 — getBoundingClientRect called when element found', () => {
    const el = document.createElement('div');
    el.setAttribute('data-tutorial', 'test-element');
    document.body.appendChild(el);
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 50, width: 200, height: 40,
      right: 300, bottom: 90, x: 100, y: 50, toJSON: () => ({}),
    } as DOMRect);

    setState({ isActive: true, highlightedElementId: 'test-element' });
    render(<TutorialOverlay />);

    expect(el.getBoundingClientRect).toHaveBeenCalled();
    document.body.removeChild(el);
  });

  test('4 — retries and warns when element not found after 5 attempts', async () => {
    vi.useFakeTimers();
    setState({ isActive: true, highlightedElementId: 'nonexistent-element' });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<TutorialOverlay />);

    for (let i = 0; i < 6; i++) {
      await act(async () => { vi.advanceTimersByTime(500); });
    }

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('nonexistent-element'),
    );
    warnSpy.mockRestore();
  });

  test('5 — element is findable via querySelector', () => {
    const el = document.createElement('div');
    el.setAttribute('data-tutorial', 'scroll-test');
    document.body.appendChild(el);

    setState({ isActive: true, highlightedElementId: 'scroll-test' });
    render(<TutorialOverlay />);

    expect(document.querySelector('[data-tutorial="scroll-test"]')).toBe(el);
    document.body.removeChild(el);
  });

  test('6 — ResizeObserver set up on target element', () => {
    const observeSpy = vi.fn();
    vi.stubGlobal('ResizeObserver', vi.fn(() => ({
      observe: observeSpy,
      disconnect: vi.fn(),
    })));

    const el = document.createElement('div');
    el.setAttribute('data-tutorial', 'resize-test');
    document.body.appendChild(el);

    setState({ isActive: true, highlightedElementId: 'resize-test' });
    render(<TutorialOverlay />);

    expect(observeSpy).toHaveBeenCalledWith(el);
    document.body.removeChild(el);
    vi.unstubAllGlobals();
  });

  test('7 — SVG is rendered when isActive=true', () => {
    setState({ isActive: true, highlightedElementId: null });
    const { container } = render(<TutorialOverlay />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

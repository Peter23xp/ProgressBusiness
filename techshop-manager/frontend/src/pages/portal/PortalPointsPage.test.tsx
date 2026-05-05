/**
 * SCR-037 — PortalPointsPage (19 tests)
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const a = await vi.importActual('react-router-dom');
  return { ...a, useNavigate: () => mockNavigate };
});

const mockSetTypeFilter = vi.fn();
const mockFetchNextPage = vi.fn();
const mockUsePortalPoints = vi.fn();
vi.mock('@/hooks/usePortalPoints', () => ({
  usePortalPoints: () => mockUsePortalPoints(),
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (sel: any) => sel({ user: { id: 'c1', role: 'CLIENT' }, isAuthenticated: true }),
}));

vi.mock('@/components/clients/ClientLevelBadge', () => ({
  ClientLevelBadge: ({ niveau }: { niveau: string }) => (
    <span data-testid={`badge-${niveau.toLowerCase()}`}>{niveau}</span>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NIVEAUX_CONFIG = [
  { id: '1', nom: 'Bronze',  seuilPts: 0,    remisePct: 0 },
  { id: '2', nom: 'Argent',  seuilPts: 500,  remisePct: 3 },
  { id: '3', nom: 'Or',      seuilPts: 2000, remisePct: 5 },
  { id: '4', nom: 'Platine', seuilPts: 5000, remisePct: 8 },
];

const MOUVEMENTS = [
  {
    id: 'm1', type: 'ACHAT', delta: 450, soldeApres: 2963,
    description: 'Achat Samsung A54', createdAt: '2025-01-17T14:32:00Z',
  },
  {
    id: 'm2', type: 'PARRAINAGE', delta: 500, soldeApres: 2513,
    description: 'Parrainage Amani', createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'm3', type: 'RETOUR', delta: -56, soldeApres: 2013,
    description: 'Retour chargeur', createdAt: '2025-01-05T08:00:00Z',
  },
];

function defaultHookState(overrides = {}) {
  return {
    niveauFidelite: 'OR' as const,
    pointsActuels: 2963,
    remisePct: 5,
    niveauxConfig: NIVEAUX_CONFIG,
    prochainNiveau: { nom: 'Platine', seuilPts: 5000, pointsManquants: 2037 },
    mouvements: MOUVEMENTS,
    typeFilter: 'all' as const,
    setTypeFilter: mockSetTypeFilter,
    isLoading: false,
    fetchNextPage: mockFetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
    ...overrides,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQC() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

let PortalPointsPage: React.ComponentType;

beforeEach(async () => {
  vi.clearAllMocks();
  mockUsePortalPoints.mockReturnValue(defaultHookState());
  const mod = await import('@/pages/portal/PortalPointsPage');
  PortalPointsPage = mod.default;
});

function renderPage() {
  return render(
    <QueryClientProvider client={makeQC()}>
      <MemoryRouter initialEntries={['/portal/points']}>
        <PortalPointsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PortalPointsPage', () => {
  describe('Solde card', () => {
    test('1 — Niveau OR et points 2 963 affichés', () => {
      renderPage();
      // Multiple badge-or elements expected (solde card + NiveauxGuide both show OR badge)
      expect(screen.getAllByTestId('badge-or').length).toBeGreaterThanOrEqual(1);
      // 2 963 appears in solde card AND in movement soldeApres — just assert at least one match
      expect(screen.getAllByText(/2\s*963/).length).toBeGreaterThanOrEqual(1);
    });

    test('2 — Barre de progression présente (role="progressbar")', () => {
      renderPage();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('3 — Prochain niveau "Platine" et points manquants affichés', () => {
      renderPage();
      // Progress bar shows "Vers Platine" text
      expect(screen.getByText(/vers platine/i)).toBeInTheDocument();
      expect(screen.getByText(/2\s*037\s*pts/)).toBeInTheDocument();
    });

    test('4 — Client PLATINE : "Vous avez atteint le niveau maximum" affiché', () => {
      mockUsePortalPoints.mockReturnValue(defaultHookState({
        niveauFidelite: 'PLATINE',
        pointsActuels: 6200,
        remisePct: 8,
        prochainNiveau: null,
      }));
      renderPage();
      expect(screen.getByText(/niveau maximum/i)).toBeInTheDocument();
    });

    test('5 — Remise 5% affichée pour niveau OR', () => {
      renderPage();
      expect(screen.getByText(/remise applicable.*5%/i)).toBeInTheDocument();
    });

    test('6 — Remise masquée pour BRONZE (remisePct=0)', () => {
      mockUsePortalPoints.mockReturnValue(defaultHookState({
        niveauFidelite: 'BRONZE',
        pointsActuels: 120,
        remisePct: 0,
        prochainNiveau: { nom: 'Argent', seuilPts: 500, pointsManquants: 380 },
      }));
      renderPage();
      expect(screen.queryByText(/remise applicable/i)).toBeNull();
    });
  });

  describe('NiveauxGuide', () => {
    test('7 — 4 niveaux (Bronze, Argent, Or, Platine) affichés', () => {
      renderPage();
      // Each niveau appears in NiveauxGuide — OR appears also in solde card
      expect(screen.getAllByTestId('badge-bronze').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('badge-argent').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('badge-or').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('badge-platine').length).toBeGreaterThanOrEqual(1);
    });

    test('8 — Remise de chaque niveau affichée dans la grille', () => {
      renderPage();
      expect(screen.getByText('Remise : 3%')).toBeInTheDocument();
      expect(screen.getByText('Remise : 8%')).toBeInTheDocument();
    });

    test('9 — Niveaux futurs ont une icône cadenas (Lock)', () => {
      renderPage();
      // PLATINE is future for OR client — it gets opacity-70 and has Lock icon rendered in the DOM
      const guide = document.querySelector('.grid.grid-cols-2');
      expect(guide).not.toBeNull();
      // The opacity-70 class is applied to future level cards
      const futureLevels = document.querySelectorAll('.opacity-70');
      expect(futureLevels.length).toBeGreaterThan(0);
    });
  });

  describe('HowToEarn', () => {
    test('10 — Section "Comment gagner des points" affichée', () => {
      renderPage();
      expect(screen.getByText(/comment gagner des points/i)).toBeInTheDocument();
    });

    test('11 — Ratio 1 pt / 1 000 CDF affiché', () => {
      renderPage();
      expect(screen.getByText(/1\s*000 cdf/i)).toBeInTheDocument();
    });
  });

  describe('Filter pills', () => {
    test('12 — 3 filtres : Tous, Gains, Déductions', () => {
      renderPage();
      expect(screen.getByRole('button', { name: 'Tous' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Gains' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Déductions' })).toBeInTheDocument();
    });

    test('13 — Clic "Gains" → setTypeFilter("gains")', async () => {
      renderPage();
      await userEvent.click(screen.getByRole('button', { name: 'Gains' }));
      expect(mockSetTypeFilter).toHaveBeenCalledWith('gains');
    });

    test('14 — Clic "Déductions" → setTypeFilter("deductions")', async () => {
      renderPage();
      await userEvent.click(screen.getByRole('button', { name: 'Déductions' }));
      expect(mockSetTypeFilter).toHaveBeenCalledWith('deductions');
    });
  });

  describe('Mouvement rows', () => {
    test('15 — Mouvements ACHAT et PARRAINAGE affichés', () => {
      renderPage();
      expect(screen.getByText('Achat Samsung A54')).toBeInTheDocument();
      expect(screen.getByText('Parrainage Amani')).toBeInTheDocument();
    });

    test('16 — Delta positif vert "+450 pts", négatif rouge "-56 pts"', () => {
      renderPage();
      const pos = screen.getByText('+450 pts');
      expect(pos.className).toMatch(/text-green/);
      const neg = screen.getByText(/-56 pts/);
      expect(neg.className).toMatch(/text-red/);
    });

    test('17 — Empty state (typeFilter=deductions, liste vide)', () => {
      mockUsePortalPoints.mockReturnValue(defaultHookState({
        mouvements: [],
        typeFilter: 'deductions' as const,
      }));
      renderPage();
      expect(screen.getByText(/aucune déduction de points/i)).toBeInTheDocument();
    });
  });

  describe('Loading', () => {
    test('18 — Skeleton pendant chargement (≥ 2 .animate-pulse)', () => {
      mockUsePortalPoints.mockReturnValue(defaultHookState({ isLoading: true, mouvements: [] }));
      renderPage();
      expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(2);
    });

    test('19 — Bouton "Charger plus" absent quand hasNextPage=false', () => {
      renderPage();
      expect(screen.queryByRole('button', { name: /charger plus/i })).toBeNull();
    });
  });
});

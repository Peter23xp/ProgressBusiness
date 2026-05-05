/**
 * SCR-036 — PortalAchatsPage (16 tests)
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

const mockSetPeriod = vi.fn();
const mockFetchNextPage = vi.fn();
const mockUsePortalPurchases = vi.fn();
vi.mock('@/hooks/usePortalPurchases', () => ({
  usePortalPurchases: () => mockUsePortalPurchases(),
}));

const mockGetPurchaseDetail = vi.fn();
vi.mock('@/lib/portal.api', () => ({
  portalApi: {
    getPurchaseDetail: (...a: any[]) => mockGetPurchaseDetail(...a),
    getPurchases: vi.fn(),
    getHomeData: vi.fn(),
    getPointsMouvements: vi.fn(),
    getReferrals: vi.fn(),
  },
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (sel: any) => sel({ user: { id: 'c1', role: 'CLIENT' }, isAuthenticated: true }),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const STATS = { totalDepense: 1_234_000, nbAchats: 5, totalPointsGagnes: 1234 };

const ACHAT_1 = {
  id: 'a1', date: '2025-01-17T14:32:00Z', siteNom: 'Goma',
  produitPrincipal: 'Samsung Galaxy A54', nbArticles: 2,
  montantTotal: 450_000, pointsAttribues: 450, remiseAppliquee: 25_000,
};
const ACHAT_2 = {
  id: 'a2', date: '2025-01-12T11:05:00Z', siteNom: 'Bukavu',
  produitPrincipal: 'Chargeur USB-C 65W', nbArticles: 1,
  montantTotal: 56_000, pointsAttribues: 56, remiseAppliquee: 0,
};
const ACHAT_LONG = {
  id: 'a3', date: '2025-01-10T09:00:00Z', siteNom: 'Kinshasa',
  produitPrincipal: 'Écran Gaming 27 pouces 4K HDR Pro', nbArticles: 1,
  montantTotal: 800_000, pointsAttribues: 800, remiseAppliquee: 0,
};

const DETAIL_VENTE = {
  id: 'a1', numeroVente: 'GOM-202501-0001',
  date: '2025-01-17T14:32:00Z', siteNom: 'Goma', modePaiement: 'CASH',
  lignes: [
    { nom: 'Samsung Galaxy A54', quantite: 1, prixUnitaire: 450_000, sousTotal: 450_000 },
    { nom: 'Coque Samsung', quantite: 1, prixUnitaire: 25_000, sousTotal: 25_000 },
  ],
  montantBrut: 475_000, remiseFidelite: 25_000, montantNet: 450_000,
  pointsAttribues: 450, soldePointsApres: 2963,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQC() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function defaultHookState(overrides = {}) {
  return {
    achatsByMonth: { 'janvier 2025': [ACHAT_1, ACHAT_2] },
    stats: STATS,
    period: 'month' as const,
    setPeriod: mockSetPeriod,
    isLoading: false,
    fetchNextPage: mockFetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
    ...overrides,
  };
}

let PortalAchatsPage: React.ComponentType;

beforeEach(async () => {
  vi.clearAllMocks();
  mockUsePortalPurchases.mockReturnValue(defaultHookState());
  const mod = await import('@/pages/portal/PortalAchatsPage');
  PortalAchatsPage = mod.default;
});

function renderPage() {
  return render(
    <QueryClientProvider client={makeQC()}>
      <MemoryRouter initialEntries={['/portal/purchases']}>
        <PortalAchatsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PortalAchatsPage', () => {
  describe('Period pills', () => {
    test('1 — 3 pills de période affichées', () => {
      renderPage();
      expect(screen.getByText('Ce mois')).toBeInTheDocument();
      expect(screen.getByText('3 derniers mois')).toBeInTheDocument();
      expect(screen.getByText('Tout')).toBeInTheDocument();
    });

    test('2 — Pill "Ce mois" active par défaut (fond foncé)', () => {
      renderPage();
      const pill = screen.getByText('Ce mois').closest('button');
      expect(pill?.className).toMatch(/bg-\[#1E3A5F\]/);
    });

    test('3 — Clic "3 derniers mois" → setPeriod("3months")', async () => {
      renderPage();
      await userEvent.click(screen.getByText('3 derniers mois'));
      expect(mockSetPeriod).toHaveBeenCalledWith('3months');
    });

    test('4 — Clic "Tout" → setPeriod("all")', async () => {
      renderPage();
      await userEvent.click(screen.getByText('Tout'));
      expect(mockSetPeriod).toHaveBeenCalledWith('all');
    });
  });

  describe('StatsCard', () => {
    test('5 — Total dépensé formaté en CDF affiché', () => {
      renderPage();
      expect(screen.getByText(/1\s*234\s*000/)).toBeInTheDocument();
    });

    test('6 — Nb achats et points gagnés affichés', () => {
      renderPage();
      expect(screen.getByText(/5 achat/)).toBeInTheDocument();
      expect(screen.getByText(/\+1\s*234 pts gagnés/)).toBeInTheDocument();
    });
  });

  describe('Purchase cards', () => {
    test('7 — Achats groupés par mois — en-tête "janvier 2025" visible', () => {
      renderPage();
      expect(screen.getByText(/janvier 2025/i)).toBeInTheDocument();
    });

    test('8 — Achat avec remise → "Remise appliquée" affiché', () => {
      renderPage();
      expect(screen.getByText(/remise appliquée/i)).toBeInTheDocument();
    });

    test('9 — Achat sans remise → pas de ligne "Remise appliquée"', () => {
      mockUsePortalPurchases.mockReturnValue(defaultHookState({
        achatsByMonth: { 'janvier 2025': [ACHAT_2] },
        stats: { ...STATS, nbAchats: 1, totalPointsGagnes: 0 },
      }));
      renderPage();
      expect(screen.queryByText(/remise appliquée/i)).toBeNull();
    });

    test('10 — Nom > 25 chars tronqué avec "…"', () => {
      mockUsePortalPurchases.mockReturnValue(defaultHookState({
        achatsByMonth: { 'janvier 2025': [ACHAT_LONG] },
      }));
      renderPage();
      const full = 'Écran Gaming 27 pouces 4K HDR Pro';
      const truncated = full.slice(0, 25) + '…';
      expect(screen.getByText(truncated)).toBeInTheDocument();
      expect(screen.queryByText(full)).toBeNull();
    });
  });

  describe('Detail panel', () => {
    test('11 — Clic achat card → PurchaseDetailPanel ouvert', async () => {
      mockGetPurchaseDetail.mockResolvedValue({ vente: DETAIL_VENTE });
      renderPage();
      await userEvent.click(screen.getByText('Samsung Galaxy A54').closest('button')!);
      expect(screen.getByRole('dialog', { name: /détail de l'achat/i })).toBeInTheDocument();
    });

    test('12 — PurchaseDetailPanel : lignes et total payé affichés', async () => {
      mockGetPurchaseDetail.mockResolvedValue({ vente: DETAIL_VENTE });
      renderPage();
      await userEvent.click(screen.getByText('Samsung Galaxy A54').closest('button')!);
      await waitFor(() => expect(screen.getByText('GOM-202501-0001')).toBeInTheDocument());
      expect(screen.getByText(/total payé/i)).toBeInTheDocument();
      expect(screen.getByText('Coque Samsung ×1')).toBeInTheDocument();
    });

    test('13 — Clic "Fermer" → panel fermé', async () => {
      mockGetPurchaseDetail.mockResolvedValue({ vente: DETAIL_VENTE });
      renderPage();
      await userEvent.click(screen.getByText('Samsung Galaxy A54').closest('button')!);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /fermer/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Empty states', () => {
    test('14 — Empty state period="all" → "Aucun achat enregistré" affiché', () => {
      mockUsePortalPurchases.mockReturnValue(defaultHookState({
        achatsByMonth: {},
        period: 'all' as const,
        stats: { totalDepense: 0, nbAchats: 0, totalPointsGagnes: 0 },
      }));
      renderPage();
      expect(screen.getByText(/aucun achat enregistré/i)).toBeInTheDocument();
    });

    test('15 — Empty state period="month" → bouton "Voir tous" → setPeriod("all")', async () => {
      mockUsePortalPurchases.mockReturnValue(defaultHookState({
        achatsByMonth: {},
        period: 'month' as const,
        stats: { totalDepense: 0, nbAchats: 0, totalPointsGagnes: 0 },
      }));
      renderPage();
      const btn = screen.getByRole('button', { name: /voir tous mes achats/i });
      expect(btn).toBeInTheDocument();
      await userEvent.click(btn);
      expect(mockSetPeriod).toHaveBeenCalledWith('all');
    });
  });

  describe('Loading & pagination', () => {
    test('16 — Skeleton animé pendant chargement (≥ 3 .animate-pulse)', () => {
      mockUsePortalPurchases.mockReturnValue(defaultHookState({
        isLoading: true,
        achatsByMonth: {},
      }));
      renderPage();
      expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3);
    });
  });
});

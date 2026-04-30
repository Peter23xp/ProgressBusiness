import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

// Auth
import LoginPage from '@/pages/auth/LoginPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DashboardRegionalPage from '@/pages/dashboard/DashboardRegionalPage';

// Clients
import ClientsListPage from '@/pages/clients/ClientsListPage';
import ClientDetailPage from '@/pages/clients/ClientDetailPage';
import OnboardingRecitPage from '@/pages/clients/OnboardingRecitPage';
import OnboardingFormationPage from '@/pages/clients/OnboardingFormationPage';
import OnboardingFichePage from '@/pages/clients/OnboardingFichePage';
import OnboardingActivationPage from '@/pages/clients/OnboardingActivationPage';
import ImportMatriculesPage from '@/pages/clients/ImportMatriculesPage';

// Ventes
import POSPage from '@/pages/ventes/POSPage';
import VentesHistoriquePage from '@/pages/ventes/VentesHistoriquePage';
import VenteDetailPage from '@/pages/ventes/VenteDetailPage';
import RecuPage from '@/pages/ventes/RecuPage';
import RetoursPage from '@/pages/ventes/RetoursPage';

// Stocks
import InventairePage from '@/pages/stocks/InventairePage';
import ProduitStockPage from '@/pages/stocks/ProduitStockPage';
import EntreeStockPage from '@/pages/stocks/EntreeStockPage';
import TransfertPage from '@/pages/stocks/TransfertPage';
import ReceptionTransfertPage from '@/pages/stocks/ReceptionTransfertPage';
import AlertesStockPage from '@/pages/stocks/AlertesStockPage';
import InventairePhysiquePage from '@/pages/stocks/InventairePhysiquePage';

// Parrainage
import ParrainageGlobalPage from '@/pages/parrainage/ParrainageGlobalPage';
import ArbreParrainagePage from '@/pages/parrainage/ArbreParrainagePage';
import ConfigRecompensesPage from '@/pages/parrainage/ConfigRecompensesPage';

// Fidelite
import FideliteProgrammePage from '@/pages/fidelite/FideliteProgrammePage';
import ClientPointsPage from '@/pages/fidelite/ClientPointsPage';
import ConfigFidelitePage from '@/pages/fidelite/ConfigFidelitePage';

// Rapports
import RapportsDashboardPage from '@/pages/rapports/RapportsDashboardPage';
import RapportVentesPage from '@/pages/rapports/RapportVentesPage';
import RapportStocksPage from '@/pages/rapports/RapportStocksPage';
import RapportParrainagePage from '@/pages/rapports/RapportParrainagePage';
import ExportPage from '@/pages/rapports/ExportPage';

// Portal Client
import PortalHomePage from '@/pages/portal/PortalHomePage';
import PortalAchatsPage from '@/pages/portal/PortalAchatsPage';
import PortalPointsPage from '@/pages/portal/PortalPointsPage';
import PortalFilleulsPage from '@/pages/portal/PortalFilleulsPage';

// Parametres
import UsersPage from '@/pages/parametres/UsersPage';
import SitesPage from '@/pages/parametres/SitesPage';
import ProfilPage from '@/pages/parametres/ProfilPage';
import ConfigGeneralePage from '@/pages/parametres/ConfigGeneralePage';

export default function App() {
  const setOnline = useUIStore((s) => s.setOnline);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Portal Client — role CLIENT */}
        <Route path="/portal" element={<AuthGuard><RoleGuard minRole="CLIENT"><AppLayout /></RoleGuard></AuthGuard>}>
          <Route path="home" element={<PortalHomePage />} />
          <Route path="purchases" element={<PortalAchatsPage />} />
          <Route path="points" element={<PortalPointsPage />} />
          <Route path="referrals" element={<PortalFilleulsPage />} />
        </Route>

        {/* App routes — role AGENT+ */}
        <Route path="/" element={<AuthGuard><RoleGuard minRole="AGENT"><AppLayout /></RoleGuard></AuthGuard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/regional" element={<RoleGuard minRole="DIRECTEUR_REGIONAL"><DashboardRegionalPage /></RoleGuard>} />

          {/* Clients */}
          <Route path="clients" element={<ClientsListPage />} />
          <Route path="clients/new/recit" element={<OnboardingRecitPage />} />
          <Route path="clients/import" element={<RoleGuard minRole="GERANT"><ImportMatriculesPage /></RoleGuard>} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="clients/:id/formation" element={<RoleGuard minRole="FORMATEUR"><OnboardingFormationPage /></RoleGuard>} />
          <Route path="clients/:id/fiche" element={<OnboardingFichePage />} />
          <Route path="clients/:id/activate" element={<OnboardingActivationPage />} />

          {/* Ventes */}
          <Route path="sales/pos" element={<POSPage />} />
          <Route path="sales" element={<RoleGuard minRole="GERANT"><VentesHistoriquePage /></RoleGuard>} />
          <Route path="sales/returns" element={<RoleGuard minRole="GERANT"><RetoursPage /></RoleGuard>} />
          <Route path="sales/:id" element={<RoleGuard minRole="GERANT"><VenteDetailPage /></RoleGuard>} />
          <Route path="sales/:id/receipt" element={<RecuPage />} />

          {/* Stocks */}
          <Route path="stocks" element={<InventairePage />} />
          <Route path="stocks/entry" element={<RoleGuard minRole="GERANT"><EntreeStockPage /></RoleGuard>} />
          <Route path="stocks/transfer" element={<RoleGuard minRole="GERANT"><TransfertPage /></RoleGuard>} />
          <Route path="stocks/alerts" element={<RoleGuard minRole="GERANT"><AlertesStockPage /></RoleGuard>} />
          <Route path="stocks/inventory" element={<RoleGuard minRole="GERANT"><InventairePhysiquePage /></RoleGuard>} />
          <Route path="stocks/transfer/:id/receive" element={<RoleGuard minRole="GERANT"><ReceptionTransfertPage /></RoleGuard>} />
          <Route path="stocks/:produitId" element={<RoleGuard minRole="GERANT"><ProduitStockPage /></RoleGuard>} />

          {/* Parrainage */}
          <Route path="parrainage" element={<RoleGuard minRole="GERANT"><ParrainageGlobalPage /></RoleGuard>} />
          <Route path="parrainage/tree/:clientId" element={<ArbreParrainagePage />} />
          <Route path="parrainage/config" element={<RoleGuard minRole="SUPER_ADMIN"><ConfigRecompensesPage /></RoleGuard>} />

          {/* Fidelite */}
          <Route path="fidelite" element={<RoleGuard minRole="GERANT"><FideliteProgrammePage /></RoleGuard>} />
          <Route path="fidelite/client/:id" element={<ClientPointsPage />} />
          <Route path="fidelite/config" element={<RoleGuard minRole="SUPER_ADMIN"><ConfigFidelitePage /></RoleGuard>} />

          {/* Rapports */}
          <Route path="reports" element={<RoleGuard minRole="GERANT"><RapportsDashboardPage /></RoleGuard>} />
          <Route path="reports/sales" element={<RoleGuard minRole="DIRECTEUR_REGIONAL"><RapportVentesPage /></RoleGuard>} />
          <Route path="reports/stocks" element={<RoleGuard minRole="DIRECTEUR_REGIONAL"><RapportStocksPage /></RoleGuard>} />
          <Route path="reports/parrainage" element={<RoleGuard minRole="GERANT"><RapportParrainagePage /></RoleGuard>} />
          <Route path="reports/export" element={<RoleGuard minRole="GERANT"><ExportPage /></RoleGuard>} />

          {/* Parametres */}
          <Route path="settings/users" element={<RoleGuard minRole="SUPER_ADMIN"><UsersPage /></RoleGuard>} />
          <Route path="settings/sites" element={<RoleGuard minRole="SUPER_ADMIN"><SitesPage /></RoleGuard>} />
          <Route path="settings/profile" element={<ProfilPage />} />
          <Route path="settings/general" element={<RoleGuard minRole="SUPER_ADMIN"><ConfigGeneralePage /></RoleGuard>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

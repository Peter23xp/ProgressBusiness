import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  ShoppingCart,
  Receipt,
  Package,
  GitBranch,
  Star,
  BarChart2,
  Settings,
  User,
  Building2,
  SlidersHorizontal,
  UserCog,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import type { Role } from '@/types';

// ─── Nav item types ───────────────────────────────────────────────────────────

interface NavItemDef {
  label: string;
  icon: React.ReactNode;
  to: string;
  minRole: Role;
}

interface NavGroupDef {
  label: string;
  icon: React.ReactNode;
  minRole: Role;
  children: NavItemDef[];
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItemDef[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    to: '/dashboard',
    minRole: 'AGENT',
  },
  {
    label: 'Dashboard Régional',
    icon: <TrendingUp size={18} />,
    to: '/dashboard/regional',
    minRole: 'DIRECTEUR_REGIONAL',
  },
  {
    label: 'Clients',
    icon: <Users size={18} />,
    to: '/clients',
    minRole: 'AGENT',
  },
  {
    label: 'Caisse POS',
    icon: <ShoppingCart size={18} />,
    to: '/sales/pos',
    minRole: 'AGENT',
  },
  {
    label: 'Ventes',
    icon: <Receipt size={18} />,
    to: '/sales',
    minRole: 'GERANT',
  },
  {
    label: 'Stocks',
    icon: <Package size={18} />,
    to: '/stocks',
    minRole: 'AGENT',
  },
  {
    label: 'Parrainage',
    icon: <GitBranch size={18} />,
    to: '/parrainage',
    minRole: 'GERANT',
  },
  {
    label: 'Fidélité',
    icon: <Star size={18} />,
    to: '/fidelite',
    minRole: 'GERANT',
  },
  {
    label: 'Rapports',
    icon: <BarChart2 size={18} />,
    to: '/reports',
    minRole: 'GERANT',
  },
];

const SETTINGS_GROUP: NavGroupDef = {
  label: 'Paramètres',
  icon: <Settings size={18} />,
  minRole: 'AGENT',
  children: [
    {
      label: 'Utilisateurs',
      icon: <UserCog size={16} />,
      to: '/settings/users',
      minRole: 'SUPER_ADMIN',
    },
    {
      label: 'Sites',
      icon: <Building2 size={16} />,
      to: '/settings/sites',
      minRole: 'SUPER_ADMIN',
    },
    {
      label: 'Profil',
      icon: <User size={16} />,
      to: '/settings/profile',
      minRole: 'AGENT',
    },
    {
      label: 'Config',
      icon: <SlidersHorizontal size={16} />,
      to: '/settings/config',
      minRole: 'SUPER_ADMIN',
    },
  ],
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { hasRole } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => hasRole(item.minRole));
  const visibleSettingsChildren = SETTINGS_GROUP.children.filter((c) =>
    hasRole(c.minRole),
  );
  const showSettings =
    hasRole(SETTINGS_GROUP.minRole) && visibleSettingsChildren.length > 0;

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-accent text-white font-extrabold text-lg tracking-tight select-none">
          TS
        </div>
        <span className="text-white font-bold text-base tracking-wide">
          TechShop
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-white/60 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) =>
              cn('sidebar-link', isActive && 'active')
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Settings group */}
        {showSettings && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className={cn(
                'sidebar-link w-full justify-between',
                settingsOpen && 'bg-white/10',
              )}
            >
              <span className="flex items-center gap-3">
                {SETTINGS_GROUP.icon}
                {SETTINGS_GROUP.label}
              </span>
              {settingsOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>

            {settingsOpen && (
              <div className="mt-0.5 ml-5 pl-3 border-l border-white/20 space-y-0.5">
                {visibleSettingsChildren.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn('sidebar-link text-sm', isActive && 'active')
                    }
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();
  const { selectedSiteId } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Derive displayed site name from user or selected site
  const siteName = user?.siteName ?? (selectedSiteId ? `Site ${selectedSiteId}` : null);

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
      {/* Left: hamburger (mobile) + site name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="btn-ghost p-1.5 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>

        {siteName && (
          <div className="flex items-center gap-1.5 text-sm">
            <Building2 size={15} className="text-primary-accent" />
            <span className="font-semibold text-primary-DEFAULT">{siteName}</span>
          </div>
        )}
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-primary-DEFAULT leading-none">
              {user.name}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">{user.role}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="btn-ghost flex items-center gap-1.5 text-sm text-gray-500 hover:text-danger"
          title="Se déconnecter"
        >
          <LogOut size={17} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <>
      <OfflineBanner />

      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <Sidebar onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setMobileSidebarOpen(true)} />
          <main className="main-content flex-1 overflow-y-auto p-6 bg-bg">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

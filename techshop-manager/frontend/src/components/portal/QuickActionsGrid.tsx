import { ShoppingBag, Star, Users } from 'lucide-react';

interface QuickActionsGridProps {
  onNavigate: (route: string) => void;
  nbFilleulsActifs: number;
}

export function QuickActionsGrid({ onNavigate, nbFilleulsActifs }: QuickActionsGridProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('/portal/purchases')}
          className="h-[72px] rounded-xl bg-blue-500 text-white flex flex-col items-center justify-center gap-1 shadow-sm
                     hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition-transform"
          aria-label="Mes achats"
        >
          <ShoppingBag size={22} />
          <span className="text-sm font-semibold">Mes achats</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/portal/points')}
          className="h-[72px] rounded-xl bg-yellow-500 text-white flex flex-col items-center justify-center gap-1 shadow-sm
                     hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition-transform"
          aria-label="Mes points"
        >
          <Star size={22} />
          <span className="text-sm font-semibold">Mes points</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onNavigate('/portal/referrals')}
        className="w-full h-[72px] rounded-xl bg-green-600 text-white flex flex-col items-center justify-center gap-0.5 shadow-sm
                   hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition-transform"
        aria-label={`Mes filleuls — ${nbFilleulsActifs} actifs`}
      >
        <Users size={22} />
        <span className="text-sm font-semibold">Mes filleuls</span>
        <span className="text-[11px] text-green-100">{nbFilleulsActifs} filleul{nbFilleulsActifs !== 1 ? 's' : ''} actif{nbFilleulsActifs !== 1 ? 's' : ''}</span>
      </button>
    </div>
  );
}

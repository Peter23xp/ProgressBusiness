import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';

interface NiveauConfig {
  niveau: string;
  seuilMin: number;
  remise: number;
  couleur: string;
}

interface FideliteConfig {
  niveaux: NiveauConfig[];
  ratioPointsCDF: number;
  dureeValiditeJours: number;
  cumulRemises: boolean;
}

const DEFAULT_NIVEAUX: NiveauConfig[] = [
  { niveau: 'BRONZE', seuilMin: 0, remise: 0, couleur: '#cd7f32' },
  { niveau: 'ARGENT', seuilMin: 1000, remise: 3, couleur: '#9ca3af' },
  { niveau: 'OR', seuilMin: 5000, remise: 5, couleur: '#f59e0b' },
  { niveau: 'PLATINE', seuilMin: 10000, remise: 10, couleur: '#8b5cf6' },
];

export default function ConfigFidelitePage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<FideliteConfig>({
    queryKey: ['fidelite-config'],
    queryFn: () => api.get('/fidelite/config').then(r => r.data),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FideliteConfig>({
    defaultValues: data || { niveaux: DEFAULT_NIVEAUX, ratioPointsCDF: 100, dureeValiditeJours: 365, cumulRemises: false },
  });

  const mutation = useMutation({
    mutationFn: (d: FideliteConfig) => api.put('/fidelite/config', d),
    onSuccess: () => {
      toast.success('Configuration fidélité sauvegardée.');
      qc.invalidateQueries({ queryKey: ['fidelite-config'] });
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur de sauvegarde.'),
  });

  const niveaux = data?.niveaux || DEFAULT_NIVEAUX;

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="card"><div className="skeleton h-64 rounded" /></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={26} className="text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration fidélité</h1>
          <p className="text-sm text-gray-500">Paramètres du programme de fidélité</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            Niveaux et remises
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase">
                  <th className="pb-3 font-semibold">Niveau</th>
                  <th className="pb-3 font-semibold">Seuil minimum (pts)</th>
                  <th className="pb-3 font-semibold">Remise (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {niveaux.map((n, i) => (
                  <tr key={n.niveau}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: n.couleur }} />
                        <span className="font-bold" style={{ color: n.couleur }}>{n.niveau}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      {i === 0 ? (
                        <span className="text-gray-400 italic">Point de départ (0)</span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          defaultValue={n.seuilMin}
                          className={`w-32 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.niveaux?.[i]?.seuilMin ? 'border-red-400' : 'border-gray-300'}`}
                          {...register(`niveaux.${i}.seuilMin`, { valueAsNumber: true, min: 1 })}
                        />
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          defaultValue={n.remise}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          {...register(`niveaux.${i}.remise`, { valueAsNumber: true, min: 0, max: 100 })}
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-800">Paramètres généraux</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Ratio points / CDF dépensé</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">1 point =</span>
                <input
                  type="number"
                  min={1}
                  defaultValue={data?.ratioPointsCDF || 100}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('ratioPointsCDF', { valueAsNumber: true, min: 1 })}
                />
                <span className="text-gray-500 text-sm">CDF dépensé</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Ex: 1 point par 100 CDF dépensé</p>
            </div>

            <div className="form-group">
              <label className="form-label">Durée de validité des points</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={30}
                  defaultValue={data?.dureeValiditeJours || 365}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('dureeValiditeJours', { valueAsNumber: true, min: 30 })}
                />
                <span className="text-gray-500 text-sm">jours</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Après cette période sans activité, les points expirent</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div>
              <p className="font-semibold text-gray-800">Cumul des remises fidélité et promotions</p>
              <p className="text-xs text-gray-500 mt-0.5">Permet d'appliquer la remise fidélité en plus des promotions en cours</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('cumulRemises')} defaultChecked={data?.cumulRemises} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500" />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={mutation.isLoading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
            {mutation.isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
            Sauvegarder la configuration
          </button>
        </div>
      </form>
    </div>
  );
}

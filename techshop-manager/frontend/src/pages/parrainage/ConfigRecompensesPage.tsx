import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';

interface ParrainageConfig {
  multiNiveaux: boolean;
  typeRecompense: 'POURCENTAGE' | 'MONTANT_FIXE' | 'POINTS';
  valeurN1: number;
  valeurN2?: number;
  conditionDeclenchement: 'ACTIVATION' | 'PREMIER_ACHAT' | 'ACHAT_MINIMUM';
  montantMinimumAchat?: number;
  plafondMensuel?: number;
}

export default function ConfigRecompensesPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<ParrainageConfig>({
    queryKey: ['parrainage-config'],
    queryFn: () => api.get('/parrainage/config').then(r => r.data),
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ParrainageConfig>();

  const multiNiveaux = watch('multiNiveaux');
  const conditionDeclenchement = watch('conditionDeclenchement');

  useQuery({
    queryKey: ['parrainage-config'],
    queryFn: () => api.get('/parrainage/config').then(r => r.data),
    onSuccess: (d: ParrainageConfig) => reset(d),
  } as any);

  const mutation = useMutation({
    mutationFn: (data: ParrainageConfig) => api.put('/parrainage/config', data),
    onSuccess: () => {
      toast.success('Configuration sauvegardée.');
      qc.invalidateQueries({ queryKey: ['parrainage-config'] });
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur de sauvegarde.'),
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="card"><div className="skeleton h-64 rounded" /></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={26} className="text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration des récompenses</h1>
          <p className="text-sm text-gray-500">Paramètres du programme de parrainage</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div>
              <p className="font-semibold text-gray-800">Parrainage multi-niveaux</p>
              <p className="text-xs text-gray-500 mt-0.5">Activer les récompenses N1 et N2 (filleuls et filleuls des filleuls)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('multiNiveaux')} defaultChecked={data?.multiNiveaux} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Type de récompense *</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              defaultValue={data?.typeRecompense}
              {...register('typeRecompense', { required: true })}
            >
              <option value="POURCENTAGE">Pourcentage de l'achat du filleul</option>
              <option value="MONTANT_FIXE">Montant fixe (CDF)</option>
              <option value="POINTS">Points de fidélité</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Valeur récompense N1 *</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="ex: 5"
                  defaultValue={data?.valeurN1}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.valeurN1 ? 'border-red-400' : 'border-gray-300'}`}
                  {...register('valeurN1', { required: 'Valeur N1 requise', valueAsNumber: true, min: { value: 0, message: 'Valeur positive' } })}
                />
              </div>
              {errors.valeurN1 && <p className="form-error">{errors.valeurN1.message}</p>}
            </div>

            {multiNiveaux && (
              <div className="form-group">
                <label className="form-label">Valeur récompense N2 (si multi-niveaux)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="ex: 2"
                  defaultValue={data?.valeurN2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  {...register('valeurN2', { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Condition de déclenchement *</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              defaultValue={data?.conditionDeclenchement}
              {...register('conditionDeclenchement', { required: true })}
            >
              <option value="ACTIVATION">À l'activation du filleul</option>
              <option value="PREMIER_ACHAT">Au premier achat du filleul</option>
              <option value="ACHAT_MINIMUM">Sur achat minimum défini</option>
            </select>
          </div>

          {conditionDeclenchement === 'ACHAT_MINIMUM' && (
            <div className="form-group">
              <label className="form-label">Montant minimum d'achat (CDF)</label>
              <input
                type="number"
                min={0}
                placeholder="ex: 50000"
                defaultValue={data?.montantMinimumAchat}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                {...register('montantMinimumAchat', { valueAsNumber: true })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Plafond mensuel par parrain (CDF) — optionnel</label>
            <input
              type="number"
              min={0}
              placeholder="ex: 500000 (laisser vide = illimité)"
              defaultValue={data?.plafondMensuel}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              {...register('plafondMensuel', { valueAsNumber: true })}
            />
            <p className="text-xs text-gray-400 mt-1">Laissez vide pour ne pas limiter les récompenses mensuelles.</p>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="submit" disabled={mutation.isLoading} className="btn-primary flex items-center gap-2 px-6">
              {mutation.isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
              Sauvegarder la configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

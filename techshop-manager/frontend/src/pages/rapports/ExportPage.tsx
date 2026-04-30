import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Download, FileText, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';

interface ExportFormData {
  typeRapport: string;
  format: 'XLSX' | 'PDF' | 'CSV';
  dateDebut: string;
  dateFin: string;
}

interface ExportJob {
  jobId: string;
  statut: 'EN_COURS' | 'TERMINE' | 'ERREUR';
  progres: number;
  downloadUrl?: string;
}

export default function ExportPage() {
  const [job, setJob] = useState<ExportJob | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const { register, handleSubmit, formState: { errors } } = useForm<ExportFormData>({
    defaultValues: { format: 'XLSX' },
  });

  const mutation = useMutation({
    mutationFn: (data: ExportFormData) => api.post('/rapports/export', data),
    onSuccess: (res) => {
      setJob({ jobId: res.data.jobId, statut: 'EN_COURS', progres: 0 });
      toast.success('Export lancé ! Veuillez patienter...');
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de l\'export.'),
  });

  useEffect(() => {
    if (!job || job.statut !== 'EN_COURS') {
      clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/rapports/export/${job.jobId}`);
        setJob(res.data);
        if (res.data.statut === 'TERMINE') {
          clearInterval(pollRef.current);
          toast.success('Export prêt au téléchargement !');
        } else if (res.data.statut === 'ERREUR') {
          clearInterval(pollRef.current);
          toast.error('Erreur lors de la génération du rapport.');
        }
      } catch { clearInterval(pollRef.current); }
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [job?.jobId, job?.statut]);

  const handleDownload = async () => {
    if (!job?.downloadUrl) return;
    try {
      const res = await api.get(job.downloadUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `rapport-${Date.now()}.${job.downloadUrl.split('.').pop()}`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) { toast.error(getErrorMessage(error) || 'Erreur de téléchargement.'); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Download size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export de rapports</h1>
          <p className="text-sm text-gray-500">Générer et télécharger des rapports</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Type de rapport *</label>
            <select
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.typeRapport ? 'border-red-400' : 'border-gray-300'}`}
              {...register('typeRapport', { required: 'Type requis' })}
            >
              <option value="">Sélectionner un type</option>
              <option value="VENTES">Rapport de ventes</option>
              <option value="STOCKS">Rapport de stocks</option>
              <option value="PARRAINAGE">Rapport de parrainage</option>
              <option value="CLIENTS">Rapport clients</option>
              <option value="FIDELITE">Rapport fidélité</option>
            </select>
            {errors.typeRapport && <p className="form-error">{errors.typeRapport.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Format d'export *</label>
            <div className="grid grid-cols-3 gap-3">
              {(['XLSX', 'PDF', 'CSV'] as const).map(fmt => (
                <label key={fmt} className="relative flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input type="radio" value={fmt} className="sr-only" {...register('format', { required: true })} />
                  <FileText size={24} className={fmt === 'XLSX' ? 'text-green-500' : fmt === 'PDF' ? 'text-red-500' : 'text-blue-500'} />
                  <span className="font-bold text-sm text-gray-700">{fmt}</span>
                  <span className="text-xs text-gray-400">
                    {fmt === 'XLSX' ? 'Excel' : fmt === 'PDF' ? 'Portable' : 'Données brutes'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Date début *</label>
              <input type="date"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateDebut ? 'border-red-400' : 'border-gray-300'}`}
                {...register('dateDebut', { required: 'Date début requise' })}
              />
              {errors.dateDebut && <p className="form-error">{errors.dateDebut.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Date fin *</label>
              <input type="date"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateFin ? 'border-red-400' : 'border-gray-300'}`}
                {...register('dateFin', { required: 'Date fin requise' })}
              />
              {errors.dateFin && <p className="form-error">{errors.dateFin.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isLoading || (job?.statut === 'EN_COURS')}
            className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2"
          >
            {mutation.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <Download size={18} />}
            Générer le rapport
          </button>
        </form>
      </div>

      {job && (
        <div className={`card ${
          job.statut === 'TERMINE' ? 'bg-green-50 border-green-200' :
          job.statut === 'ERREUR' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {job.statut === 'EN_COURS' && <Loader size={20} className="text-blue-600 animate-spin" />}
            {job.statut === 'TERMINE' && <CheckCircle size={20} className="text-green-600" />}
            {job.statut === 'ERREUR' && <div className="w-5 h-5 bg-red-500 rounded-full" />}
            <div>
              <p className="font-semibold text-gray-900">
                {job.statut === 'EN_COURS' ? 'Génération en cours...' :
                 job.statut === 'TERMINE' ? 'Rapport prêt !' : 'Erreur de génération'}
              </p>
              <p className="text-xs text-gray-500">Job ID: {job.jobId}</p>
            </div>
          </div>

          {job.statut === 'EN_COURS' && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-700">Progression</span>
                <span className="font-bold text-blue-700">{job.progres}%</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${job.progres}%` }} />
              </div>
              <p className="text-xs text-blue-500 mt-1">Vérification automatique toutes les 2 secondes...</p>
            </div>
          )}

          {job.statut === 'TERMINE' && (
            <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
              <Download size={18} /> Télécharger le rapport
            </button>
          )}

          {job.statut === 'ERREUR' && (
            <div>
              <p className="text-red-600 text-sm">Une erreur est survenue lors de la génération. Veuillez réessayer.</p>
              <button onClick={() => setJob(null)} className="btn-secondary mt-3">Réessayer</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

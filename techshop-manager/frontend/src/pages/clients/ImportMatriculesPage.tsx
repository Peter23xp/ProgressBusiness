import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';

interface PreviewRow {
  ligne: number;
  nom: string;
  telephone: string;
  matricule: string;
  statut: 'OK' | 'DOUBLON' | 'ERREUR';
  message?: string;
}

interface ImportReport {
  success: number;
  errors: number;
  doublons: number;
  details: Array<{ ligne: number; message: string }>;
}

export default function ImportMatriculesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[] | null>(null);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewMutation = useMutation({
    mutationFn: (f: File) => {
      const form = new FormData();
      form.append('file', f);
      return api.post('/clients/import/preview', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => setPreviewData(res.data.rows || []),
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur de prévisualisation.'),
  });

  const importMutation = useMutation({
    mutationFn: (f: File) => {
      const form = new FormData();
      form.append('file', f);
      return api.post('/clients/import/execute', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => {
      setImportReport(res.data);
      toast.success(`Import terminé: ${res.data.success} succès, ${res.data.errors} erreurs.`);
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur d\'import.'),
  });

  const handleFileSelect = (f: File) => {
    if (!f.name.endsWith('.csv')) {
      toast.error('Seuls les fichiers CSV sont acceptés.');
      return;
    }
    setFile(f);
    setPreviewData(null);
    setImportReport(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import de matricules</h1>
        <p className="text-gray-500 text-sm">Importer des clients via fichier CSV</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-blue-500" />
          Upload du fichier CSV
        </h2>

        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }} />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={40} className="text-green-500" />
              <p className="font-semibold text-green-700">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB — Cliquez pour changer</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={40} className="text-gray-400" />
              <p className="font-medium text-gray-700">Glisser-déposer votre fichier CSV ici</p>
              <p className="text-sm text-gray-400">ou cliquez pour sélectionner</p>
              <p className="text-xs text-gray-400 mt-2">Format: nom, prénom, téléphone, matricule (max 10MB)</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="text-xs font-semibold text-yellow-800 flex items-center gap-2 mb-1">
            <AlertCircle size={14} /> Format CSV attendu
          </p>
          <code className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded block">
            nom,prenom,telephone,matricule,site
          </code>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => file && previewMutation.mutate(file)}
            disabled={!file || previewMutation.isLoading}
            className="btn-secondary flex items-center gap-2"
          >
            {previewMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : <FileText size={16} />}
            Prévisualiser
          </button>
          <button
            onClick={() => file && importMutation.mutate(file)}
            disabled={!file || !previewData || importMutation.isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {importMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <Upload size={16} />}
            Importer
          </button>
        </div>
      </div>

      {previewData && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">
            Prévisualisation ({previewData.length} lignes détectées)
          </h2>
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Nom</th>
                  <th className="pb-3 font-semibold">Téléphone</th>
                  <th className="pb-3 font-semibold">Matricule</th>
                  <th className="pb-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {previewData.slice(0, 10).map(row => (
                  <tr key={row.ligne} className={
                    row.statut === 'ERREUR' ? 'bg-red-50' :
                    row.statut === 'DOUBLON' ? 'bg-yellow-50' : ''
                  }>
                    <td className="py-2 text-gray-400">{row.ligne}</td>
                    <td className="py-2 font-medium text-gray-800">{row.nom}</td>
                    <td className="py-2 font-mono text-gray-600">{row.telephone}</td>
                    <td className="py-2 font-mono text-gray-600">{row.matricule}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {row.statut === 'OK' && <CheckCircle size={14} className="text-green-500" />}
                        {row.statut === 'DOUBLON' && <AlertCircle size={14} className="text-yellow-500" />}
                        {row.statut === 'ERREUR' && <XCircle size={14} className="text-red-500" />}
                        <span className={`badge text-xs ${
                          row.statut === 'OK' ? 'badge-success' :
                          row.statut === 'DOUBLON' ? 'badge-warning' : 'badge-danger'
                        }`}>{row.statut}</span>
                        {row.message && <span className="text-xs text-gray-500">{row.message}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewData.length > 10 && (
            <p className="text-sm text-gray-400 mt-3 text-center">... et {previewData.length - 10} autres lignes</p>
          )}
          <div className="flex gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
            {[
              { label: 'OK', count: previewData.filter(r => r.statut === 'OK').length, color: 'text-green-600' },
              { label: 'Doublons', count: previewData.filter(r => r.statut === 'DOUBLON').length, color: 'text-yellow-600' },
              { label: 'Erreurs', count: previewData.filter(r => r.statut === 'ERREUR').length, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="text-center flex-1">
                <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {importReport && (
        <div className="card bg-green-50 border-green-200">
          <h2 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
            <CheckCircle size={18} />
            Rapport d'import
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 text-center border border-green-200">
              <p className="text-2xl font-black text-green-600">{importReport.success}</p>
              <p className="text-xs text-gray-500">Importés avec succès</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-yellow-200">
              <p className="text-2xl font-black text-yellow-600">{importReport.doublons}</p>
              <p className="text-xs text-gray-500">Doublons ignorés</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-red-200">
              <p className="text-2xl font-black text-red-600">{importReport.errors}</p>
              <p className="text-xs text-gray-500">Erreurs</p>
            </div>
          </div>
          {importReport.details?.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {importReport.details.map((d, i) => (
                <p key={i} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  Ligne {d.ligne}: {d.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

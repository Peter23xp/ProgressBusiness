import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/reports.api';
import type { ExportJobDto } from '@/lib/reports.api';

export function useExportJob() {
  const [jobId, setJobId] = useState<string | null>(null);

  const pollingQuery = useQuery({
    queryKey: ['export-job', jobId],
    queryFn: () => reportsApi.getExportJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      return data.statut === 'PENDING' ? 2000 : false;
    },
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (pollingQuery.data?.statut === 'READY' && pollingQuery.data?.downloadUrl) {
      window.open(pollingQuery.data.downloadUrl, '_blank');
    }
  }, [pollingQuery.data?.statut, pollingQuery.data?.downloadUrl]);

  const startJob = useMutation({
    mutationFn: (body: ExportJobDto) => reportsApi.createExportJob(body),
    onSuccess: (data) => setJobId(data.jobId),
  });

  const reset = () => {
    setJobId(null);
  };

  return {
    startJob: startJob.mutate,
    isStarting: startJob.isPending,
    startError: startJob.error,
    jobId,
    status: pollingQuery.data ?? null,
    isPolling: !!jobId && pollingQuery.data?.statut === 'PENDING',
    reset,
  };
}

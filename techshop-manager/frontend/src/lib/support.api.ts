import { api } from './api';

export interface CreateTicketPayload {
  nom: string;
  email: string;
  siteNom: string;
  role: string;
  type: 'BUG' | 'SUGGESTION' | 'QUESTION' | 'CONFIG' | 'URGENCE';
  sujet: string;
  description: string;
  systemInfo?: string;
  screenshot?: File;
}

export interface CreateTicketResponse {
  ticketRef: string;
  message: string;
}

export const supportApi = {
  createTicket: async (payload: CreateTicketPayload): Promise<CreateTicketResponse> => {
    const form = new FormData();
    form.append('nom',         payload.nom);
    form.append('email',       payload.email);
    form.append('siteNom',     payload.siteNom);
    form.append('role',        payload.role);
    form.append('type',        payload.type);
    form.append('sujet',       payload.sujet);
    form.append('description', payload.description);
    if (payload.systemInfo) form.append('systemInfo', payload.systemInfo);
    if (payload.screenshot)  form.append('screenshot', payload.screenshot);

    const res = await api.post<CreateTicketResponse>('/support/ticket', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface Medico {
  id: string;
  name: string | null;
  role: string | null;
}

export interface Passagem {
  id: string;
  profissional_id: string;
  medico_id: string;
  patient_ids: string[];
  observacao: string | null;
  turno: string | null;
  created_at: string;
  medico?: { name: string | null; role: string | null } | null;
  profissional?: { name: string | null } | null;
}

const ROLES_MEDICOS = ['Médico', 'Médica', 'Médico(a) Plantonista'];

export const passagensService = {
  async getMedicos(): Promise<Medico[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role')
      .in('role', ROLES_MEDICOS)
      .order('name');
    if (error) { logError(error, 'passagensService.getMedicos'); return []; }
    return (data || []) as Medico[];
  },

  async criar(profissionalId: string, medicoId: string, patientIds: string[], observacao?: string, turno?: string): Promise<boolean> {
    const { error } = await supabase
      .from('passagens')
      .insert({
        profissional_id: profissionalId,
        medico_id: medicoId,
        patient_ids: patientIds,
        observacao: observacao || null,
        turno: turno || null,
      });
    if (error) { logError(error, 'passagensService.criar'); return false; }
    return true;
  },

  async getToday(): Promise<Passagem[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('passagens')
      .select('*, medico:medico_id(name, role), profissional:profissional_id(name)')
      .gte('created_at', start.toISOString())
      .order('created_at', { ascending: false });
    if (error) { logError(error, 'passagensService.getToday'); return []; }
    return (data || []) as Passagem[];
  },

  async getAll(): Promise<Passagem[]> {
    const { data, error } = await supabase
      .from('passagens')
      .select('*, medico:medico_id(name, role), profissional:profissional_id(name)')
      .order('created_at', { ascending: false });
    if (error) { logError(error, 'passagensService.getAll'); return []; }
    return (data || []) as Passagem[];
  },
};

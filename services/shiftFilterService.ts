import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export type ShiftType = 'morning' | 'afternoon' | 'night';

interface ShiftFilter {
  shift: ShiftType;
  label: string;
  horaInicio: number; // 0-23 em formato 24h
  horaFim: number;    // 0-23 em formato 24h
}

export const shiftFilterService = {
  // Turnos definidos
  SHIFTS: {
    morning: {
      shift: 'morning',
      label: '🌅 Manhã',
      horaInicio: 7,
      horaFim: 13
    },
    afternoon: {
      shift: 'afternoon',
      label: '☀️ Tarde',
      horaInicio: 13,
      horaFim: 19
    },
    night: {
      shift: 'night',
      label: '🌙 Noite',
      horaInicio: 19,
      horaFim: 7 // Nota: passa meia-noite (19-23:59 e 00:00-07:00)
    }
  } as Record<ShiftType, ShiftFilter>,

  /**
   * Filtrar alertas por turno de criação
   * Manhã: 7:01 - 13:00
   * Tarde: 13:01 - 19:00
   * Noite: 19:01 - 07:00
   */
  async getAlertasByShift(
    patientId: string,
    shift: ShiftType
  ): Promise<any[]> {
    try {
      console.log(`🔍 Filtrando alertas for patient=${patientId}, shift=${shift}`);

      const { data, error } = await supabase
        .from('alertas_paciente_view_completa')
        .select('*')
        .eq('patient_id', patientId)
        .eq('shift_criacao', shift)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao filtrar alertas por turno:', error);
        logError(error, 'shiftFilterService.getAlertasByShift');
        return [];
      }

      console.log(`✅ ${data?.length || 0} alertas encontrados para ${shift}`);
      return data || [];
    } catch (error) {
      console.error('❌ Exception em getAlertasByShift:', error);
      logError(error, 'shiftFilterService.getAlertasByShift');
      return [];
    }
  },

  /**
   * Filtrar tarefas por turno de criação
   */
  async getTasksByShift(
    patientId: string,
    shift: ShiftType
  ): Promise<any[]> {
    try {
      console.log(`🔍 Filtrando tarefas for patient=${patientId}, shift=${shift}`);

      const { data, error } = await supabase
        .from('tasks_view_horario_br')
        .select('*')
        .eq('patient_id', patientId)
        .eq('shift_criacao', shift)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao filtrar tarefas por turno:', error);
        logError(error, 'shiftFilterService.getTasksByShift');
        return [];
      }

      console.log(`✅ ${data?.length || 0} tarefas encontradas para ${shift}`);
      return data || [];
    } catch (error) {
      console.error('❌ Exception em getTasksByShift:', error);
      logError(error, 'shiftFilterService.getTasksByShift');
      return [];
    }
  },

  /**
   * Obter todos os alertas/tarefas de um paciente, agrupados por turno
   */
  async getAlertasGroupedByShift(patientId: string): Promise<Record<ShiftType, any[]>> {
    try {
      const [morning, afternoon, night] = await Promise.all([
        this.getAlertasByShift(patientId, 'morning'),
        this.getAlertasByShift(patientId, 'afternoon'),
        this.getAlertasByShift(patientId, 'night')
      ]);

      return {
        morning,
        afternoon,
        night
      };
    } catch (error) {
      console.error('❌ Exception em getAlertasGroupedByShift:', error);
      logError(error, 'shiftFilterService.getAlertasGroupedByShift');
      return {
        morning: [],
        afternoon: [],
        night: []
      };
    }
  },

  /**
   * Obter todos as tarefas de um paciente, agrupadas por turno
   */
  async getTasksGroupedByShift(patientId: string): Promise<Record<ShiftType, any[]>> {
    try {
      const [morning, afternoon, night] = await Promise.all([
        this.getTasksByShift(patientId, 'morning'),
        this.getTasksByShift(patientId, 'afternoon'),
        this.getTasksByShift(patientId, 'night')
      ]);

      return {
        morning,
        afternoon,
        night
      };
    } catch (error) {
      console.error('❌ Exception em getTasksGroupedByShift:', error);
      logError(error, 'shiftFilterService.getTasksGroupedByShift');
      return {
        morning: [],
        afternoon: [],
        night: []
      };
    }
  },

  /**
   * Determinar turno baseado em uma hora
   */
  getShiftFromHour(hour: number): ShiftType {
    if (hour >= 7 && hour < 13) return 'morning';
    if (hour >= 13 && hour < 19) return 'afternoon';
    return 'night';
  },

  /**
   * Obter rótulo formatado do turno
   */
  getShiftLabel(shift: ShiftType): string {
    return this.SHIFTS[shift].label;
  }
};

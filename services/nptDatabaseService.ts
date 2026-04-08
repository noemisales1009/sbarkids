import { supabase } from '../lib/supabase'

// NPT Database Types (inline to avoid dependency on external types file)
type NPTCalculationInsert = {
  id?: string
  patient_id: string
  user_id: string
  weight: number
  date_of_birth: string
  amino_acid_dose: number
  lipid_dose: number
  calorie_nitrogen_ratio: number
  hydration_target: number
  protein_concentration: number
  lipid_concentration: number
  glucose_source_1: number
  glucose_source_2: number
  sodium_dose: number
  potassium_dose: number
  calcium_dose: number
  magnesium_dose: number
  phosphorus_dose: number
  phosphorus_source: 'sodium' | 'potassium'
  npt_stages: 1 | 2 | 4
  total_volume?: number | null
  total_calories?: number | null
  glucose_concentration_final?: number | null
  osmolarity?: number | null
  calcium_concentration_meq_per_liter?: number | null
  magnesium_concentration_meq_per_liter?: number | null
  divalent_trivalent_cations_concentration?: number | null
  peripheral_route_warning?: boolean | null
  notes?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  [key: string]: any
}

// ==================== CÁLCULOS NPT ====================

/**
 * Salva um novo cálculo de NPT
 */
export const saveNPTCalculation = async (calculation: NPTCalculationInsert) => {
  // Busca o usuário autenticado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('npt_calculations')
    .insert({
      ...calculation,
      user_id: user.id
    } as any)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Busca todos os cálculos de um paciente
 */
export const getPatientCalculations = async (patientId: string) => {
  const { data, error } = await supabase
    .from('npt_calculations')
    .select(`
      *,
      patients (
        name,
        bed_number,
        dob
      ),
      users (
        name,
        email
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Busca um cálculo específico por ID
 */
export const getCalculationById = async (id: string) => {
  const { data, error } = await supabase
    .from('npt_calculations')
    .select(`
      *,
      patients (
        name,
        bed_number,
        dob,
        peso
      ),
      users (
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Atualiza um cálculo existente
 */
export const updateCalculation = async (
  id: string,
  updates: Record<string, any>
) => {
  const { data, error } = await supabase
    .from('npt_calculations')
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Altera o status de um cálculo
 */
export const updateCalculationStatus = async (
  id: string,
  status: 'ativo' | 'revisado' | 'cancelado',
  notes?: string
) => {
  const updates: any = { status }
  if (notes) updates.notes = notes

  return updateCalculation(id, updates)
}

/**
 * Busca os últimos cálculos (todos os pacientes)
 */
export const getRecentCalculations = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('npt_calculations_with_patient')
    .select('*')
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Busca cálculos por status
 */
export const getCalculationsByStatus = async (status: string) => {
  const { data, error } = await supabase
    .from('npt_calculations')
    .select(`
      *,
      patients (name, bed_number),
      users (name)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

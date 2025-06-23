import { createClient } from '@/utils/supabase/client';
import type { KPIData } from '@/types';

export const fetchKPIData = async (): Promise<KPIData | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('kpi_summary')
    .select('*')
    .single();

  if (error) {
    console.error('Errore fetch KPI:', error.message);
    return null;
  }

  return data;
};

import type { Database as SupabaseDatabase } from '../lib/database';

export type Database = SupabaseDatabase;

export type Tables = Database['public']['Tables'];
export type CandidatesTable = Tables['candidates']['Row'];
export type InsertCandidate = Tables['candidates']['Insert'];
export type UpdateCandidate = Tables['candidates']['Update'];
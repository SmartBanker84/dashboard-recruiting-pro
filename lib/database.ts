

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string;
          name: string;
          email: string;
          status: string;
          created_at: string;
          recruiter_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          status?: string;
          created_at?: string;
          recruiter_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          status?: string;
          created_at?: string;
          recruiter_id?: string;
        };
      };
      // Add additional tables as needed...
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
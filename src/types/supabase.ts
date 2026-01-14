export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            config: {
                Row: {
                    key: string
                    value: Json | null
                }
                Insert: {
                    key: string
                    value?: Json | null
                }
                Update: {
                    key?: string
                    value?: Json | null
                }
                Relationships: []
            }
            leads: {
                Row: {
                    budget_range: string | null
                    company: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    name: string | null
                    project_type: string | null
                    requirements: string | null
                    status: string | null
                    stripe_session_id: string | null
                }
                Insert: {
                    budget_range?: string | null
                    company?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name?: string | null
                    project_type?: string | null
                    requirements?: string | null
                    status?: string | null
                    stripe_session_id?: string | null
                }
                Update: {
                    budget_range?: string | null
                    company?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name?: string | null
                    project_type?: string | null
                    requirements?: string | null
                    status?: string | null
                    stripe_session_id?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    company_name: string | null
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                }
                Insert: {
                    company_name?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                }
                Update: {
                    company_name?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

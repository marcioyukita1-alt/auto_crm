export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            chat_messages: {
                Row: {
                    content: string
                    created_at: string | null
                    id: string
                    role: string
                    session_id: string
                    user_id: string | null
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    id?: string
                    role: string
                    session_id: string
                    user_id?: string | null
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    id?: string
                    role?: string
                    session_id?: string
                    user_id?: string | null
                }
                Relationships: []
            }
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
                    whatsapp: string | null
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
                    role: string | null
                }
                Insert: {
                    company_name?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    role?: string | null
                }
                Update: {
                    company_name?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    role?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
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

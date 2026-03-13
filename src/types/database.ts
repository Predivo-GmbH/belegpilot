/** Supabase Database type definitions — generated from schema */

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          plan: 'starter' | 'professional' | 'enterprise'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          documents_this_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan?: 'starter' | 'professional' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          documents_this_month?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan?: 'starter' | 'professional' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          documents_this_month?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role: 'owner' | 'member' | 'viewer'
          created_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role?: 'owner' | 'member' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string
          role?: 'owner' | 'member' | 'viewer'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      clients: {
        Row: {
          id: string
          organization_id: string
          name: string
          contact_email: string | null
          address: string | null
          erp_target: 'csv' | 'bexio' | 'abacus' | 'sage' | 'banana'
          erp_settings: Record<string, unknown> | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          contact_email?: string | null
          address?: string | null
          erp_target?: 'csv' | 'bexio' | 'abacus' | 'sage' | 'banana'
          erp_settings?: Record<string, unknown> | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          contact_email?: string | null
          address?: string | null
          erp_target?: 'csv' | 'bexio' | 'abacus' | 'sage' | 'banana'
          erp_settings?: Record<string, unknown> | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'clients_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          client_id: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          status: 'uploading' | 'processing' | 'review' | 'verified' | 'exported' | 'error'
          extracted_data: Record<string, unknown> | null
          confidence_scores: Record<string, number> | null
          account_number: string | null
          contra_account: string | null
          vat_rate: number | null
          amount: number | null
          currency: string | null
          document_date: string | null
          supplier_name: string | null
          supplier_iban: string | null
          supplier_vat_number: string | null
          qr_data: Record<string, unknown> | null
          ai_model: string | null
          ai_cost: number | null
          processing_duration_ms: number | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id?: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          status?: 'uploading' | 'processing' | 'review' | 'verified' | 'exported' | 'error'
          extracted_data?: Record<string, unknown> | null
          confidence_scores?: Record<string, number> | null
          account_number?: string | null
          contra_account?: string | null
          vat_rate?: number | null
          amount?: number | null
          currency?: string | null
          document_date?: string | null
          supplier_name?: string | null
          supplier_iban?: string | null
          supplier_vat_number?: string | null
          qr_data?: Record<string, unknown> | null
          ai_model?: string | null
          ai_cost?: number | null
          processing_duration_ms?: number | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          status?: 'uploading' | 'processing' | 'review' | 'verified' | 'exported' | 'error'
          extracted_data?: Record<string, unknown> | null
          confidence_scores?: Record<string, number> | null
          account_number?: string | null
          contra_account?: string | null
          vat_rate?: number | null
          amount?: number | null
          currency?: string | null
          document_date?: string | null
          supplier_name?: string | null
          supplier_iban?: string | null
          supplier_vat_number?: string | null
          qr_data?: Record<string, unknown> | null
          ai_model?: string | null
          ai_cost?: number | null
          processing_duration_ms?: number | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      exports: {
        Row: {
          id: string
          organization_id: string
          client_id: string | null
          erp_target: 'csv' | 'bexio' | 'abacus' | 'sage' | 'banana'
          document_ids: string[]
          file_path: string | null
          status: 'pending' | 'completed' | 'error'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id?: string | null
          erp_target: 'csv' | 'bexio' | 'abacus' | 'sage' | 'banana'
          document_ids?: string[]
          file_path?: string | null
          status?: 'pending' | 'completed' | 'error'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string | null
          erp_target?: 'csv' | 'bexio' | 'abacus' | 'sage' | 'banana'
          document_ids?: string[]
          file_path?: string | null
          status?: 'pending' | 'completed' | 'error'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'exports_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exports_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      vendor_patterns: {
        Row: {
          id: string
          organization_id: string
          vendor_name: string
          default_account: string
          default_contra_account: string | null
          default_vat_rate: number | null
          match_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          vendor_name: string
          default_account: string
          default_contra_account?: string | null
          default_vat_rate?: number | null
          match_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          vendor_name?: string
          default_account?: string
          default_contra_account?: string | null
          default_vat_rate?: number | null
          match_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vendor_patterns_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

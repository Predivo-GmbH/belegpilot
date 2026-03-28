import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '@/types/database'

type DocumentRow = Database['public']['Tables']['documents']['Row']
export type DocumentWithClient = DocumentRow & { clients: { name: string } | null }

/** Escape special PostgREST filter characters to prevent injection. */
function sanitizeSearch(raw: string): string {
  return raw.replace(/[%_*(),.'"\\]/g, '')
}

export function useDocuments(filters?: { status?: string; search?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['documents', user?.id, filters],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*, clients(name)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as DocumentRow['status'])
      }

      if (filters?.search) {
        const safe = sanitizeSearch(filters.search)
        if (safe.length > 0) {
          query = query.or(`file_name.ilike.%${safe}%,supplier_name.ilike.%${safe}%`)
        }
      }

      const { data, error } = await query
      if (error) throw error
      return data as unknown as DocumentWithClient[]
    },
  })
}

export function useDocument(id: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['document', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      if (!id) throw new Error('No document ID')
      const { data, error } = await supabase
        .from('documents')
        .select('*, clients(name)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as unknown as DocumentWithClient
    },
  })
}

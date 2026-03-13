import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '@/types/database'

type DocumentRow = Database['public']['Tables']['documents']['Row']
export type DocumentWithClient = DocumentRow & { clients: { name: string } | null }

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
        query = query.or(`file_name.ilike.%${filters.search}%,supplier_name.ilike.%${filters.search}%`)
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
      const { data, error } = await supabase
        .from('documents')
        .select('*, clients(name)')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as unknown as DocumentWithClient
    },
  })
}

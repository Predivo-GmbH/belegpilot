import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { DocumentWithClient } from './useDocuments'

interface DashboardStats {
  totalDocuments: number
  processedDocuments: number
  reviewDocuments: number
  totalAmount: number
}

export function useDashboardStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [totalRes, processedRes, reviewRes, amountRes] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('documents').select('id', { count: 'exact', head: true }).in('status', ['verified', 'exported']),
        supabase.from('documents').select('id', { count: 'exact', head: true }).eq('status', 'review'),
        supabase.from('documents').select('amount').in('status', ['verified', 'exported']),
      ])

      const totalAmount = (amountRes.data ?? []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0)

      return {
        totalDocuments: totalRes.count ?? 0,
        processedDocuments: processedRes.count ?? 0,
        reviewDocuments: reviewRes.count ?? 0,
        totalAmount,
      } satisfies DashboardStats
    },
  })
}

export function useRecentDocuments() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['recent-documents', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, clients(name)')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data as unknown as DocumentWithClient[]
    },
  })
}

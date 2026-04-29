import { useUser } from '@auth0/nextjs-auth0/client'
import { useState, useEffect, useCallback } from 'react'

interface Transaction {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  description?: string
  createdAt: string
}

export function useTransactions() {
  const { user, isLoading: userLoading } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const res = await fetch("/api/transactions")
      const data = await res.json()
      setTransactions(data.transactions || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!userLoading) {
      fetchTransactions()
    }
  }, [user, userLoading, fetchTransactions])

  return { transactions, loading: loading || userLoading, error, refetch: fetchTransactions }
}